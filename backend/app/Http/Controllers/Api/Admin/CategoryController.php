<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use App\Services\CategoryService;
use App\Http\Controllers\Controller;

class CategoryController extends Controller
{
    protected CategoryService $service;

    public function __construct(
        CategoryService $service
    ) {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'data' => $this->service->getAll($request),
        ]);
    }

    public function show(int $id)
    {
        return response()->json([
            'status' => true,
            'data' => $this->service->detail($id),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:100',
            'description' => 'nullable',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Category berhasil dibuat',
            'data' => $this->service->create(
                $request->all()
            ),
        ]);
    }

    public function update(
        Request $request,
        int $id
    ) {

        $request->validate([
            'name' => 'required|max:100',
            'description' => 'nullable',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Category berhasil diupdate',
            'data' => $this->service->update(
                $request->all(),
                $id
            ),
        ]);
    }

    public function destroy(int $id)
    {
        $this->service->delete($id);

        return response()->json([
            'status' => true,
            'message' => 'Category berhasil dihapus',
        ]);
    }
}
