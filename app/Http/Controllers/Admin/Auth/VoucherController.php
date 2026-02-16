<?php

namespace App\Http\Controllers\Admin\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Providers\VoucherService;
use App\Models\Voucher;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VoucherController extends Controller
{
    protected $voucherService;

    public function __construct(VoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }

    /**
     * Générer des vouchers
     */
    public function generate(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'quantity' => 'required|integer|min:1|max:1000',
        ]);

        $vouchers = $this->voucherService->generateVouchers(
            $request->plan_id,
            $request->quantity
        );

        return response()->json([
            'success' => true,
            'data' => $vouchers,
        ]);
    }

    /**
     * Activer un voucher
     */
    public function activate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'device_mac' => 'required|string',
            'ip_address' => 'required|ip',
        ]);

        // Chercher le voucher
        $voucher = Voucher::with('plan')->where('code', $request->code)
            ->where('status', 'unused')
            ->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher invalide ou déjà utilisé'
            ], 404);
        }

        // Vérifier le plan associé
        $plan = $voucher->plan;
        
        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan associé non trouvé'
            ], 404);
        }

        // Vérifier la durée du plan
        if (!$plan->duration_minutes || $plan->duration_minutes <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Durée du plan invalide'
            ], 400);
        }

        // Générer la session
        $sessionId = (string) Str::uuid();
        $expiresAt = now()->addMinutes($plan->duration_minutes);
        $ttl = now()->diffInSeconds($expiresAt);

        if ($ttl <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'La durée du voucher a expiré'
            ], 400);
        }

        $ttl = (int) $ttl;

        // Préparer les données de session
        $payload = [
            'id' => $sessionId,
            'voucher_code' => $voucher->code,
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'duration_minutes' => $plan->duration_minutes,
            ],
            'ip' => $request->ip_address,
            'mac' => $request->device_mac,
            'started_at' => now()->toDateTimeString(),
            'expires_at' => $expiresAt->toDateTimeString(),
            'status' => 'active',
        ];

        try {
            // Stocker en Redis avec SETEX
            Redis::setex("session:{$sessionId}", $ttl, json_encode($payload));
            
        } catch (\Exception $e) {
            \Log::error('Redis SETEX error', [
                'error' => $e->getMessage(),
                'ttl' => $ttl,
                'session_id' => $sessionId,
                'plan_duration' => $plan->duration_minutes
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation de la session',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }

        // Créer session dans PostgreSQL
        try {
            \App\Models\Session::create([
                'id' => $sessionId,
                'voucher_id' => $voucher->id,
                'username' => 'web-user',
                'ip_address' => $request->ip_address,
                'mac_address' => $request->device_mac,
                'status' => 'active',
                'started_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Session DB creation error', ['error' => $e->getMessage()]);
        }

        // Mettre à jour le voucher
        try {
            $voucher->update([
                'status' => 'used',
                'used_at' => now(),
                'activated_by_mac' => $request->device_mac,
                'activated_ip' => $request->ip_address,
            ]);
        } catch (\Exception $e) {
            \Log::error('Voucher update error', [
                'error' => $e->getMessage(),
                'voucher_id' => $voucher->id,
            ]);
            
            Redis::del("session:{$sessionId}");
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du voucher'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Voucher activé avec succès',
            'session' => $payload,
            'session_id' => $sessionId,
            'ttl' => $ttl,
            'expires_in_minutes' => $plan->duration_minutes,
        ], 201);
    }

    public function index(Request $request)
    {
        $vouchers = Voucher::query()
            ->when($request->plan_id, fn($q) => $q->where('plan_id', $request->plan_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->get();

        return response()->json($vouchers);
    }

    public function userVouchers($userId)
    {
        $vouchers = Voucher::where('user_id', $userId)
            ->where('status', 'used')
            ->get();

        return response()->json($vouchers);
    }
}