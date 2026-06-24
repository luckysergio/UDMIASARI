<?php

namespace App\Services;

use App\Events\DashboardStatsUpdated;
use Illuminate\Http\Request;

class DashboardBroadcastService
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function broadcast(): void
    {
        $stats = $this->dashboardService->getDashboardData(
            new Request()
        );

        event(new DashboardStatsUpdated($stats));
    }
}
