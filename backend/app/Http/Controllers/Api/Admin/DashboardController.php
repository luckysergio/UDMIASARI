<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    protected DashboardService $service;

    public function __construct(DashboardService $service)
    {
        $this->service = $service;
    }

    /**
     * Get main dashboard data
     */
    public function index(Request $request)
    {
        try {
            $data = $this->service->getDashboardData($request);
            
            return response()->json([
                'status' => true,
                'message' => 'Data dashboard berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard index error: ' . $e->getMessage());
            Log::error('Dashboard index trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data dashboard: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get monthly revenue chart
     */
    public function monthlyRevenue(Request $request)
    {
        try {
            $data = $this->service->getMonthlyRevenueChart($request);
            
            return response()->json([
                'status' => true,
                'message' => 'Data chart pendapatan bulanan berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Monthly revenue chart error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data chart: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get daily revenue chart for current month
     */
    public function dailyRevenue()
    {
        try {
            $data = $this->service->getDailyRevenueChart();
            
            return response()->json([
                'status' => true,
                'message' => 'Data chart pendapatan harian berhasil diambil',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Daily revenue chart error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data chart: ' . $e->getMessage(),
            ], 500);
        }
    }
}