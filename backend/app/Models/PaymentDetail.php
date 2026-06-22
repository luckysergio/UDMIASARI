<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'method',
        'amount',
        'reference_no',
        'proof_image',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected $appends = [
        'proof_image_url',
    ];

    public function payment()
    {
        return $this->belongsTo(
            Payment::class
        );
    }

    public function getProofImageUrlAttribute()
    {
        if (!$this->proof_image) {
            return null;
        }

        return asset(
            'storage/' . $this->proof_image
        );
    }
}