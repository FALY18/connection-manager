<?php

namespace App\Http\Controllers\Admin\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Providers\VoucherService;
use App\Models\Voucher;

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
            'mac' => 'nullable|string',
            'ip' => 'nullable|ip',
        ]);

        $session = $this->voucherService->activateVoucher(
            $request->code,
            $request->mac,
            $request->ip
        );

        if (!$session) {
            return response()->json(['error' => 'Invalid or expired voucher'], 422);
        }

        return response()->json([
            'message' => 'Access granted',
            'session' => $session
        ]);
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
