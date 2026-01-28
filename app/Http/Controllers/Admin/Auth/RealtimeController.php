<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeController extends Controller
{
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

    public function stream()
    {
        return new StreamedResponse(function () {
            while (true) {
                try {
                    $prefix = $this->getRedisPrefix();
                    
                    // Rechercher les clés avec le pattern correct
                    $rawKeys = Redis::keys('session:*');
                    
                    // Journaliser pour le débogage (à commenter en production)
                    \Log::debug('Redis keys found', [
                        'raw_keys' => $rawKeys,
                        'prefix' => $prefix,
                        'count' => count($rawKeys)
                    ]);
                    
                    $sessions = [];
                    
                    foreach ($rawKeys as $rawKey) {
                        // Enlever le préfixe Laravel pour utiliser avec Redis::get()
                        $key = $this->stripPrefix($rawKey);
                        
                        $raw = Redis::get($key);
                        if ($raw) {
                            $sessionData = json_decode($raw, true);
                            
                            // Filtrer les sessions expirées
                            if (isset($sessionData['expires_at']) && $sessionData['expires_at'] < now()->timestamp) {
                                // Session expirée, la supprimer
                                Redis::del($key);
                                continue;
                            }
                            
                            $sessions[] = $sessionData;
                        } else {
                            // La clé existe peut-être mais avec le préfixe dans la recherche
                            // Essayer de lire directement avec la clé complète
                            $raw = Redis::get($rawKey);
                            if ($raw) {
                                $sessionData = json_decode($raw, true);
                                
                                if (isset($sessionData['expires_at']) && $sessionData['expires_at'] < now()->timestamp) {
                                    Redis::del($rawKey);
                                    continue;
                                }
                                
                                $sessions[] = $sessionData;
                            }
                        }
                    }

                    // Journaliser le résultat
                    \Log::debug('Sessions fetched', [
                        'count' => count($sessions),
                        'sessions' => $sessions
                    ]);

                    echo "data: " . json_encode($sessions) . "\n\n";

                    ob_flush();
                    flush();
                } catch (\Exception $e) {
                    \Log::error('Realtime stream error', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    // Envoyer un message d'erreur au client
                    echo "data: " . json_encode(['error' => 'Erreur de connexion Redis']) . "\n\n";
                    ob_flush();
                    flush();
                    
                    // Attendre un peu avant de réessayer
                    sleep(5);
                }
                
                sleep(2);
            }

        }, 200, [
            "Content-Type" => "text/event-stream",
            "Cache-Control" => "no-cache",
            "Connection" => "keep-alive",
        ]);
    }
}

