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
        Schema::create('returs', function (Blueprint $table) {

            $table->id();

            $table->string('return_no')
                ->unique();

            $table->foreignId('transaction_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', [
                'refund',
                'exchange'
            ])->default('refund');

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'replacement_sent',
                'completed'
            ])->default('pending');

            $table->decimal('total_refund', 15, 2)
                ->default(0);

            $table->text('reason');

            $table->text('reject_reason')
                ->nullable();

            $table->timestamp('approved_at')
                ->nullable();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('replacement_resi')
                ->nullable();

            $table->timestamp('replacement_sent_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('returs');
    }
};
