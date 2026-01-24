<?php

namespace App\Providers;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Session;
use App\Models\Voucher;

class SessionService
{
    /**
     * Créer une session réseau
     */
    public function createSession(Voucher $voucher, string $deviceMac = null, string $ip = null): array
    {
        $durationMinutes = $voucher->plan->duration_minutes;
        $expiresAt = now()->addMinutes($durationMinutes);

        $sessionId = Str::uuid();

        $payload = [
            'session_id' => $sessionId,
            'voucher' => $voucher->code,
            'plan_id' => $voucher->plan_id,
            'expires_at' => $expiresAt->timestamp,
            'device_mac' => $deviceMac,
            'ip' => $ip,
        ];

        $ttl = $durationMinutes * 60;

        // Redis (temps réel)
        Redis::setex("session:{$sessionId}", $ttl, json_encode($payload));

        // DB (audit) - Create WiFi session record
        $session = Session::create([
            'voucher_id' => $voucher->id,
            'username' => 'guest',
            'mac_address' => $deviceMac,
            'ip_address' => $ip,
            'started_at' => now(),
            'status' => 'active',
        ]);

        return [
            'id' => $session->id,
            'session_id' => $sessionId,
            'voucher_code' => $voucher->code,
            'plan_id' => $voucher->plan_id,
            'expires_at' => $expiresAt,
            'duration_minutes' => $durationMinutes,
        ];
    }

    /**
     * Vérifier si une session est valide
     */
    public function validateSession(string $sessionId): bool
    {
        return Redis::exists("session:{$sessionId}");
    }

    /**
     * Forcer la déconnexion
     */
    public function terminateSession(string $sessionId): void
    {
        Redis::del("session:{$sessionId}");

        Session::where('id', $sessionId)->update([
            'ended_at' => now()
        ]);
    }
}
