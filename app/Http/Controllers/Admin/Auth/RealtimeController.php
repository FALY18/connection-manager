<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeController extends Controller
{
    /**
     * Heartbeat interval in seconds
     */
    protected int $heartbeatInterval = 15;

    /**
     * Maximum runtime in seconds (prevent memory leaks)
     */
    protected int $maxRuntime = 3600; // 1 hour

    /**
     * Obtenir le préfixe Redis configuré
     */
    protected function getRedisPrefix(): string
    {
        $config = config('database.redis.options.prefix');
        $appName = Str::slug(config('app.name', 'laravel'));
        return $config ?? ($appName . '-database-');
    }

    /**
     * Nettoyer une clé Redis en supprimant le préfixe
     */
    protected function stripPrefix(string $key): string
    {
        $prefix = $this->getRedisPrefix();
        if (Str::startsWith($key, $prefix)) {
            return substr($key, strlen($prefix));
        }
        return $key;
    }

    /**
     * Send a heartbeat comment to keep the connection alive
     */
    protected function sendHeartbeat(): void
    {
        echo ": heartbeat\n\n";
        ob_flush();
        flush();
    }

    /**
     * Send an event to the SSE client
     */
    protected function sendEvent(string $eventName, array $data): void
    {
        echo "event: {$eventName}\n";
        echo "data: " . json_encode($data) . "\n\n";
        ob_flush();
        flush();
    }

    public function stream(): StreamedResponse
    {
        return new StreamedResponse(function () {
            $startTime = time();
            $lastHeartbeat = $startTime;
            $connectionHealthy = true;

            // Set appropriate time limits
            set_time_limit(0);
            ignore_user_abort(false);

            // Send initial connection event
            $this->sendEvent('connected', [
                'message' => 'Connected to session stream',
                'timestamp' => now()->toIso8601String()
            ]);

            while (true) {
                // Check for client disconnect
                if (connection_aborted()) {
                    \Log::info('SSE client disconnected');
                    break;
                }

                // Check max runtime to prevent memory leaks
                if ((time() - $startTime) > $this->maxRuntime) {
                    \Log::info('SSE stream max runtime reached');
                    $this->sendEvent('closed', ['reason' => 'max_runtime_reached']);
                    break;
                }

                // Send heartbeat periodically
                if ((time() - $lastHeartbeat) > $this->heartbeatInterval) {
                    $this->sendHeartbeat();
                    $lastHeartbeat = time();
                }

                try {
                    $this->processSessions();
                } catch (\Exception $e) {
                    \Log::error('SSE stream session processing error', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);

                    if ($connectionHealthy) {
                        $this->sendEvent('error', [
                            'message' => 'Redis connection issue, retrying...'
                        ]);
                        $connectionHealthy = false;
                    }

                    // Wait before retrying
                    sleep(5);
                    $connectionHealthy = true;
                    continue;
                }

                sleep(2);
            }

            \Log::info('SSE stream ended');
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    /**
     * Process and send active sessions
     */
    protected function processSessions(): void
    {
        try {
            $prefix = $this->getRedisPrefix();
            
            // Get all session keys
            $pattern = $prefix . 'session:*';
            $rawKeys = Redis::keys('session:*');
            
            if (empty($rawKeys)) {
                $this->sendEvent('sessions', []);
                return;
            }

            $sessions = [];
            $expiredKeys = [];

            foreach ($rawKeys as $rawKey) {
                $key = $this->stripPrefix($rawKey);
                
                try {
                    $raw = Redis::get($key);
                    
                    if ($raw) {
                        $sessionData = json_decode($raw, true);
                        
                        // Check if session is expired
                        if ($this->isSessionExpired($sessionData)) {
                            $expiredKeys[] = $key;
                            continue;
                        }
                        
                        $sessions[] = $sessionData;
                    } else {
                        // Try with full prefixed key
                        $raw = Redis::get($rawKey);
                        if ($raw) {
                            $sessionData = json_decode($raw, true);
                            
                            if ($this->isSessionExpired($sessionData)) {
                                $expiredKeys[] = $rawKey;
                                continue;
                            }
                            
                            $sessions[] = $sessionData;
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning('Error reading session key', [
                        'key' => $key,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Clean up expired sessions
            foreach ($expiredKeys as $key) {
                try {
                    Redis::del($key);
                } catch (\Exception $e) {
                    // Ignore deletion errors
                }
            }

            // Send sessions update
            $this->sendEvent('sessions', $sessions);

            // Send expired event if any sessions expired
            if (!empty($expiredKeys)) {
                $this->sendEvent('expired_cleaned', [
                    'count' => count($expiredKeys),
                    'keys' => $expiredKeys
                ]);
            }

        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Check if a session is expired
     */
    protected function isSessionExpired(array $sessionData): bool
    {
        if (!isset($sessionData['expires_at'])) {
            return false;
        }

        return $sessionData['expires_at'] < now()->timestamp;
    }
}

