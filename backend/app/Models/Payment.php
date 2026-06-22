<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'total_paid',
        'paid_at',
        'status',
        'note',
        'created_by',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'total_paid' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // 🔥 PERBAIKAN: Method name harus 'details' bukan 'paymentDetails'
    public function details()
    {
        return $this->hasMany(PaymentDetail::class);
    }
}