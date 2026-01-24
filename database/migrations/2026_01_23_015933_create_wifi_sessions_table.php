<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
        {
            Schema::create('wifi_sessions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('voucher_id')->constrained()->cascadeOnDelete();
                $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
                $table->string('username')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('mac_address')->nullable()->index();
                $table->timestamp('started_at');
                $table->timestamp('ended_at')->nullable();
                $table->bigInteger('data_used_mb')->default(0);
                $table->enum('status', ['active', 'expired', 'blocked'])->default('active');
                $table->timestamps();

                $table->index(['status', 'mac_address']);
            });
        }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wifi_sessions');
    }
};
