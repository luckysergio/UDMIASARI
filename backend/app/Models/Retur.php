<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Retur extends Model
{
    use HasFactory;

    protected $fillable = [
        'return_no',
        'transaction_id',
        'type',
        'status',
        'total_refund',
        'reason',
        'reject_reason',
        'approved_at',
        'approved_by',
        'replacement_resi',
        'replacement_sent_at',
        'completed_at',
        'created_by',
    ];

    protected $casts = [
        'total_refund' => 'decimal:2',
        'approved_at' => 'datetime',
        'replacement_sent_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function details()
    {
        return $this->hasMany(ReturDetail::class);
    }

    public function images()
    {
        return $this->hasMany(ReturImage::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function productMovements()
    {
        return $this->morphMany(
            ProductMovement::class,
            'reference'
        );
    }
}
