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
    Schema::create('vouchers', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('code')->unique();
        $table->foreignUuid('plan_id')->constrained()->cascadeOnDelete();
        $table->enum('status', ['unused', 'used', 'expired'])->default('unused');
        $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamp('used_at')->nullable();
        $table->timestamp('expires_at')->nullable();
        $table->string('activated_by_mac')->nullable();
        $table->string('activated_ip')->nullable();
        $table->timestamps();

        $table->index(['code', 'status']);
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
