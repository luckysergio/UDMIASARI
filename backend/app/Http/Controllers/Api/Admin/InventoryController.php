<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use App\Services\InventoryService;
use App\Http\Controllers\Controller;

class InventoryController extends Controller
{
    protected InventoryService $service;

    public function __construct(
        InventoryService $service
    ) {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'List Inventory',
            'data' => $this->service->getAll($request),
        ]);
    }

    public function show(int $id)
    {
        return response()->json([
            'status' => true,
            'message' => 'Detail Inventory',
            'data' => $this->service->detail($id),
        ]);
    }
}
