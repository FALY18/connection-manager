<?php

namespace App\Http\Controllers\Admin\Auth;

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
                // prendre en compte le prefix Redis Laravel
                $keys = Redis::keys('*session:*');
                $sessions = [];

                foreach ($keys as $key) {
                    $raw = Redis::get($key);
                    if ($raw) {
                        $sessions[] = json_decode($raw, true);
                    }
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
