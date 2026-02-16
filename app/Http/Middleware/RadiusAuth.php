<?php

namespace App\Http\Middleware;

use Closure;

class RadiusAuth
{
    public function handle($request, Closure $next)
    {
        $key = $request->header('X-API-KEY');

        // Accepter les requêtes du réseau Docker interne (FreeRADIUS)
        $clientIp = $request->ip();
        if (str_starts_with($clientIp, '172.') || str_starts_with($clientIp, '10.') || $clientIp === '127.0.0.1') {
            return $next($request);
        }

        if ($key !== config('services.radius.key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}

