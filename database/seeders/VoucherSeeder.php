<?php

namespace Database\Seeders;

use App\Models\Voucher;
use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        Voucher::query()->delete();

        $plan = Plan::first();

        Voucher::create([
            'id' => Str::uuid(),
            'code' => 'TEST-1001',
            'plan_id' => $plan->id,
            'status' => 'unused',
        ]);

        Voucher::create([
            'id' => Str::uuid(),
            'code' => 'TEST-1002',
            'plan_id' => $plan->id,
            'status' => 'used',
            'used_at' => now()->subMinutes(30),
        ]);
    }
}
