<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'product_id',
        'type',
        'qty',
        'stock_before',
        'stock_after',
        'reference_type',
        'reference_id',
        'note',
        'created_by',
    ];

    protected $casts = [
        'qty' => 'integer',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
    ];

    protected $appends = [
        'reference_label',
        'reference_code',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function reference()
    {
        return $this->morphTo();
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getReferenceCodeAttribute(): string
    {
        if (!$this->reference) {
            return '-';
        }

        return match (class_basename($this->reference_type)) {

            'Transaction' =>
                $this->reference->invoice_no ?? '-',

            'Retur' =>
                $this->reference->return_no ?? '-',

            default =>
                '-',
        };
    }

    public function getReferenceLabelAttribute(): string
    {
        return match (class_basename($this->reference_type)) {

            'Transaction' =>
                'Transaksi',

            'Retur' =>
                'Retur',

            default =>
                'Penyesuaian Stok',
        };
    }
}