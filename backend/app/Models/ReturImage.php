<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReturImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'retur_id',
        'image',
    ];

    public function retur()
    {
        return $this->belongsTo(Retur::class);
    }
}