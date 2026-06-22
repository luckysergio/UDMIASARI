<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\ProductMovement;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductMovementService
{
    /**
     * List Movement
     */
    public function getAll(
        Request $request
    ): LengthAwarePaginator {

        return ProductMovement::with([
            'inventory',
            'product.category',
            'product.jenis',
            'user',
        ])

            ->when($request->search, function ($query) use ($request) {

                $query->whereHas('product', function ($q) use ($request) {

                    $q->where(
                        'name',
                        'ilike',
                        '%' . $request->search . '%'
                    )
                    ->orWhere(
                        'code',
                        'ilike',
                        '%' . $request->search . '%'
                    );
                });
            })

            ->when($request->type, function ($query) use ($request) {

                $query->where(
                    'type',
                    $request->type
                );
            })

            ->when($request->category_id, function ($query) use ($request) {

                $query->whereHas('product', function ($q) use ($request) {

                    $q->where(
                        'category_id',
                        $request->category_id
                    );
                });
            })

            ->when($request->jenis_id, function ($query) use ($request) {

                $query->whereHas('product', function ($q) use ($request) {

                    $q->where(
                        'jenis_id',
                        $request->jenis_id
                    );
                });
            })

            ->latest()

            ->paginate($request->limit ?? 10);
    }

    /**
     * Detail Movement
     */
    public function detail(
        int $id
    ): ProductMovement {

        return ProductMovement::with([
            'inventory',
            'product.category',
            'product.jenis',
            'user',
        ])->findOrFail($id);
    }

    /**
     * Create Movement
     */
    public function create(
        array $data,
        int $userId
    ): ProductMovement {

        return DB::transaction(function () use ($data, $userId) {

            /**
             * Cari inventory product
             */
            $inventory = Inventory::firstOrCreate(
                [
                    'product_id' => $data['product_id']
                ],
                [
                    'stock' => 0
                ]
            );

            /**
             * Stock sebelum movement
             */
            $stockBefore = $inventory->stock;

            /**
             * STOCK IN
             */
            if ($data['type'] === 'in') {

                $inventory->increment(
                    'stock',
                    $data['qty']
                );
            }

            /**
             * STOCK OUT
             */
            if ($data['type'] === 'out') {

                if ($inventory->stock < $data['qty']) {

                    abort(
                        422,
                        'Stok tidak mencukupi'
                    );
                }

                $inventory->decrement(
                    'stock',
                    $data['qty']
                );
            }

            /**
             * Refresh stock terbaru
             */
            $inventory->refresh();

            /**
             * Simpan movement
             */
            return ProductMovement::create([

                'inventory_id' => $inventory->id,

                'product_id' => $data['product_id'],

                'created_by' => $userId,

                'type' => $data['type'],

                'qty' => $data['qty'],

                'stock_before' => $stockBefore,

                'stock_after' => $inventory->stock,

                'note' => $data['notes'] ?? null,
            ]);
        });
    }
}