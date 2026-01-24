<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class SeedSessionsRedis extends Command
{
    protected $signature = 'seed:sessions';
    protected $description = 'Seed fake sessions in Redis';

    public function handle()
    {
        if (!extension_loaded('redis')) {
            $this->warn('Redis extension is not installed. Skipping Redis session seeding.');
            return;
        }

        try {
            Redis::set('session:test1', json_encode([
                'voucher' => 'TEST-1001',
                'ip' => '192.168.1.10',
                'started_at' => now(),
            ]));

            Redis::set('session:test2', json_encode([
                'voucher' => 'TEST-1002',
                'ip' => '192.168.1.11',
                'started_at' => now()->subMinutes(15),
            ]));

            $this->info('Redis sessions seeded');
        } catch (\Exception $e) {
            $this->warn('Could not connect to Redis: ' . $e->getMessage());
        }
    }
}
