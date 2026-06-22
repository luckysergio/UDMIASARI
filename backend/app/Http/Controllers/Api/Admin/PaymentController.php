<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    protected PaymentService $service;

    public function __construct(
        PaymentService $service
    ) {
        $this->service = $service;
    }

    /**
     * List
     */
    public function index(Request $request)
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'List pembayaran',
                'data' => $this->service->getAll($request),
            ]);
        } catch (\Exception $e) {
            Log::error('Payment index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detail
     */
    public function show(int $id)
    {
        try {
            $payment = $this->service->detail($id);
            
            // 🔥 Cek akses: customer hanya bisa melihat pembayaran transaksinya sendiri
            $user = Auth::guard('api')->user();
            if ($user && $user->role === 'customer') {
                $transaction = $payment->transaction;
                if ($transaction && $transaction->customer_id !== $user->id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Anda tidak memiliki akses ke pembayaran ini',
                    ], 403);
                }
            }
            
            return response()->json([
                'status' => true,
                'message' => 'Detail pembayaran',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment show error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Pembayaran tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Create Payment - Bisa diakses oleh admin, kepala_produksi, dan customer
     */
    public function store(Request $request)
    {
        try {
            Log::info('Payment request received', [
                'transaction_id' => $request->transaction_id,
                'note' => $request->note,
                'details' => $request->details,
                'has_files' => $request->hasFile('proof_images'),
            ]);
            
            $validator = validator($request->all(), [
                'transaction_id' => 'required|exists:transactions,id',
                'note' => 'nullable|string',
                'details' => 'required|array|min:1',
                'details.*.method' => 'required|in:cash,transfer,qris,debit,credit_card',
                'details.*.amount' => 'required|numeric|min:1',
                'details.*.reference_no' => 'nullable|string',
                'proof_images' => 'nullable|array',
                'proof_images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            ]);
            
            if ($validator->fails()) {
                Log::error('Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'status' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $validated = $validator->validated();
            $user = Auth::guard('api')->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // 🔥 Jika user adalah customer, pastikan transaksi miliknya
            if ($user->role === 'customer') {
                $transaction = \App\Models\Transaction::find($validated['transaction_id']);
                if (!$transaction || $transaction->customer_id !== $user->id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Anda tidak memiliki akses ke transaksi ini',
                    ], 403);
                }
            }
            
            $payment = $this->service->create(
                $validated,
                $user->id,
                $request->file('proof_images', [])
            );
            
            return response()->json([
                'status' => true,
                'message' => 'Pembayaran berhasil dibuat',
                'data' => $payment,
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment creation error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * 🔥 Update payment status - Hanya admin
     */
    public function updateStatus(Request $request, int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk mengupdate status pembayaran',
                ], 403);
            }
            
            $validator = validator($request->all(), [
                'status' => 'required|in:pending,paid,partial',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $payment = $this->service->updateStatus($id, $request->status);
            
            return response()->json([
                'status' => true,
                'message' => 'Status pembayaran berhasil diupdate',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment updateStatus error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengupdate status pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Update payment - Hanya admin
     */
    public function update(Request $request, int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk mengupdate pembayaran',
                ], 403);
            }
            
            // Implement update logic if needed
            // ...
            
            return response()->json([
                'status' => true,
                'message' => 'Pembayaran berhasil diupdate',
            ]);
        } catch (\Exception $e) {
            Log::error('Payment update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengupdate pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Delete payment - Hanya admin
     */
    public function destroy(int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk menghapus pembayaran',
                ], 403);
            }
            
            $this->service->delete($id);
            
            return response()->json([
                'status' => true,
                'message' => 'Pembayaran berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            Log::error('Payment destroy error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }
}