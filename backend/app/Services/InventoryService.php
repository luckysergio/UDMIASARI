<?php

namespace App\Services;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventoryService
{
    public function getAll(
        Request $request
    ): LengthAwarePaginator {

        return Inventory::with([
            'product.category',
            'product.jenis',
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

    public function detail(int $id): Inventory
    {
        return Inventory::with([
            'product.category',
            'product.jenis',
        ])->findOrFail($id);
    }
}
