<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReturService;
use App\Services\DashboardBroadcastService; // Import

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReturController extends Controller
{
    protected ReturService $service;
    protected DashboardBroadcastService $broadcastService;

    public function __construct(
        ReturService $service,
        DashboardBroadcastService $broadcastService
    ) {
        $this->service = $service;
        $this->broadcastService = $broadcastService;
    }

    /**
     * List Retur
     */
    public function index(Request $request)
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'List retur',
                'data' => $this->service->getAll($request),
            ]);
        } catch (\Exception $e) {
            Log::error('Retur index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data retur: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detail Retur
     */
    public function show(int $id)
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Detail retur',
                'data' => $this->service->detail($id),
            ]);
        } catch (\Exception $e) {
            Log::error('Retur show error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Retur tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Create Retur
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            Log::info('Retur store request', [
                'transaction_id' => $request->transaction_id,
                'type' => $request->type,
                'reason' => $request->reason,
                'has_items' => $request->has('items'),
                'has_images' => $request->hasFile('images'),
            ]);

            // Validasi request
            $validated = $request->validate([
                'transaction_id' => 'required|exists:transactions,id',
                'type' => 'required|in:refund,exchange',
                'reason' => 'required|string|min:10|max:1000',
                'items' => 'required|json',
                'images' => 'required|array|min:1',
                'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:2048',
            ]);

            // Parse items dari JSON string
            $items = json_decode($validated['items'], true);

            if (!is_array($items) || count($items) === 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Minimal satu produk untuk diretur',
                ], 422);
            }

            // Validasi items
            foreach ($items as $index => $item) {
                if (!isset($item['product_id']) || !isset($item['qty'])) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Format items tidak valid pada item ke-' . ($index + 1),
                    ], 422);
                }
                if ($item['qty'] <= 0) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Jumlah produk harus lebih dari 0 pada item ke-' . ($index + 1),
                    ], 422);
                }
            }

            // Ambil file images
            $images = $request->file('images');
            if (!is_array($images)) {
                $images = [$images];
            }

            if (empty($images)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Minimal satu bukti foto retur',
                ], 422);
            }

            // Buat retur
            $retur = $this->service->create(
                [
                    'transaction_id' => $validated['transaction_id'],
                    'type' => $validated['type'],
                    'reason' => $validated['reason'],
                    'items' => $items,
                ],
                $images,
                $user->id
            );

            // 🔥 Trigger tambahan dari controller (opsional)
            try {
                $this->broadcastService->broadcast();
                Log::info('✅ Dashboard broadcast triggered from retur controller');
            } catch (\Exception $e) {
                Log::error('❌ Failed to broadcast from retur controller: ' . $e->getMessage());
            }

            return response()->json([
                'status' => true,
                'message' => 'Retur berhasil dibuat',
                'data' => $retur,
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Retur validation error:', $e->errors());
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Retur store error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'status' => false,
                'message' => 'Gagal membuat retur: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve Retur
     */
    public function approve(int $id)
    {
        try {
            $retur = $this->service->approve(
                $id,
                Auth::guard('api')->id()
            );

            Log::info('Retur approved successfully', [
                'id' => $retur->id,
                'return_no' => $retur->return_no,
                'type' => $retur->type,
                'status' => $retur->status
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Retur berhasil disetujui',
                'data' => $retur,
            ]);
        } catch (\Exception $e) {
            Log::error('Retur approve error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menyetujui retur: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject Retur
     */
    public function reject(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'reason' => [
                    'required',
                    'string',
                    'max:1000'
                ]
            ]);

            $retur = $this->service->reject(
                $id,
                $validated['reason']
            );

            return response()->json([
                'status' => true,
                'message' => 'Retur berhasil ditolak',
                'data' => $retur,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Retur reject error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menolak retur: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kirim Barang Pengganti
     */
    public function sendReplacement(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'resi' => [
                    'required',
                    'string',
                    'max:100'
                ]
            ]);

            $retur = $this->service->sendReplacement(
                $id,
                $validated['resi'],
                Auth::guard('api')->id()
            );

            Log::info('Replacement sent successfully', [
                'id' => $retur->id,
                'return_no' => $retur->return_no,
                'resi' => $retur->replacement_resi,
                'status' => $retur->status
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Barang pengganti berhasil dikirim',
                'data' => $retur,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Retur sendReplacement error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengirim barang pengganti: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Selesaikan Retur
     */
    public function complete(int $id)
    {
        try {
            $retur = $this->service->complete($id);

            return response()->json([
                'status' => true,
                'message' => 'Retur berhasil diselesaikan',
                'data' => $retur,
            ]);
        } catch (\Exception $e) {
            Log::error('Retur complete error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menyelesaikan retur: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update Retur
     */
    public function update(Request $request, int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // Cek akses: hanya admin yang bisa update retur
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk mengupdate retur',
                ], 403);
            }

            $validated = $request->validate([
                'reason' => 'nullable|string|max:1000',
            ]);

            $retur = $this->service->update($id, $validated);

            return response()->json([
                'status' => true,
                'message' => 'Retur berhasil diupdate',
                'data' => $retur
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Retur update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete Retur
     */
    public function destroy(int $id)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // Cek akses: hanya admin yang bisa hapus retur
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses untuk menghapus retur',
                ], 403);
            }

            $this->service->delete($id);

            return response()->json([
                'status' => true,
                'message' => 'Retur berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Retur destroy error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}