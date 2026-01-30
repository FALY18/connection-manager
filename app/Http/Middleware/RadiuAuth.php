<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RadiusAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') 
            ?? $request->query('api_key')
            ?? $request->bearerToken();

        if (!$apiKey || $apiKey !== config('services.radius.api_key')) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Invalid or missing API key'
            ], 401);
        }

        // Add client IP for logging
        $request->merge([
            'radius_client_ip' => $request->ip()
        ]);

        return $next($request);
    }
}