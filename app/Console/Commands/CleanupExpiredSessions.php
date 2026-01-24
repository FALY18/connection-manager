<?php

namespace App\Console\Commands;

use App\Models\Session;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class CleanupExpiredSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:cleanup';
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close expired sessions ';
    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Sessions that should have ended (ended_at is set, meaning already closed)
        // For WiFi sessions, we mark them as ended when they're no longer active
        $expired = Session::whereNull('ended_at')
            ->where('status', 'expired')
            ->get();

        foreach ($expired as $session) {
            // Try to delete from Redis if available
            if (extension_loaded('redis')) {
                try {
                    Redis::del("session:{$session->id}");
                } catch (\Exception $e) {
                    // Redis not available, continue
                }
            }

            $session->update([
                'ended_at' => now()
            ]);
        }

        $this->info("Expired sessions cleaned: " . $expired->count());
    }
}
