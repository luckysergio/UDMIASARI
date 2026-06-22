<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {

            $table->id();

            $table->string('invoice_no')
                ->unique();

            /**
             * Relasi customer
             */
            $table->foreignId('customer_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /**
             * Snapshot customer
             */
            $table->string('customer_name');

            $table->string('customer_phone', 20)
                ->nullable();

            /**
             * Pengiriman
             */
            $table->enum('delivery_type', [
                'pickup',
                'delivery'
            ])->default('pickup');

            $table->text('delivery_address')
                ->nullable();

            /**
             * Nominal transaksi
             */
            $table->decimal(
                'subtotal',
                15,
                2
            )->default(0);

            $table->decimal(
                'discount',
                15,
                2
            )->default(0);

            $table->decimal(
                'tax',
                15,
                2
            )->default(0);

            $table->decimal(
                'grand_total',
                15,
                2
            )->default(0);

            /**
             * Status pesanan
             */
            $table->enum('status', [
                'dipesan',
                'diproses',
                'dikirim',
                'siap_ambil',
                'selesai',
                'dibatalkan'
            ])->default('dipesan');

            $table->text('note')
                ->nullable();

            /**
             * User pembuat transaksi
             */
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};