<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanExpiredVouchers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vouchers:clean-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired vouchers from the database';

    /**
     * Execute the console command.
     */
    public function handle() : int
    {
        $key = Redis::keys('voucher:expired:*');
        foreach ($keys as $key) {
            $ttl = Redis::ttl($key);

            if ($ttl <= 0) {
                Redis::del($key);
                $this->info("Deleted: {$key}");
            }
        }

        $this->info('Cleanup finished.');
        return self::SUCCESS;
    }
}
