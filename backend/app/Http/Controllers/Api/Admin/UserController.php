<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    /**
     * List User
     */
    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'message' => 'List User',
            'data' => $this->service->getAll($request)
        ]);
    }

    /**
     * Detail User
     */
    public function show(int $id)
    {
        return response()->json([
            'status' => true,
            'message' => 'Detail User',
            'data' => $this->service->detail($id)
        ]);
    }

    /**
     * Create User
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,kepala_produksi,customer',
        ]);

        $user = $this->service->create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'User berhasil dibuat',
            'data' => $user
        ]);
    }

    /**
     * Update User
     */
    public function update(
        Request $request,
        int $id
    ) {

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $id,
            'password' => 'nullable|min:6',
            'role' => 'required|in:admin,kepala_produksi,customer',
        ]);

        $user = $this->service->update(
            $request->all(),
            $id
        );

        return response()->json([
            'status' => true,
            'message' => 'User berhasil diupdate',
            'data' => $user
        ]);
    }

    /**
     * Delete User
     */
    public function destroy(int $id)
    {
        $this->service->delete($id);

        return response()->json([
            'status' => true,
            'message' => 'User berhasil dihapus'
        ]);
    }
}