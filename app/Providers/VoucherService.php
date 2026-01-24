<?php

namespace App\Providers;

use App\Providers\SessionService;
use App\Models\Voucher;
use App\Models\Plan;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redis;

class VoucherService
{
    /**
     * Générer plusieurs vouchers et les stocker directement en base de données
     */
    public function generateVouchers($planId, int $quantity = 1): array
    {
        $plan = Plan::findOrFail($planId);
        $vouchers = [];

        for ($i = 0; $i < $quantity; $i++) {
            $code = $this->generateUniqueCode($plan->id, $i);

            // Create voucher directly in database with 'unused' status
            $voucher = Voucher::create([
                'code' => $code,
                'plan_id' => $plan->id,
                'status' => 'unused',
            ]);

            $vouchers[] = [
                'id' => $voucher->id,
                'plan_id' => $plan->id,
                'code' => $code,
                'status' => 'unused'
            ];
        }

        return $vouchers;
    }

    /**
     * Activer un voucher - lookup by code and create WiFi session
     */
    public function activateVoucher(string $code, string $mac = null, string $ip = null): array|false
    {
        // Find voucher by code
        $voucher = Voucher::where('code', $code)->where('status', 'unused')->first();

        if (!$voucher) {
            return false;
        }

        // Mark voucher as used
        $voucher->update([
            'status' => 'used',
            'used_at' => now(),
            'activated_by_mac' => $mac,
            'activated_ip' => $ip,
        ]);

        // Create WiFi session
        try {
            $sessionService = app(SessionService::class);
            return $sessionService->createSession($voucher, $mac, $ip);
        } catch (\Exception $e) {
            // Revert voucher status if session creation fails
            $voucher->update(['status' => 'unused']);
            return false;
        }
    }

    private function generateUniqueCode($planId, int $index): string
    {
        // Generate unique code with timestamp + random for true uniqueness
        $timestamp = microtime(true) * 10000;
        $random = mt_rand(1000, 9999);
        $hash = substr(md5($planId . $timestamp . $random), 0, 6);
        return strtoupper($hash . sprintf('%04d', $random));
    }
}
