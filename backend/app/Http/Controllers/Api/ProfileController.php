<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    protected ProfileService $service;

    public function __construct(ProfileService $service)
    {
        $this->service = $service;
    }

    /**
     * Get user profile
     */
    public function show()
    {
        try {
            $user = Auth::guard('api')->user();
            
            return response()->json([
                'status' => true,
                'message' => 'Profile user',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            
            $rules = [
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            ];
            
            $validated = $request->validate($rules);
            
            $updatedUser = $this->service->updateProfile($user->id, $validated);
            
            return response()->json([
                'status' => true,
                'message' => 'Profile berhasil diperbarui',
                'data' => [
                    'id' => $updatedUser->id,
                    'name' => $updatedUser->name,
                    'email' => $updatedUser->email,
                    'phone' => $updatedUser->phone,
                    'role' => $updatedUser->role,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengupdate profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            
            $rules = [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6|different:current_password',
                'confirm_password' => 'required|string|same:new_password',
            ];
            
            $validated = $request->validate($rules);
            
            $result = $this->service->changePassword(
                $user->id,
                $validated['current_password'],
                $validated['new_password']
            );
            
            if (!$result) {
                return response()->json([
                    'status' => false,
                    'message' => 'Password saat ini tidak cocok',
                ], 422);
            }
            
            return response()->json([
                'status' => true,
                'message' => 'Password berhasil diubah',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengubah password: ' . $e->getMessage(),
            ], 500);
        }
    }
}