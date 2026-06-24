<?php

namespace App\Services;

use App\Models\Retur;
use App\Models\ReturImage;
use App\Models\ReturDetail;
use App\Models\Transaction;
use App\Models\Inventory;
use App\Models\ProductMovement;
use App\Events\DashboardStatsUpdated; // Import event

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReturService
{
    protected DashboardBroadcastService $broadcastService;

    public function __construct(DashboardBroadcastService $broadcastService)
    {
        $this->broadcastService = $broadcastService;
    }

    /**
     * Trigger dashboard update
     */
    private function triggerDashboardUpdate(string $action): void
    {
        try {
            Log::info('🔄 Triggering dashboard update after retur: ' . $action);
            $this->broadcastService->broadcast();
            Log::info('✅ Dashboard update triggered successfully for retur: ' . $action);
        } catch (\Exception $e) {
            Log::error('❌ Failed to trigger dashboard update for retur ' . $action . ': ' . $e->getMessage());
        }
    }

    public function getAll(Request $request)
    {
        $query = Retur::with([
            'transaction',
            'creator',
            'approver',
            'details.product',
            'images'
        ]);
        
        // Filter berdasarkan status
        if ($request->status === 'active') {
            $query->whereNotIn('status', ['completed', 'rejected']);
        } elseif ($request->status === 'history') {
            $query->whereIn('status', ['completed', 'rejected']);
        } elseif ($request->status) {
            $query->where('status', $request->status);
        }
        
        // Filter berdasarkan transaksi
        if ($request->transaction_id) {
            $query->where('transaction_id', $request->transaction_id);
        }
        
        // Filter berdasarkan customer
        if ($request->customer_id) {
            $query->whereHas('transaction', function($q) use ($request) {
                $q->where('customer_id', $request->customer_id);
            });
        }
        
        return $query->latest()->paginate($request->limit ?? 10);
    }

    public function detail(int $id)
    {
        return Retur::with([
            'transaction',
            'creator',
            'approver',
            'details.product',
            'images'
        ])->findOrFail($id);
    }

    public function create(
        array $data,
        array $images,
        int $userId
    ) {
        return DB::transaction(function () use (
            $data,
            $images,
            $userId
        ) {
            Log::info('Creating retur', [
                'transaction_id' => $data['transaction_id'],
                'type' => $data['type'],
                'user_id' => $userId
            ]);

            $transaction = Transaction::with('details')
                ->findOrFail($data['transaction_id']);
            
            // Cek apakah transaksi sudah selesai
            if ($transaction->status !== 'selesai') {
                abort(422, 'Retur hanya dapat dilakukan untuk transaksi yang sudah selesai');
            }

            $totalRefund = 0;

            $retur = Retur::create([
                'return_no' => $this->generateNo(),
                'transaction_id' => $transaction->id,
                'type' => $data['type'],
                'reason' => $data['reason'],
                'created_by' => $userId,
                'status' => 'pending',
            ]);

            foreach ($data['items'] as $item) {
                $detail = $transaction->details()
                    ->where('product_id', $item['product_id'])
                    ->firstOrFail();

                $subtotal = $detail->price * $item['qty'];
                $totalRefund += $subtotal;

                ReturDetail::create([
                    'retur_id' => $retur->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'price' => $detail->price,
                    'subtotal' => $subtotal,
                    'note' => $item['note'] ?? null,
                ]);
            }

            foreach ($images as $image) {
                $path = $image->store('returs', 'public');

                ReturImage::create([
                    'retur_id' => $retur->id,
                    'image' => $path,
                ]);
            }

            $retur->update([
                'total_refund' => $totalRefund
            ]);

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate('retur_created_' . $retur->id);

            return $this->detail($retur->id);
        });
    }

    public function approve(int $id, int $adminId)
    {
        return DB::transaction(function () use ($id, $adminId) {
            Log::info('Approving retur', [
                'id' => $id,
                'admin_id' => $adminId
            ]);

            $retur = Retur::findOrFail($id);
            
            // Untuk retur tipe refund, update stok
            if ($retur->type === 'refund') {
                foreach ($retur->details as $detail) {
                    $inventory = Inventory::where('product_id', $detail->product_id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $stockBefore = $inventory->stock;
                    $stockAfter = $stockBefore + $detail->qty;

                    $inventory->update(['stock' => $stockAfter]);

                    ProductMovement::create([
                        'inventory_id' => $inventory->id,
                        'product_id' => $detail->product_id,
                        'type' => 'in',
                        'qty' => $detail->qty,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => Retur::class,
                        'reference_id' => $retur->id,
                        'created_by' => $adminId,
                        'note' => 'Approval retur refund ' . $retur->return_no,
                    ]);
                }
            }
            
            // Untuk retur tipe exchange, stok akan dikurangi saat pengiriman replacement

            $retur->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $adminId,
            ]);

            Log::info('Retur approved', [
                'id' => $retur->id,
                'return_no' => $retur->return_no,
                'type' => $retur->type
            ]);

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate('retur_approved_' . $retur->id);

            return $retur->fresh();
        });
    }

    public function reject(int $id, string $reason)
    {
        Log::info('Rejecting retur', [
            'id' => $id,
            'reason' => $reason
        ]);

        $retur = Retur::findOrFail($id);

        $retur->update([
            'status' => 'rejected',
            'reject_reason' => $reason,
        ]);

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('retur_rejected_' . $retur->id);

        return $retur->fresh();
    }

    public function sendReplacement(int $id, string $resi, int $userId)
    {
        return DB::transaction(function () use ($id, $resi, $userId) {
            Log::info('Sending replacement', [
                'id' => $id,
                'resi' => $resi,
                'user_id' => $userId
            ]);

            $retur = Retur::with('details')->findOrFail($id);

            // Validasi: hanya exchange yang bisa dikirim penggantinya
            if ($retur->type !== 'exchange') {
                abort(422, 'Hanya retur tipe tukar barang yang dapat dikirim penggantinya');
            }

            // Validasi: hanya approved yang bisa dikirim penggantinya
            if ($retur->status !== 'approved') {
                abort(422, 'Retur harus disetujui terlebih dahulu sebelum mengirim pengganti');
            }

            foreach ($retur->details as $detail) {
                $inventory = Inventory::where('product_id', $detail->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($inventory->stock < $detail->qty) {
                    abort(422, 'Stok tidak cukup untuk mengirim barang pengganti');
                }

                $before = $inventory->stock;
                $after = $before - $detail->qty;

                $inventory->update(['stock' => $after]);

                ProductMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $detail->product_id,
                    'type' => 'out',
                    'qty' => $detail->qty,
                    'stock_before' => $before,
                    'stock_after' => $after,
                    'reference_type' => Retur::class,
                    'reference_id' => $retur->id,
                    'created_by' => $userId,
                    'note' => 'Replacement retur ' . $retur->return_no,
                ]);
            }

            $retur->update([
                'status' => 'replacement_sent',
                'replacement_resi' => $resi,
                'replacement_sent_at' => now(),
            ]);

            Log::info('Replacement sent', [
                'id' => $retur->id,
                'return_no' => $retur->return_no,
                'resi' => $resi
            ]);

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate('retur_replacement_sent_' . $retur->id);

            return $retur->fresh();
        });
    }

    public function complete(int $id)
    {
        Log::info('Completing retur', [
            'id' => $id
        ]);

        $retur = Retur::findOrFail($id);

        $retur->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('retur_completed_' . $retur->id);

        return $retur->fresh();
    }
    
    /**
     * Update Retur
     */
    public function update(int $id, array $data): Retur
    {
        Log::info('Updating retur', [
            'id' => $id,
            'data' => $data
        ]);

        $retur = Retur::findOrFail($id);
        
        // Hanya retur dengan status pending yang bisa diupdate
        if ($retur->status !== 'pending') {
            abort(422, 'Retur yang sudah diproses tidak dapat diubah');
        }
        
        $retur->update([
            'reason' => $data['reason'] ?? $retur->reason,
        ]);

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('retur_updated_' . $retur->id);
        
        return $retur->fresh();
    }
    
    /**
     * Delete Retur
     */
    public function delete(int $id): void
    {
        Log::info('Deleting retur', [
            'id' => $id
        ]);

        $retur = Retur::findOrFail($id);
        
        // Hanya retur dengan status pending yang bisa dihapus
        if ($retur->status !== 'pending') {
            abort(422, 'Retur yang sudah diproses tidak dapat dihapus');
        }
        
        // Hapus gambar terkait
        foreach ($retur->images as $image) {
            Storage::disk('public')->delete($image->image);
            $image->delete();
        }
        
        $retur->delete();

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate('retur_deleted_' . $id);
    }

    private function generateNo()
    {
        return 'RTR-' .
            now()->format('YmdHis') .
            '-' .
            strtoupper(Str::random(4));
    }
}