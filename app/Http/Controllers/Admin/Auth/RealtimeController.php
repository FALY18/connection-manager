<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeController extends Controller
{
    public function stream()
    {
        return new StreamedResponse(function () {
            while (true) {
                $keys = Redis::keys('session:*');
                $sessions = [];

                foreach ($keys as $key) {
                    $sessions[] = json_decode(Redis::get($key), true);
                }

                echo "data: " . json_encode($sessions) . "\n\n";

                ob_flush();
                flush();
                sleep(2);
            }
        }, 200, [
            "Content-Type" => "text/event-stream",
            "Cache-Control" => "no-cache",
            "Connection" => "keep-alive",
        ]);
    }
}
