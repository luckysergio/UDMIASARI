<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Retur;
use App\Models\TransactionDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Get dashboard data
     */
    public function getDashboardData(Request $request): array
    {
        try {
            // Get current month and last month
            $now = Carbon::now();
            $currentMonthStart = $now->copy()->startOfMonth();
            $currentMonthEnd = $now->copy()->endOfMonth();
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
            $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

            // 1. Pendapatan bulan ini & bulan lalu
            $currentMonthRevenue = $this->getRevenue($currentMonthStart, $currentMonthEnd);
            $lastMonthRevenue = $this->getRevenue($lastMonthStart, $lastMonthEnd);

            // 2. Jumlah retur bulan ini & bulan lalu
            $currentMonthReturCount = $this->getReturCount($currentMonthStart, $currentMonthEnd);
            $lastMonthReturCount = $this->getReturCount($lastMonthStart, $lastMonthEnd);

            // 3. Product terlaris bulan ini, bulan lalu, dan all time
            $topProductsCurrentMonth = $this->getTopProducts($currentMonthStart, $currentMonthEnd, 5);
            $topProductsLastMonth = $this->getTopProducts($lastMonthStart, $lastMonthEnd, 5);
            $topProductsAllTime = $this->getTopProducts(null, null, 5); // Ubah limit menjadi 5

            // 4. Transaksi aktif (belum selesai dan belum dibatalkan)
            $activeTransactions = $this->getActiveTransactions(5);

            // 5. Retur aktif (pending, approved, replacement_sent)
            $activeReturs = $this->getActiveReturs(5);

            // 6. Statistik tambahan
            $statistics = $this->getStatistics();

            // Log untuk debugging
            Log::info('Dashboard data loaded', [
                'top_products_current_month_count' => $topProductsCurrentMonth->count(),
                'top_products_all_time_count' => $topProductsAllTime->count(),
            ]);

            return [
                'revenue' => [
                    'current_month' => $currentMonthRevenue,
                    'last_month' => $lastMonthRevenue,
                    'growth_percentage' => $this->calculateGrowthPercentage($lastMonthRevenue, $currentMonthRevenue),
                    'current_month_label' => $now->format('F Y'),
                    'last_month_label' => $now->copy()->subMonth()->format('F Y'),
                ],
                'retur' => [
                    'current_month' => $currentMonthReturCount,
                    'last_month' => $lastMonthReturCount,
                    'growth_percentage' => $this->calculateGrowthPercentage($lastMonthReturCount, $currentMonthReturCount),
                    'current_month_label' => $now->format('F Y'),
                    'last_month_label' => $now->copy()->subMonth()->format('F Y'),
                ],
                'top_products' => [
                    'current_month' => $topProductsCurrentMonth,
                    'last_month' => $topProductsLastMonth,
                    'all_time' => $topProductsAllTime,
                ],
                'active_transactions' => $activeTransactions,
                'active_returs' => $activeReturs,
                'statistics' => $statistics,
            ];
        } catch (\Exception $e) {
            Log::error('DashboardService getDashboardData error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get revenue from completed transactions
     */
    private function getRevenue(?Carbon $startDate, ?Carbon $endDate): float
    {
        try {
            $query = Transaction::where('status', 'selesai');
            
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
            
            return (float) ($query->sum('grand_total') ?? 0);
        } catch (\Exception $e) {
            Log::error('getRevenue error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get retur count
     */
    private function getReturCount(?Carbon $startDate, ?Carbon $endDate): int
    {
        try {
            $query = Retur::whereIn('status', ['completed', 'replacement_sent']);
            
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
            
            return (int) $query->count();
        } catch (\Exception $e) {
            Log::error('getReturCount error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get top selling products - FIXED untuk menampilkan 5 produk
     */
    private function getTopProducts(?Carbon $startDate, ?Carbon $endDate, int $limit = 5): \Illuminate\Support\Collection
    {
        try {
            // Query untuk mengambil produk terlaris berdasarkan qty
            $query = TransactionDetail::select(
                    'transaction_details.product_id',
                    DB::raw('SUM(transaction_details.qty) as total_qty_sold'),
                    DB::raw('SUM(transaction_details.subtotal) as total_revenue')
                )
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.status', 'selesai');
            
            // Apply date filters if provided
            if ($startDate && $endDate) {
                $query->whereBetween('transactions.created_at', [$startDate, $endDate]);
            }
            
            // Group by product_id and order by total quantity sold
            $results = $query->groupBy('transaction_details.product_id')
                ->orderBy('total_qty_sold', 'desc')
                ->limit($limit)
                ->get();
            
            // Log untuk debugging
            Log::info('Top products query results', [
                'limit' => $limit,
                'start_date' => $startDate ? $startDate->format('Y-m-d') : null,
                'end_date' => $endDate ? $endDate->format('Y-m-d') : null,
                'count' => $results->count(),
                'product_ids' => $results->pluck('product_id')->toArray(),
                'quantities' => $results->pluck('total_qty_sold')->toArray()
            ]);
            
            if ($results->isEmpty()) {
                return collect([]);
            }
            
            // Get product details
            $productIds = $results->pluck('product_id')->toArray();
            $products = Product::with(['category', 'jenis'])
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');
            
            $mappedResults = $results->map(function ($item) use ($products) {
                $product = $products[$item->product_id] ?? null;
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $product ? $product->name : 'Product Deleted',
                    'product_code' => $product ? $product->code : '-',
                    'category_name' => $product && $product->category ? $product->category->name : '-',
                    'jenis_name' => $product && $product->jenis ? $product->jenis->name : '-',
                    'total_qty_sold' => (int) $item->total_qty_sold,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });
            
            // Log hasil mapping
            Log::info('Top products mapped results', [
                'count' => $mappedResults->count(),
                'data' => $mappedResults->toArray()
            ]);
            
            return $mappedResults;
        } catch (\Exception $e) {
            Log::error('getTopProducts error: ' . $e->getMessage());
            Log::error('getTopProducts trace: ' . $e->getTraceAsString());
            return collect([]);
        }
    }

    /**
     * Get active transactions (not completed or cancelled)
     */
    private function getActiveTransactions(int $limit = 5): \Illuminate\Support\Collection
    {
        try {
            return Transaction::with(['customer', 'creator', 'payments'])
                ->whereNotIn('status', ['selesai', 'dibatalkan'])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($transaction) {
                    $totalPaid = $transaction->payments->sum('total_paid');
                    return [
                        'id' => $transaction->id,
                        'invoice_no' => $transaction->invoice_no,
                        'customer_name' => $transaction->customer_name ?? 'Umum',
                        'grand_total' => (float) $transaction->grand_total,
                        'total_paid' => (float) $totalPaid,
                        'remaining_amount' => (float) ($transaction->grand_total - $totalPaid),
                        'status' => $transaction->status,
                        'status_label' => $this->getStatusLabel($transaction->status),
                        'created_at' => $transaction->created_at,
                        'created_at_formatted' => $transaction->created_at ? $transaction->created_at->format('d/m/Y H:i') : '-',
                    ];
                });
        } catch (\Exception $e) {
            Log::error('getActiveTransactions error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get active returs (pending, approved, replacement_sent)
     */
    private function getActiveReturs(int $limit = 5): \Illuminate\Support\Collection
    {
        try {
            return Retur::with(['transaction', 'creator'])
                ->whereIn('status', ['pending', 'approved', 'replacement_sent'])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($retur) {
                    return [
                        'id' => $retur->id,
                        'return_no' => $retur->return_no,
                        'invoice_no' => $retur->transaction ? $retur->transaction->invoice_no : '-',
                        'customer_name' => $retur->transaction ? $retur->transaction->customer_name : 'Umum',
                        'type' => $retur->type,
                        'type_label' => $retur->type === 'refund' ? 'Retur Barang' : 'Tukar Barang',
                        'total_refund' => (float) $retur->total_refund,
                        'status' => $retur->status,
                        'status_label' => $this->getReturStatusLabel($retur->status),
                        'created_at' => $retur->created_at,
                        'created_at_formatted' => $retur->created_at ? $retur->created_at->format('d/m/Y H:i') : '-',
                    ];
                });
        } catch (\Exception $e) {
            Log::error('getActiveReturs error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get statistics (total products, total transactions, etc)
     */
    private function getStatistics(): array
    {
        try {
            $now = Carbon::now();
            $currentMonthStart = $now->copy()->startOfMonth();
            $currentMonthEnd = $now->copy()->endOfMonth();

            return [
                'total_products' => Product::where('is_active', true)->count(),
                'total_transactions' => Transaction::count(),
                'total_revenue_all_time' => (float) (Transaction::where('status', 'selesai')->sum('grand_total') ?? 0),
                'total_returs' => Retur::count(),
                'completed_returs' => Retur::where('status', 'completed')->count(),
                'pending_returs' => Retur::where('status', 'pending')->count(),
                'this_month_transactions' => Transaction::whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])->count(),
                'this_month_revenue' => (float) (Transaction::where('status', 'selesai')
                    ->whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])
                    ->sum('grand_total') ?? 0),
            ];
        } catch (\Exception $e) {
            Log::error('getStatistics error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'total_transactions' => 0,
                'total_revenue_all_time' => 0,
                'total_returs' => 0,
                'completed_returs' => 0,
                'pending_returs' => 0,
                'this_month_transactions' => 0,
                'this_month_revenue' => 0,
            ];
        }
    }

    /**
     * Get monthly revenue chart data
     */
    public function getMonthlyRevenueChart(Request $request): array
    {
        try {
            $year = $request->year ?? Carbon::now()->year;
            
            $monthlyRevenue = [];
            
            for ($month = 1; $month <= 12; $month++) {
                $startDate = Carbon::create($year, $month, 1)->startOfMonth();
                $endDate = Carbon::create($year, $month, 1)->endOfMonth();
                
                $revenue = Transaction::where('status', 'selesai')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('grand_total') ?? 0;
                
                $monthlyRevenue[] = [
                    'month' => $month,
                    'month_name' => Carbon::create($year, $month, 1)->format('F'),
                    'revenue' => (float) $revenue,
                ];
            }
            
            return $monthlyRevenue;
        } catch (\Exception $e) {
            Log::error('getMonthlyRevenueChart error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get daily revenue chart data for current month
     */
    public function getDailyRevenueChart(): array
    {
        try {
            $now = Carbon::now();
            $daysInMonth = $now->daysInMonth;
            $dailyRevenue = [];
            
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $date = Carbon::create($now->year, $now->month, $day);
                $startDate = $date->copy()->startOfDay();
                $endDate = $date->copy()->endOfDay();
                
                $revenue = Transaction::where('status', 'selesai')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('grand_total') ?? 0;
                
                $dailyRevenue[] = [
                    'day' => $day,
                    'date' => $date->format('Y-m-d'),
                    'date_formatted' => $date->format('d/m/Y'),
                    'revenue' => (float) $revenue,
                ];
            }
            
            return $dailyRevenue;
        } catch (\Exception $e) {
            Log::error('getDailyRevenueChart error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calculate growth percentage
     */
    private function calculateGrowthPercentage(float $lastValue, float $currentValue): float
    {
        if ($lastValue == 0) {
            return $currentValue > 0 ? 100 : 0;
        }
        
        return round((($currentValue - $lastValue) / $lastValue) * 100, 2);
    }

    /**
     * Get status label for transaction
     */
    private function getStatusLabel(string $status): string
    {
        $labels = [
            'dipesan' => 'Dipesan',
            'diproses' => 'Diproses',
            'dikirim' => 'Dikirim',
            'siap_ambil' => 'Siap Diambil',
            'selesai' => 'Selesai',
            'dibatalkan' => 'Dibatalkan',
        ];
        return $labels[$status] ?? $status;
    }

    /**
     * Get status label for retur
     */
    private function getReturStatusLabel(string $status): string
    {
        $labels = [
            'pending' => 'Pending',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'replacement_sent' => 'Pengganti Dikirim',
            'completed' => 'Selesai',
        ];
        return $labels[$status] ?? $status;
    }
}