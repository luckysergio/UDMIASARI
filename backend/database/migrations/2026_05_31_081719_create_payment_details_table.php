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
        Schema::create('payment_details', function (Blueprint $table) {

            $table->id();

            $table->foreignId('payment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('method', [
                'cash',
                'transfer',
                'qris',
                'debit',
                'credit_card'
            ]);

            $table->decimal('amount', 15, 2);

            $table->string('reference_no')
                ->nullable();

            /**
             * Bukti pembayaran
             */
            $table->string('proof_image')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_details');
    }
};