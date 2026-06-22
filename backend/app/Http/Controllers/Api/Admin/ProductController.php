<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;

use App\Services\ProductService;

use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    protected ProductService $service;

    public function __construct(
        ProductService $service
    ) {
        $this->service = $service;
    }

    /**
     * List Product
     */
    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'List Product',
            'data' => $this->service->getAll($request),
        ]);
    }

    /**
     * Detail Product
     */
    public function show(int $id)
    {
        return response()->json([
            'status' => true,
            'message' => 'Detail Product',
            'data' => $this->service->detail($id),
        ]);
    }

    /**
     * Create Product
     */
    public function store(Request $request)
    {
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

        return response()->json([
            'status' => true,
            'message' => 'Product berhasil dibuat',
            'data' => $product,
        ]);
    }

    /**
     * Update Product
     */
    public function update(
        Request $request,
        int $id
    ) {

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
    }

    /**
     * Delete Product
     */
    public function destroy(int $id)
    {
        $this->service->delete($id);

        return response()->json([
            'status' => true,
            'message' => 'Product berhasil dihapus',
        ]);
    }
}