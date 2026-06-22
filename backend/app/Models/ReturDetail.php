<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReturDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'retur_id',
        'product_id',
        'qty',
        'price',
        'subtotal',
        'note',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function retur()
    {
        return $this->belongsTo(Retur::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}