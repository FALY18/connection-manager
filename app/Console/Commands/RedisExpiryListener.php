<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RedisExpiryListener extends Command
{
    protected $signature = 'redis:listen-expired';
    protected $description = 'Listen Redis expired session keys and handle cleanup';

    protected bool $running = true;

    public function handle()
    {
        // Gestion arrêt propre (CTRL+C)
        if (extension_loaded('pcntl')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGINT, fn () => $this->shutdown());
            pcntl_signal(SIGTERM, fn () => $this->shutdown());
        }

        $this->info('🔴 Redis Expiry Listener started');

        // Vérification Redis (one-time check)
        $this->checkRedisConfig();

        while ($this->running) {
            try {
                $redis = Redis::connection('default')->client();

                $pattern = '__keyevent@0__:expired';
                $this->info("📡 Subscribed to {$pattern}");

                $redis->psubscribe([$pattern], function ($message) {
                    $this->handleExpiredKey($message);
                });
            } catch (\Throwable $e) {
                $this->error("Redis subscription failed: " . $e->getMessage());
                if ($this->running) {
                    $this->warn("Retrying in 5 seconds...");
                    sleep(5);
                }
            }
        }

        return 0;
    }

    protected function shutdown(): void
    {
        $this->running = false;
        $this->info("\n🛑 Listener stopped");
        exit(0);
    }

    protected function checkRedisConfig(): void
    {
        try {
            $value = Redis::command('CONFIG', ['GET', 'notify-keyspace-events'])[1] ?? '';
            $this->info("Redis notify-keyspace-events = {$value}");

            if (!str_contains($value, 'E')) {
                $this->warn('⚠️ Expired events NOT enabled');
                $this->warn('Run: redis-cli CONFIG SET notify-keyspace-events Ex');
            } else {
                $this->info('✅ Redis expiration events enabled');
            }

            $this->info('Redis prefix: ' . config('database.redis.options.prefix'));

        } catch (\Throwable $e) {
            $this->error('Redis config check failed: ' . $e->getMessage());
        }
    }

    protected function handleExpiredKey(string $key): void
    {
        $this->info("⏱️ Key expired: {$key}");

        $sessionId = $this->extractSessionId($key);

        if (!$sessionId) {
            $this->warn("Ignored key (not a session): {$key}");
            return;
        }

        // 1️⃣ Marquer la session comme expirée (DB)
        $this->expireDatabaseSession($sessionId);

        // 2️⃣ Notifier dashboard / RADIUS
        $this->publishEvent($sessionId);
    }

    protected function extractSessionId(string $key): ?string
    {
        $prefix = config('database.redis.options.prefix', '');

        if ($prefix && str_starts_with($key, $prefix)) {
            $key = substr($key, strlen($prefix));
        }

        if (str_starts_with($key, 'session:')) {
            return substr($key, strlen('session:'));
        }

        return null;
    }

    protected function expireDatabaseSession(string $sessionId): void
    {
        try {
            \DB::table('sessions')
                ->where('id', $sessionId)
                ->update([
                    'ended_at' => now(),
                    'status' => 'expired',
                ]);

            $this->info("✅ Session {$sessionId} expired");

        } catch (\Throwable $e) {
            Log::error('DB session expiration failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function publishEvent(string $sessionId): void
    {
        Redis::publish('session:expired', json_encode([
            'type' => 'session_expired',
            'session_id' => $sessionId,
            'timestamp' => now()->toIso8601String(),
        ]));

        $this->info("📢 Event published for {$sessionId}");
    }
}
