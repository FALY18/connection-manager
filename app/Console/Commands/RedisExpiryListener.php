<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Services\RadiusCoAService;
use App\Models\Session;

class RedisExpiryListener extends Command
{
    protected $signature = 'redis:listen-expired 
                            {--test : Test mode with dummy key} 
                            {--once : Process once and exit}';
    
    protected $description = 'Listen Redis expired session keys and handle cleanup';
    
    protected bool $running = true;
    protected RadiusCoAService $coaService;
    
    public function __construct()
    {
        parent::__construct();
        $this->coaService = new RadiusCoAService();
    }
    
    public function handle()
    {
        if ($this->option('test')) {
            $this->testExpiration();
            return 0;
        }
        
        // Handle graceful shutdown
        if (extension_loaded('pcntl')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGINT, fn () => $this->shutdown());
            pcntl_signal(SIGTERM, fn () => $this->shutdown());
        }
        
        $this->info('🚀 Redis Expiry Listener started');
        $this->checkRedisConfig();
        
        $retryCount = 0;
        $maxRetries = 10;
        
        while ($this->running && $retryCount < $maxRetries) {
            try {
                $redis = Redis::connection()->client();
                
                $this->info("📡 Subscribing to expired keys events...");
                
                // Subscribe to expired events
                $redis->psubscribe(['__keyevent@*__:expired'], function ($message, $channel) {
                    $this->handleExpiredKey($message, $channel);
                });
                
                // Reset retry count on successful subscription
                $retryCount = 0;
                
            } catch (\Throwable $e) {
                $retryCount++;
                $this->error("Redis subscription failed (attempt {$retryCount}/{$maxRetries}): " . $e->getMessage());
                
                if ($this->running && $retryCount < $maxRetries) {
                    $waitTime = min(30, $retryCount * 5);
                    $this->warn("Retrying in {$waitTime} seconds...");
                    sleep($waitTime);
                }
            }
        }
        
        if ($retryCount >= $maxRetries) {
            $this->error("❌ Max retries reached. Exiting.");
            return 1;
        }
        
        return 0;
    }
    
    protected function shutdown(): void
    {
        $this->running = false;
        $this->info("\n🛑 Gracefully shutting down listener...");
        exit(0);
    }
    
    protected function checkRedisConfig(): void
    {
        try {
            $config = Redis::command('CONFIG', ['GET', 'notify-keyspace-events']);
            $value = $config[1] ?? '';
            
            $this->info("🔧 Redis Configuration:");
            $this->info("  notify-keyspace-events = {$value}");
            
            if (!str_contains($value, 'E') || !str_contains($value, 'x')) {
                $this->warn('⚠️  Expired events NOT properly enabled');
                $this->warn('   Run: redis-cli CONFIG SET notify-keyspace-events Ex');
                $this->warn('   Or add to redis.conf: notify-keyspace-events Ex');
            } else {
                $this->info('✅ Redis expiration events enabled');
            }
            
            $this->info('  Redis prefix: ' . config('database.redis.options.prefix', ''));
            $this->info('  Redis database: ' . config('database.redis.default.database', 0));
            
        } catch (\Throwable $e) {
            $this->error('❌ Redis config check failed: ' . $e->getMessage());
        }
    }
    
    protected function handleExpiredKey(string $key, string $channel): void
    {
        $this->info("⏰ Key expired: {$key} (channel: {$channel})");
        
        $sessionId = $this->extractSessionId($key);
        
        if (!$sessionId) {
            $this->warn("Ignored key (not a session): {$key}");
            return;
        }
        
        $this->processSessionExpiration($sessionId);
    }
    
    protected function processSessionExpiration(string $sessionId): void
    {
        try {
            // 1. Find session in database
            $session = Session::find($sessionId);
            
            if (!$session) {
                $this->error("Session {$sessionId} not found in database");
                
                // Still try to clean up any residual data
                $this->cleanupOrphanedSession($sessionId);
                return;
            }
            
            $this->info("Processing session expiration: {$sessionId}");
            $this->info("  User: {$session->voucher_code}");
            $this->info("  MAC: {$session->mac}");
            $this->info("  IP: {$session->ip}");
            
            // 2. Update database status
            $this->expireDatabaseSession($sessionId);
            
            // 3. Send CoA to disconnect user from CPE
            $this->sendCoADisconnect($session);
            
            // 4. Notify dashboard via Redis Pub/Sub
            $this->publishExpirationEvent($session);
            
            // 5. Log the expiration
            Log::info('Session auto-expired and CoA sent', [
                'session_id' => $sessionId,
                'voucher_code' => $session->voucher_code,
                'plan_id' => $session->plan_id,
                'ip' => $session->ip,
                'mac' => $session->mac,
                'duration' => $session->expires_at->diffInSeconds($session->started_at) . 's'
            ]);
            
            $this->info("✅ Session {$sessionId} processed successfully");
            
        } catch (\Throwable $e) {
            Log::error('Failed to process expired session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $this->error("❌ Error processing session {$sessionId}: " . $e->getMessage());
        }
    }
    
    protected function expireDatabaseSession(string $sessionId): void
    {
        $updated = \DB::table('sessions')
            ->where('id', $sessionId)
            ->whereIn('status', ['active', 'pending'])
            ->update([
                'status' => 'expired',
                'ended_at' => now(),
                'updated_at' => now(),
            ]);
        
        if ($updated) {
            $this->info("📝 Database session marked as expired");
        } else {
            $this->warn("⚠️ Session was already expired or not found in DB");
        }
    }
    
    protected function sendCoADisconnect(Session $session): void
    {
        try {
            $success = $this->coaService->sendCoAtoAirtelCPE(
                $session->id,
                $session->mac,
                $session->ip
            );
            
            if ($success) {
                $this->info("📡 CoA sent successfully to CPE");
            } else {
                $this->warn("⚠️ CoA may have failed (check logs)");
            }
            
        } catch (\Throwable $e) {
            $this->error("❌ CoA failed: " . $e->getMessage());
            Log::error('CoA sending failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    protected function publishExpirationEvent(Session $session): void
    {
        try {
            $eventData = [
                'type' => 'session_expired',
                'session_id' => $session->id,
                'voucher_code' => $session->voucher_code,
                'mac' => $session->mac,
                'ip' => $session->ip,
                'timestamp' => now()->toIso8601String(),
                'plan_id' => $session->plan_id
            ];
            
            Redis::publish('session:events', json_encode($eventData));
            $this->info("📢 Event published to session:events channel");
            
        } catch (\Throwable $e) {
            $this->warn("⚠️ Failed to publish event: " . $e->getMessage());
        }
    }
    
    protected function cleanupOrphanedSession(string $sessionId): void
    {
        // Clean up any leftover Redis keys
        $patterns = [
            "session:{$sessionId}",
            "session:data:{$sessionId}",
            "session:stats:{$sessionId}"
        ];
        
        foreach ($patterns as $pattern) {
            try {
                Redis::del($pattern);
            } catch (\Throwable $e) {
                // Ignore cleanup errors
            }
        }
    }
    
    protected function extractSessionId(string $key): ?string
    {
        $prefix = config('database.redis.options.prefix', '');
        
        // Remove Redis prefix if present
        if ($prefix && str_starts_with($key, $prefix)) {
            $key = substr($key, strlen($prefix));
        }
        
        // Check if it's a session key
        if (str_starts_with($key, 'session:')) {
            $sessionId = substr($key, strlen('session:'));
            
            // Validate UUID format
            if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $sessionId)) {
                return $sessionId;
            }
        }
        
        return null;
    }
    
    protected function testExpiration(): void
    {
        $this->info('🧪 Testing Redis expiration notifications...');
        
        // Create a test session
        $sessionId = (string) Str::uuid();
        $testData = [
            'id' => $sessionId,
            'voucher_code' => 'TEST-' . time(),
            'ip' => '192.168.1.100',
            'mac' => '00:11:22:33:44:55',
            'status' => 'test',
            'created_at' => now()->toIso8601String()
        ];
        
        $key = "session:{$sessionId}";
        $ttl = 3; // 3 seconds
        
        $this->info("Setting test key: {$key} with TTL: {$ttl}s");
        Redis::setex($key, $ttl, json_encode($testData));
        
        $this->info("Waiting for expiration... ({$ttl} seconds)");
        
        // Wait a bit longer than TTL
        sleep($ttl + 2);
        
        $this->info("Test complete. Check logs for expiration event.");
    }
}