<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class SessionController extends Controller
{
    public function destroy(string $id)
    {
        $key = "session:$id";

        if (!Redis::exists($key)) {
            return response()->json([
                'success' => false,
                'message' => 'Session introuvable'
            ], 404);
        }

        Redis::del($key);

        return response()->json([
            'success' => true,
            'message' => 'Session déconnectée'
        ]);
    }
}
