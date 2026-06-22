<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * List Product
     */
    public function getAll(
        Request $request
    ): LengthAwarePaginator {

        return Product::with([
            'category',
            'jenis',
            'inventory',
        ])

            // Search nama / kode
            ->when($request->search, function ($query) use ($request) {

                $search = $request->search;

                $query->where(function ($q) use ($search) {

                    $q->where(
                        'name',
                        'ilike',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'code',
                        'ilike',
                        '%' . $search . '%'
                    );
                });
            })

            // Filter kategori
            ->when($request->category_id, function ($query) use ($request) {

                $query->where(
                    'category_id',
                    $request->category_id
                );
            })

            // Filter jenis
            ->when($request->jenis_id, function ($query) use ($request) {

                $query->where(
                    'jenis_id',
                    $request->jenis_id
                );
            })

            ->latest()

            ->paginate($request->limit ?? 10);
    }

    /**
     * Detail
     */
    public function detail(int $id): Product
    {
        return Product::with([
            'category',
            'jenis',
            'inventory',
        ])->findOrFail($id);
    }

    /**
     * Create
     */
    public function create(
        array $data,
        ?UploadedFile $image
    ): Product {

        return DB::transaction(function () use ($data, $image) {

            $imagePath = null;

            if ($image) {

                $imagePath = $image->store(
                    'products',
                    'public'
                );
            }

            // Create Product
            $product = Product::create([
                'category_id' => $data['category_id'],
                'jenis_id' => $data['jenis_id'],
                'code' => $data['code'],
                'name' => $data['name'],
                'price' => $data['price'],
                'image' => $imagePath,
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            // Auto Create Inventory
            Inventory::create([
                'product_id' => $product->id,
                'stock' => 0,
            ]);

            return $product->load([
                'category',
                'jenis',
                'inventory',
            ]);
        });
    }

    /**
     * Update
     */
    public function update(
        array $data,
        int $id,
        ?UploadedFile $image
    ): Product {

        $product = Product::findOrFail($id);

        if ($image) {

            if ($product->image) {

                Storage::disk('public')
                    ->delete($product->image);
            }

            $imagePath = $image->store(
                'products',
                'public'
            );

            $product->image = $imagePath;
        }

        $product->update([
            'category_id' => $data['category_id'],
            'jenis_id' => $data['jenis_id'],
            'code' => $data['code'],
            'name' => $data['name'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $product->save();

        return $product->load([
            'category',
            'jenis',
            'inventory',
        ]);
    }

    /**
     * Delete
     */
    public function delete(int $id): void
    {
        $product = Product::findOrFail($id);

        DB::transaction(function () use ($product) {

            // Delete image
            if ($product->image) {

                Storage::disk('public')
                    ->delete($product->image);
            }

            // Delete inventory
            $product->inventory()?->delete();

            // Delete product
            $product->delete();
        });
    }
}