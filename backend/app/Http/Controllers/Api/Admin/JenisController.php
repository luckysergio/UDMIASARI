<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use App\Services\JenisService;
use App\Http\Controllers\Controller;

class JenisController extends Controller
{
    protected JenisService $service;

    public function __construct(
        JenisService $service
    ) {
        $this->service = $service;
    }

    /**
     * List Jenis
     */
    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'List Jenis',
            'data' => $this->service->getAll($request),
        ]);
    }

    /**
     * Detail Jenis
     */
    public function show(int $id)
    {
        return response()->json([
            'status' => true,
            'message' => 'Detail Jenis',
            'data' => $this->service->detail($id),
        ]);
    }

    /**
     * Create Jenis
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $jenis = $this->service->create(
            $request->all()
        );

        return response()->json([
            'status' => true,
            'message' => 'Jenis berhasil dibuat',
            'data' => $jenis,
        ]);
    }

    /**
     * Update Jenis
     */
    public function update(
        Request $request,
        int $id
    ) {

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $jenis = $this->service->update(
            $request->all(),
            $id
        );

        return response()->json([
            'status' => true,
            'message' => 'Jenis berhasil diupdate',
            'data' => $jenis,
        ]);
    }

    /**
     * Delete Jenis
     */
    public function destroy(int $id)
    {
        $this->service->delete($id);

        return response()->json([
            'status' => true,
            'message' => 'Jenis berhasil dihapus',
        ]);
    }
}
