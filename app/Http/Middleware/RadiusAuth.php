<?php

namespace App\Http\Middleware;

use Closure;

class RadiusAuth
{
    public function handle($request, Closure $next)
    {
        $key = $request->header('X-API-KEY');

        if ($key !== config('services.radius.key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}

