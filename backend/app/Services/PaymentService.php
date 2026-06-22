<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Transaction;
use App\Models\PaymentDetail;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentService
{
    /**
     * List
     */
    public function getAll(Request $request)
    {
        $user = Auth::user();
        $query = Payment::with([
            'transaction',
            'details',
            'creator'
        ]);
        
        // 🔥 Jika user adalah customer, filter pembayaran miliknya
        if ($user && $user->role === 'customer') {
            $query->whereHas('transaction', function($q) use ($user) {
                $q->where('customer_id', $user->id);
            });
        }
        
        // Filter berdasarkan transaksi
        if ($request->transaction_id) {
            $query->where('transaction_id', $request->transaction_id);
        }
        
        // Filter berdasarkan status
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        // Filter berdasarkan tanggal
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        return $query->latest()->paginate($request->limit ?? 10);
    }

    /**
     * Detail
     */
    public function detail(int $id): Payment
    {
        return Payment::with([
            'transaction',
            'details',
            'creator'
        ])->findOrFail($id);
    }

    /**
     * Create Payment
     */
    public function create(
        array $data,
        int $userId,
        array $proofImages = []
    ): Payment {

        return DB::transaction(function () use (
            $data,
            $userId,
            $proofImages
        ) {

            $transaction = Transaction::findOrFail(
                $data['transaction_id']
            );

            // 🔥 Cek akses: customer hanya bisa bayar transaksi sendiri
            $user = Auth::user();
            if ($user && $user->role === 'customer' && $transaction->customer_id !== $user->id) {
                abort(403, 'Anda tidak memiliki akses ke transaksi ini');
            }

            // 🔥 PERUBAHAN: Customer tetap bisa bayar meskipun status transaksi selesai atau dibatalkan?
            // Biarkan customer tetap bisa bayar, tapi tidak mengubah status
            // Hapus pengecekan status transaksi
            // if (
            //     in_array(
            //         $transaction->status,
            //         ['selesai', 'dibatalkan']
            //     )
            // ) {
            //     abort(
            //         422,
            //         'Transaksi tidak dapat dibayar'
            //     );
            // }

            /**
             * Total pembayaran sebelumnya
             */
            $existingTotalPaid = Payment::where(
                'transaction_id',
                $transaction->id
            )->sum('total_paid');

            $newTotalPaid = collect(
                $data['details']
            )->sum('amount');

            $totalPaidAfter =
                $existingTotalPaid +
                $newTotalPaid;

            if (
                $totalPaidAfter >
                $transaction->grand_total
            ) {
                abort(
                    422,
                    'Total pembayaran melebihi tagihan'
                );
            }

            /**
             * Create Payment
             */
            $payment = Payment::create([
                'transaction_id' => $transaction->id,
                'total_paid' => $newTotalPaid,
                'paid_at' => now(),
                'status' => 'pending',
                'note' => $data['note'] ?? null,
                'created_by' => $userId,
            ]);

            /**
             * Detail Payment
             */
            foreach ($data['details'] as $index => $detail) {

                $imagePath = null;

                // 🔥 Hanya upload file jika metode transfer atau qris
                $method = $detail['method'];
                $hasFile = isset($proofImages[$index]) && $proofImages[$index] instanceof UploadedFile;
                
                // Validasi: transfer/qris wajib upload bukti
                if (($method === 'transfer' || $method === 'qris') && !$hasFile) {
                    abort(422, 'Bukti pembayaran wajib diupload untuk metode ' . ($method === 'transfer' ? 'Transfer Bank' : 'QRIS'));
                }
                
                // Upload file jika ada
                if ($hasFile) {
                    try {
                        $imagePath = $proofImages[$index]->store(
                            'payment-proofs',
                            'public'
                        );
                        Log::info('File uploaded successfully', ['path' => $imagePath]);
                    } catch (\Exception $e) {
                        Log::error('File upload failed', ['error' => $e->getMessage()]);
                    }
                }

                PaymentDetail::create([
                    'payment_id' => $payment->id,
                    'method' => $detail['method'],
                    'amount' => $detail['amount'],
                    'reference_no' => $detail['reference_no'] ?? null,
                    'proof_image' => $imagePath,
                ]);
            }

            /**
             * 🔥 PERUBAHAN: Jangan update status transaksi secara otomatis
             * Status transaksi hanya bisa diubah oleh admin
             * Hanya update status pembayaran saja
             */
            if (
                $totalPaidAfter >=
                $transaction->grand_total
            ) {
                // Jika total pembayaran sudah lunas, status pembayaran jadi 'paid'
                $payment->update([
                    'status' => 'paid'
                ]);
                
                // 🔥 JANGAN update status transaksi ke 'selesai'
                // Biarkan admin yang mengubah status transaksi
                // $transaction->update([
                //     'status' => 'selesai'
                // ]);
            } else {
                // Jika masih partial, status pembayaran 'partial'
                $payment->update([
                    'status' => 'partial'
                ]);
            }

            return $payment->load([
                'transaction',
                'details',
                'creator'
            ]);
        });
    }
    
    /**
     * Update payment status - Hanya admin
     */
    public function updateStatus(int $id, string $status): Payment
    {
        $user = Auth::user();
        if ($user && $user->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses untuk mengupdate status pembayaran');
        }
        
        $payment = Payment::findOrFail($id);
        $payment->update(['status' => $status]);
        
        return $payment->fresh();
    }
    
    /**
     * Delete payment - Hanya admin
     */
    public function delete(int $id): void
    {
        $user = Auth::user();
        if ($user && $user->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses untuk menghapus pembayaran');
        }
        
        $payment = Payment::findOrFail($id);
        
        // Hapus file bukti pembayaran jika ada
        foreach ($payment->details as $detail) {
            if ($detail->proof_image) {
                Storage::disk('public')->delete($detail->proof_image);
            }
        }
        
        $payment->delete();
    }
}