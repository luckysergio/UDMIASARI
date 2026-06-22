<?php

namespace App\Services;

use App\Models\Product;
use App\Models\TransactionDetail;
use App\Models\Category;
use App\Models\Jenis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LandingPageService
{
    /**
     * Get landing page data
     */
    public function getLandingData(Request $request): array
    {
        try {
            // 1. Produk Terlaris (Top 10 berdasarkan penjualan)
            $topProducts = $this->getTopProducts(10);

            // 2. Semua produk yang stoknya > 0 (bisa dipesan)
            $allProducts = $this->getAllAvailableProducts($request);

            // 3. About company
            $aboutCompany = $this->getAboutCompany();

            // 4. Categories and Jenis for filter
            $categories = Category::all();
            $jenis = Jenis::all();

            return [
                'top_products' => $topProducts,
                'all_products' => $allProducts,
                'about_company' => $aboutCompany,
                'categories' => $categories,
                'jenis' => $jenis,
                'statistics' => $this->getStatistics(),
            ];
        } catch (\Exception $e) {
            Log::error('LandingPageService getLandingData error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get top selling products
     */
    private function getTopProducts(int $limit = 10): \Illuminate\Support\Collection
    {
        try {
            // Query untuk mendapatkan product_id dan total sold
            $results = TransactionDetail::select(
                'product_id',
                DB::raw('SUM(qty) as total_sold')
            )
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.status', 'selesai')
                ->groupBy('product_id')
                ->orderBy('total_sold', 'desc')
                ->limit($limit)
                ->get();

            if ($results->isEmpty()) {
                // Jika tidak ada transaksi, ambil produk random
                return Product::with(['category', 'jenis', 'inventory'])
                    ->where('is_active', true)
                    ->whereHas('inventory', function ($q) {
                        $q->where('stock', '>', 0);
                    })
                    ->limit($limit)
                    ->get()
                    ->map(function ($product) {
                        return $this->formatProduct($product);
                    });
            }

            // Ambil semua produk berdasarkan product_id dari hasil query
            $productIds = $results->pluck('product_id')->toArray();
            $products = Product::with(['category', 'jenis', 'inventory'])
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->get()
                ->keyBy('id');

            // Format hasil dengan memastikan $product adalah model Product
            $formattedProducts = collect();
            foreach ($results as $item) {
                $productId = (int) $item->product_id;
                $product = $products->get($productId);

                if ($product && $product instanceof Product) {
                    $formattedProducts->push($this->formatProduct($product, (int) $item->total_sold));
                } else {
                    // Jika produk tidak ditemukan di database, cari langsung
                    $directProduct = Product::with(['category', 'jenis', 'inventory'])
                        ->where('id', $productId)
                        ->where('is_active', true)
                        ->first();

                    if ($directProduct) {
                        $formattedProducts->push($this->formatProduct($directProduct, (int) $item->total_sold));
                    }
                }
            }

            // Jika jumlah produk kurang dari limit, tambahkan produk random
            if ($formattedProducts->count() < $limit) {
                $existingIds = $formattedProducts->pluck('id')->toArray();
                $additionalProducts = Product::with(['category', 'jenis', 'inventory'])
                    ->where('is_active', true)
                    ->whereNotIn('id', $existingIds)
                    ->whereHas('inventory', function ($q) {
                        $q->where('stock', '>', 0);
                    })
                    ->limit($limit - $formattedProducts->count())
                    ->get();

                foreach ($additionalProducts as $product) {
                    $formattedProducts->push($this->formatProduct($product));
                }
            }

            return $formattedProducts;
        } catch (\Exception $e) {
            Log::error('getTopProducts error: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get all available products (stock > 0) with pagination and filters
     */
    private function getAllAvailableProducts(Request $request): array
    {
        $query = Product::with(['category', 'jenis', 'inventory'])
            ->where('is_active', true)
            ->whereHas('inventory', function ($q) {
                $q->where('stock', '>', 0);
            });

        // Filter by category
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by jenis
        if ($request->jenis_id) {
            $query->where('jenis_id', $request->jenis_id);
        }

        // Search by name or code
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                    ->orWhere('code', 'ilike', '%' . $request->search . '%');
            });
        }

        // Sort options
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';

        if ($sortBy === 'price') {
            $query->orderBy('price', $sortOrder);
        } elseif ($sortBy === 'name') {
            $query->orderBy('name', $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->limit ?? 12;
        $products = $query->paginate($perPage);

        // Format products
        $formattedProducts = collect();
        foreach ($products->items() as $product) {
            if ($product instanceof Product) {
                $formattedProducts->push($this->formatProduct($product));
            }
        }

        return [
            'data' => $formattedProducts,
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
        ];
    }

    /**
     * Get about company information
     */
    private function getAboutCompany(): array
    {
        return [
            'name' => 'UD. Mia Sari',
            'tagline' => 'Kehangatan Rasa Bakso Tradisional dan Higienis',
            'logo_url' => $this->getLogoUrl(), // 🔥 Tambahkan URL logo
            'description' => 'UD. Mia Sari adalah produsen bakso rumahan asal Tangerang yang berkomitmen menyajikan bakso berkualitas tinggi, halal, dan higienis. Mengkombinasikan resep tradisional dengan proses produksi modern, kami siap memenuhi kebutuhan pasokan bakso untuk konsumsi harian, mitra warung retail, hingga pedagang kuliner keliling.',
            'vision' => 'Menjadi produsen bakso pilihan utama di Tangerang dan sekitarnya yang dikenal karena kualitas rasa, kebersihan, dan pelayanan terbaik.',
            'mission' => [
                'Memproduksi bakso dengan bahan baku daging pilihan yang segar dan berkualitas.',
                'Menjaga standar kebersihan dan higienitas yang tinggi di setiap tahapan produksi.',
                'Memberikan kemudahan akses pemesanan bagi pelanggan retail maupun mitra bisnis.',
                'Membangun hubungan kemitraan yang saling menguntungkan dengan pelaku usaha kuliner lokal.',
            ],
            'founded_year' => 2024,
            'address' => 'Tangerang, Banten, Indonesia',
            'phone' => '+62 85886682496',
            'email' => 'baksomiasari@gmail.com',
            'social_media' => [
                'facebook' => 'https://facebook.com/udmiasari.bakso',
                'instagram' => 'https://instagram.com/udmiasari.bakso',
                // 🔥 Hapus twitter dan linkedin
            ],
        ];
    }

    private function getLogoUrl(): ?string
    {
        // 🔥 Gunakan path logo yang sudah ditentukan
        $logoPath = 'logo/logo.png';

        // Cek apakah file logo ada di storage
        if (file_exists(storage_path('app/public/' . $logoPath))) {
            return asset('storage/' . $logoPath);
        }

        return null;
    }

    /**
     * Get statistics for landing page
     */
    private function getStatistics(): array
    {
        return [
            'total_products' => Product::where('is_active', true)->count(),
            'total_customers' => 1250, // Bisa diambil dari database
            'total_transactions' => TransactionDetail::join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.status', 'selesai')
                ->sum('transaction_details.qty'),
            'satisfied_clients' => 98,
        ];
    }

    /**
     * Format product data
     * @param Product $product
     * @param int $totalSold
     */
    private function formatProduct(Product $product, int $totalSold = 0): array
    {
        return [
            'id' => $product->id,
            'code' => $product->code,
            'name' => $product->name,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock' => $product->inventory ? $product->inventory->stock : 0,
            'image' => $product->image ? asset('storage/' . $product->image) : null,
            'category_id' => $product->category_id,
            'category_name' => $product->category ? $product->category->name : null,
            'jenis_id' => $product->jenis_id,
            'jenis_name' => $product->jenis ? $product->jenis->name : null,
            'is_available' => $product->inventory && $product->inventory->stock > 0,
            'total_sold' => $totalSold,
        ];
    }
}
