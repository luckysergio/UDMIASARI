<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\LandingPageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LandingPageController extends Controller
{
    protected LandingPageService $service;

    public function __construct(LandingPageService $service)
    {
        $this->service = $service;
    }

    /**
     * Get landing page data (public)
     */
    public function index(Request $request)
    {
        try {
            $data = $this->service->getLandingData($request);
            
            return response()->json([
                'status' => true,
                'message' => 'Data landing page berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('LandingPageController index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data landing page: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get product detail by ID (public)
     * @param int $id
     */
    public function show(int $id)
    {
        try {
            $product = \App\Models\Product::with(['category', 'jenis', 'inventory'])
                ->where('is_active', true)
                ->findOrFail($id);
            
            return response()->json([
                'status' => true,
                'message' => 'Detail produk berhasil diambil',
                'data' => [
                    'id' => $product->id,
                    'code' => $product->code,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => (float) $product->price,
                    'stock' => $product->inventory ? $product->inventory->stock : 0,
                    'image' => $product->image ? asset('storage/' . $product->image) : null,
                    'category_id' => $product->category_id,
                    'category_name' => $product->category ? $product->category->name : null,
                    'jenis_id' => $product->jenis_id,
                    'jenis_name' => $product->jenis ? $product->jenis->name : null,
                    'is_available' => $product->inventory && $product->inventory->stock > 0,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('LandingPageController show error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Produk tidak ditemukan',
            ], 404);
        }
    }
}