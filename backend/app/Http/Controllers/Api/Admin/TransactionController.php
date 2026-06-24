<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\Controller;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    protected TransactionService $service;

    public function __construct(TransactionService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // 🔥 Jika user adalah customer, filter transaksi miliknya
            if ($user && $user->role === 'customer') {
                $request->merge(['customer_id' => $user->id]);
            }
            
            return response()->json([
                'status' => true,
                'message' => 'List transaksi',
                'data' => $this->service->getAll($request),
            ]);
        } catch (\Exception $e) {
            Log::error('Transaction index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $transaction = $this->service->detail($id);
            
            $user = Auth::guard('api')->user();
            if ($user && $user->role === 'customer' && $transaction->customer_id !== $user->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses ke transaksi ini',
                ], 403);
            }
            
            return response()->json([
                'status' => true,
                'message' => 'Detail transaksi',
                'data' => $transaction,
            ]);
        } catch (\Exception $e) {
            Log::error('Transaction show error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();

            $rules = [
                'delivery_type' => 'required|in:pickup,delivery',
                'delivery_address' => 'nullable|string',
                'discount' => 'nullable|numeric|min:0',
                'tax' => 'nullable|numeric|min:0',
                'note' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.qty' => 'required|integer|min:1',
            ];

            if ($user->role !== 'customer') {
                $rules['customer_name'] = 'nullable|string|max:100';
                $rules['customer_phone'] = 'nullable|string|max:20';
                
                if ($request->has('customer_id') && $request->customer_id) {
                    $rules['customer_id'] = 'exists:users,id';
                }
            }

            $validated = $request->validate($rules);

            if ($validated['delivery_type'] === 'delivery' && empty($validated['delivery_address'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Alamat pengiriman wajib diisi'
                ], 422);
            }

            $transaction = $this->service->create($validated, $user);

            return response()->json([
                'status' => true,
                'message' => 'Transaksi berhasil dibuat',
                'data' => $transaction,
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Transaction store error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStatus(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'status' => [
                    'required',
                    'in:dipesan,diproses,dikirim,siap_ambil,selesai,dibatalkan'
                ]
            ]);

            $user = Auth::guard('api')->user();
            
            // 🔥 Cek akses: customer tidak bisa update status transaksi
            if ($user->role === 'customer') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk mengubah status transaksi',
                ], 403);
            }

            $transaction = $this->service->updateStatus(
                $id,
                $validated['status'],
                $user->id
            );

            return response()->json([
                'status' => true,
                'message' => 'Status berhasil diubah',
                'data' => $transaction
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Transaction updateStatus error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update transaction (general update)
     */
    public function update(Request $request, int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // 🔥 Cek akses: customer tidak bisa update transaksi
            if ($user->role === 'customer') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk mengupdate transaksi',
                ], 403);
            }

            $validated = $request->validate([
                'customer_name' => 'nullable|string|max:100',
                'customer_phone' => 'nullable|string|max:20',
                'delivery_type' => 'nullable|in:pickup,delivery',
                'delivery_address' => 'nullable|string',
                'discount' => 'nullable|numeric|min:0',
                'tax' => 'nullable|numeric|min:0',
                'subtotal' => 'nullable|numeric|min:0',
                'note' => 'nullable|string',
            ]);

            $transaction = $this->service->update($id, $validated, $user->id);

            return response()->json([
                'status' => true,
                'message' => 'Transaksi berhasil diupdate',
                'data' => $transaction
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Transaction update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete transaction
     */
    public function destroy(int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // 🔥 Cek akses: customer tidak bisa hapus transaksi
            if ($user->role === 'customer') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk menghapus transaksi',
                ], 403);
            }

            $this->service->delete($id);

            return response()->json([
                'status' => true,
                'message' => 'Transaksi berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Transaction destroy error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}