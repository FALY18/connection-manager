<?php

namespace App\Http\Controllers\Client;
use App\Http\Controllers\Controller;
use App\Models\Session;
use App\Providers\SessionService;
use Illuminate\Support\Facades\Redis;

class SessionController extends Controller
{
    public function __construct(private SessionService $sessionService)
    {}

    public function validateSession(string $sessionId)
    {
        $isValid = $this->sessionService->validateSession($sessionId);

        return response()->json([
            'session_id' => $sessionId,
            'valid' => $isValid,
        ]);
    }


    public function list()
    {
        $sessions = Session::orderByDesc('started_at')->limit(100)->get();
        //return response()->json($sessions);
    }

    public function disconnect(string $id)
    {
        Redis::del("session:{$id}");

        Session::where('id', $id)->update([
            'ended_at' => now()
        ]);

        return response()->json(['status' => 'disconnected']);
    }

}
