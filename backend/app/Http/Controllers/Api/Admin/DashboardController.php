<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $service
    ) {}

    /**
     * Dashboard utama
     */
    public function index(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Data dashboard berhasil diambil',
                'data' => $this->service->getDashboardData($request),
            ]);
        } catch (\Throwable $e) {

            Log::error('Dashboard index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data dashboard',
            ], 500);
        }
    }

    /**
     * Chart pendapatan bulanan
     */
    public function monthlyRevenue(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Data chart pendapatan bulanan berhasil diambil',
                'data' => $this->service->getMonthlyRevenueChart($request),
            ]);
        } catch (\Throwable $e) {

            Log::error('Monthly revenue chart error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data chart pendapatan bulanan',
            ], 500);
        }
    }

    /**
     * Chart pendapatan harian
     */
    public function dailyRevenue(): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Data chart pendapatan harian berhasil diambil',
                'data' => $this->service->getDailyRevenueChart(),
            ]);
        } catch (\Throwable $e) {

            Log::error('Daily revenue chart error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data chart pendapatan harian',
            ], 500);
        }
    }
}