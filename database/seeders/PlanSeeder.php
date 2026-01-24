<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::truncate();

        Plan::create([
            'name' => '2h30',
            'duration_minutes' => 150,
            'data_limit_gb' => 1,
            'max_devices' => 1,
            'price' => 1000,
            'is_active' => true,
        ]);

        Plan::create([
            'name' => '1 Journée',
            'duration_minutes' => 1440,
            'data_limit_gb' => 10,
            'max_devices' => 2,
            'price' => 3000,
            'is_active' => true,
        ]);

        Plan::create([
            'name' => '1 Semaine',
            'duration_minutes' => 10080,
            'data_limit_gb' => 40,
            'max_devices' => 5,
            'price' => 15000,
            'is_active' => true,
        ]);
    }
}

