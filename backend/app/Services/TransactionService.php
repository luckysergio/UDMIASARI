<?php

namespace App\Services;

use App\Models\User;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Transaction;
use App\Models\ProductMovement;
use App\Models\TransactionDetail;
use App\Events\DashboardStatsUpdated; // Import event

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TransactionService
{
    protected DashboardBroadcastService $broadcastService;

    public function __construct(DashboardBroadcastService $broadcastService)
    {
        $this->broadcastService = $broadcastService;
    }

    /**
     * Trigger dashboard update
     */
    private function triggerDashboardUpdate(): void
    {
        try {
            $this->broadcastService->broadcast();
        } catch (\Exception $e) {
            Log::error('Failed to broadcast dashboard update: ' . $e->getMessage());
        }
    }

    /**
     * List
     */
    public function getAll(Request $request): LengthAwarePaginator
    {
        $query = Transaction::with([
            'customer',
            'creator',
            'details.product',
            'payments.details'
        ]);

        // Filter berdasarkan nomor invoice
        if ($request->search) {
            $query->where('invoice_no', 'LIKE', '%' . $request->search . '%');
        }

        // Filter berdasarkan status
        if ($request->status === 'active') {
            $query->whereNotIn('status', ['selesai', 'dibatalkan']);
        } elseif ($request->status === 'completed') {
            $query->whereIn('status', ['selesai', 'dibatalkan']);
        } elseif ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Filter berdasarkan kategori produk
        if ($request->category_id) {
            $query->whereHas('details.product', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // Filter berdasarkan jenis produk
        if ($request->jenis_id) {
            $query->whereHas('details.product', function ($q) use ($request) {
                $q->where('jenis_id', $request->jenis_id);
            });
        }

        // Filter berdasarkan customer_id
        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        return $query->latest()->paginate($request->limit ?? 10);
    }

    /**
     * Detail
     */
    public function detail(int $id): Transaction
    {
        return Transaction::with([
            'customer',
            'creator',
            'details.product.category',
            'details.product.jenis',
            'payments.details',
        ])->findOrFail($id);
    }

    /**
     * Create Transaction
     */
    public function create(array $data, User $user): Transaction
    {
        return DB::transaction(function () use ($data, $user) {
            $productIds = collect($data['items'])->pluck('product_id');

            if ($productIds->count() !== $productIds->unique()->count()) {
                abort(422, 'Product tidak boleh duplikat');
            }

            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $inventory = Inventory::where('product_id', $item['product_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$inventory) {
                    abort(422, 'Inventory tidak ditemukan untuk produk ID: ' . $item['product_id']);
                }

                if ($inventory->stock < $item['qty']) {
                    abort(422, 'Stok tidak mencukupi untuk produk: ' . ($products[$item['product_id']]->name ?? 'Unknown'));
                }

                $product = $products[$item['product_id']];
                $subtotal += $product->price * $item['qty'];
            }

            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $grandTotal = $subtotal - $discount + $tax;

            $customer = null;
            $customerName = $data['customer_name'] ?? null;
            $customerPhone = $data['customer_phone'] ?? null;

            // Jika user adalah customer, gunakan data dari user yang login
            if ($user->role === 'customer') {
                $customer = $user;
                $customerName = $user->name;
                $customerPhone = $user->phone;
            }
            // Jika user bukan customer tapi ada customer_id
            elseif (isset($data['customer_id']) && $data['customer_id']) {
                $customer = User::find($data['customer_id']);
                if ($customer) {
                    $customerName = $customer->name;
                    $customerPhone = $customer->phone;
                }
            }
            // Jika customer_name dikirim dari frontend
            else {
                $customerName = $data['customer_name'] ?? 'Umum';
                $customerPhone = $data['customer_phone'] ?? null;
            }

            $transaction = Transaction::create([
                'invoice_no' => $this->generateInvoice(),
                'customer_id' => $customer ? $customer->id : null,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'delivery_type' => $data['delivery_type'],
                'delivery_address' => $data['delivery_address'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'grand_total' => $grandTotal,
                'status' => 'dipesan',
                'note' => $data['note'] ?? null,
                'created_by' => $user->id,
            ]);

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];
                $inventory = Inventory::where('product_id', $product->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $stockBefore = $inventory->stock;
                $stockAfter = $stockBefore - $item['qty'];

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'qty' => $item['qty'],
                    'price' => $product->price,
                    'subtotal' => $product->price * $item['qty'],
                ]);

                $inventory->update(['stock' => $stockAfter]);

                ProductMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $product->id,
                    'type' => 'out',
                    'qty' => $item['qty'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => Transaction::class,
                    'reference_id' => $transaction->id,
                    'created_by' => $user->id,
                    'note' => 'Transaksi ' . $transaction->invoice_no,
                ]);
            }

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate();

            return $this->detail($transaction->id);
        });
    }

    /**
     * Update Transaction
     */
    public function update(int $id, array $data, int $userId): Transaction
    {
        $transaction = Transaction::findOrFail($id);
        
        $transaction->update([
            'customer_name' => $data['customer_name'] ?? $transaction->customer_name,
            'customer_phone' => $data['customer_phone'] ?? $transaction->customer_phone,
            'delivery_type' => $data['delivery_type'] ?? $transaction->delivery_type,
            'delivery_address' => $data['delivery_address'] ?? $transaction->delivery_address,
            'discount' => $data['discount'] ?? $transaction->discount,
            'tax' => $data['tax'] ?? $transaction->tax,
            'note' => $data['note'] ?? $transaction->note,
        ]);
        
        // Recalculate grand total jika subtotal berubah
        if (isset($data['subtotal'])) {
            $transaction->subtotal = $data['subtotal'];
            $transaction->grand_total = $transaction->subtotal - $transaction->discount + $transaction->tax;
            $transaction->save();
        }

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate();
        
        return $this->detail($transaction->id);
    }

    /**
     * Update Status
     */
    public function updateStatus(int $id, string $status, int $userId): Transaction
    {
        return DB::transaction(function () use ($id, $status, $userId) {
            $allowedStatus = [
                'dipesan',
                'diproses',
                'dikirim',
                'siap_ambil',
                'selesai',
                'dibatalkan'
            ];

            if (!in_array($status, $allowedStatus)) {
                abort(422, 'Status tidak valid. Status yang diizinkan: ' . implode(', ', $allowedStatus));
            }

            $transaction = Transaction::with('details')->findOrFail($id);
            $oldStatus = $transaction->status;

            /**
             * AKSI BATALKAN
             */
            if ($status === 'dibatalkan' && $oldStatus !== 'dibatalkan') {
                foreach ($transaction->details as $detail) {
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
                        'reference_type' => Transaction::class,
                        'reference_id' => $transaction->id,
                        'created_by' => $userId,
                        'note' => 'Pembatalan transaksi ' . $transaction->invoice_no,
                    ]);
                }
            }

            /**
             * AKTIFKAN KEMBALI (dibatalkan -> selain dibatalkan)
             */
            if ($oldStatus === 'dibatalkan' && $status !== 'dibatalkan') {
                foreach ($transaction->details as $detail) {
                    $inventory = Inventory::where('product_id', $detail->product_id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($inventory->stock < $detail->qty) {
                        abort(422, 'Stok tidak mencukupi untuk mengaktifkan kembali transaksi');
                    }

                    $stockBefore = $inventory->stock;
                    $stockAfter = $stockBefore - $detail->qty;

                    $inventory->update(['stock' => $stockAfter]);

                    ProductMovement::create([
                        'inventory_id' => $inventory->id,
                        'product_id' => $detail->product_id,
                        'type' => 'out',
                        'qty' => $detail->qty,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => Transaction::class,
                        'reference_id' => $transaction->id,
                        'created_by' => $userId,
                        'note' => 'Aktif kembali transaksi ' . $transaction->invoice_no,
                    ]);
                }
            }

            $transaction->update(['status' => $status]);

            // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
            $this->triggerDashboardUpdate();

            return $this->detail($transaction->id);
        });
    }

    /**
     * Delete Transaction
     */
    public function delete(int $id): void
    {
        $transaction = Transaction::findOrFail($id);
        
        // Cek apakah transaksi sudah memiliki pembayaran
        if ($transaction->payments()->exists()) {
            abort(422, 'Transaksi yang sudah memiliki pembayaran tidak dapat dihapus');
        }
        
        $transaction->delete();

        // 🔥 TRIGGER REAL-TIME DASHBOARD UPDATE
        $this->triggerDashboardUpdate();
    }

    /**
     * Generate Invoice
     */
    private function generateInvoice(): string
    {
        return 'INV-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(4));
    }
}