<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',

        'customer_id',
        'customer_name',
        'customer_phone',

        'delivery_type',
        'delivery_address',

        'subtotal',
        'discount',
        'tax',
        'grand_total',

        'status',
        'note',

        'created_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(
            User::class,
            'customer_id'
        );
    }

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function details()
    {
        return $this->hasMany(
            TransactionDetail::class
        );
    }

    public function payments()
    {
        return $this->hasMany(
            Payment::class
        );
    }

    public function returs()
    {
        return $this->hasMany(
            Retur::class
        );
    }

    public function productMovements()
    {
        return $this->morphMany(
            ProductMovement::class,
            'reference'
        );
    }
}
