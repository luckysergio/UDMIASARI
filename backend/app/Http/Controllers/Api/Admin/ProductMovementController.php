<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\ProductMovementService;

use App\Http\Controllers\Controller;

class ProductMovementController extends Controller
{
    protected ProductMovementService $service;

    public function __construct(
        ProductMovementService $service
    ) {
        $this->service = $service;
    }

    /**
     * List Movement
     */
    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'List Product Movement',
            'data' => $this->service->getAll($request),
        ]);
    }

    /**
     * Detail Movement
     */
    public function show(int $id)
    {
        return response()->json([
            'status' => true,
            'message' => 'Detail Product Movement',
            'data' => $this->service->detail($id),
        ]);
    }

    /**
     * Create Movement
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',

            'type' => 'required|in:in,out',

            'qty' => 'required|integer|min:1',

            'notes' => 'nullable|string|max:500',
        ]);

        /**
         * Authenticated User
         */
        $user = Auth::guard('api')->user();

        if (!$user) {

            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        /**
         * Create Movement
         */
        $movement = $this->service->create(
            $validated,
            $user->id
        );

        return response()->json([
            'status' => true,
            'message' => 'Product movement berhasil dibuat',
            'data' => $movement,
        ], 201);
    }
}