<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Inventory;
use App\Events\DashboardStatsUpdated; // Import event

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Tambahkan Log

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    protected DashboardBroadcastService $broadcastService;

    public function __construct(DashboardBroadcastService $broadcastService)
    {
        $this->broadcastService = $broadcastService;
    }

    /**
     * Trigger dashboard update
     */
    private function triggerDashboardUpdate(string $action): void
    {
        try {
            Log::info('🔄 Triggering dashboard update after product: ' . $action);
            $this->broadcastService->broadcast();
            Log::info('✅ Dashboard update triggered successfully for product: ' . $action);
        } catch (\Exception $e) {
            Log::error('❌ Failed to trigger dashboard update for product ' . $action . ': ' . $e->getMessage());
        }
    }

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

            Log::info('Creating new product', [
                'name' => $data['name'],
                'code' => $data['code'],
                'price' => $data['price']
            ]);

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

            Log::info('Product created with ID: ' . $product->id);

            // Auto Create Inventory
            Inventory::create([
                'product_id' => $product->id,
                'stock' => 0,
            ]);

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate('product_created_' . $product->id);

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

        Log::info('Updating product', [
            'id' => $id,
            'name' => $data['name'] ?? null,
            'code' => $data['code'] ?? null
        ]);

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

        Log::info('Product updated with ID: ' . $product->id);

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('product_updated_' . $product->id);

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
        Log::info('Deleting product', [
            'id' => $id
        ]);

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

            Log::info('Product deleted with ID: ' . $product->id);

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate('product_deleted_' . $product->id);
        });
    }

    /**
     * Toggle active status
     */
    public function toggleActive(int $id): Product
    {
        Log::info('Toggling product active status', [
            'id' => $id
        ]);

        $product = Product::findOrFail($id);
        
        $product->update([
            'is_active' => !$product->is_active
        ]);

        Log::info('Product active status toggled', [
            'id' => $product->id,
            'is_active' => $product->is_active
        ]);

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('product_toggled_' . $product->id);

        return $product->load([
            'category',
            'jenis',
            'inventory',
        ]);
    }

    /**
     * Update stock (for inventory management)
     */
    public function updateStock(int $id, int $stock): Product
    {
        Log::info('Updating product stock', [
            'id' => $id,
            'stock' => $stock
        ]);

        $product = Product::findOrFail($id);
        
        $inventory = $product->inventory()->firstOrCreate([
            'product_id' => $product->id
        ]);

        $inventory->update([
            'stock' => $stock
        ]);

        Log::info('Product stock updated', [
            'id' => $product->id,
            'new_stock' => $stock
        ]);

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('product_stock_updated_' . $product->id);

        return $product->load([
            'category',
            'jenis',
            'inventory',
        ]);
    }
}