<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Services\ProductService;
use App\Services\DashboardBroadcastService; // Import

use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    protected ProductService $service;
    protected DashboardBroadcastService $broadcastService;

    public function __construct(
        ProductService $service,
        DashboardBroadcastService $broadcastService
    ) {
        $this->service = $service;
        $this->broadcastService = $broadcastService;
    }

    /**
     * List Product
     */
    public function index(Request $request)
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'List Product',
                'data' => $this->service->getAll($request),
            ]);
        } catch (\Exception $e) {
            Log::error('Product index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detail Product
     */
    public function show(int $id)
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Detail Product',
                'data' => $this->service->detail($id),
            ]);
        } catch (\Exception $e) {
            Log::error('Product show error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Produk tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Create Product
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'category_id' => 'required|exists:categories,id',

                'jenis_id' => 'required|exists:jenis,id',

                'code' => 'required|string|max:50|unique:products,code',

                'name' => 'required|string|max:150',

                'price' => 'required|numeric|min:0',

                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

                'description' => 'nullable|string',

                'is_active' => 'nullable|boolean',
            ]);

            $product = $this->service->create(
                $request->all(),
                $request->file('image')
            );

            // 🔥 Trigger tambahan dari controller (opsional)
            try {
                $this->broadcastService->broadcast();
                Log::info('✅ Dashboard broadcast triggered from product controller');
            } catch (\Exception $e) {
                Log::error('❌ Failed to broadcast from product controller: ' . $e->getMessage());
            }

            return response()->json([
                'status' => true,
                'message' => 'Product berhasil dibuat',
                'data' => $product,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Product store error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal membuat produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Product
     */
    public function update(
        Request $request,
        int $id
    ) {
        try {
            $request->validate([
                'category_id' => 'required|exists:categories,id',

                'jenis_id' => 'required|exists:jenis,id',

                'code' => 'required|string|max:50|unique:products,code,' . $id,

                'name' => 'required|string|max:150',

                'price' => 'required|numeric|min:0',

                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

                'description' => 'nullable|string',

                'is_active' => 'nullable|boolean',
            ]);

            $product = $this->service->update(
                $request->all(),
                $id,
                $request->file('image')
            );

            return response()->json([
                'status' => true,
                'message' => 'Product berhasil diupdate',
                'data' => $product,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengupdate produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete Product
     */
    public function destroy(int $id)
    {
        try {
            $this->service->delete($id);

            return response()->json([
                'status' => true,
                'message' => 'Product berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            Log::error('Product destroy error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive(int $id)
    {
        try {
            $product = $this->service->toggleActive($id);

            return response()->json([
                'status' => true,
                'message' => 'Status produk berhasil diubah',
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            Log::error('Product toggleActive error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengubah status produk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update stock
     */
    public function updateStock(Request $request, int $id)
    {
        try {
            $request->validate([
                'stock' => 'required|integer|min:0',
            ]);

            $product = $this->service->updateStock(
                $id,
                $request->stock
            );

            return response()->json([
                'status' => true,
                'message' => 'Stok produk berhasil diupdate',
                'data' => $product,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Product updateStock error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengupdate stok produk: ' . $e->getMessage(),
            ], 500);
        }
    }
}