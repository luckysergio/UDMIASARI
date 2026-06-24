<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all active notifications
     */
    public function index(): JsonResponse
    {
        try {
            $notifications = $this->notificationService->getActiveNotifications();
            
            return response()->json([
                'status' => true,
                'data' => $notifications,
                'count' => count($notifications),
            ]);
        } catch (\Exception $e) {
            Log::error('Notification index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil notifikasi',
                'data' => [],
                'count' => 0,
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        try {
            $success = $this->notificationService->markAsRead($id);
            
            return response()->json([
                'status' => $success,
                'message' => $success ? 'Notifikasi ditandai telah dibaca' : 'Gagal menandai notifikasi',
            ]);
        } catch (\Exception $e) {
            Log::error('Mark notification error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal menandai notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear all notifications
     */
    public function clearAll(): JsonResponse
    {
        try {
            $this->notificationService->clearAll();
            
            return response()->json([
                'status' => true,
                'message' => 'Semua notifikasi telah dibersihkan',
            ]);
        } catch (\Exception $e) {
            Log::error('Clear notifications error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Gagal membersihkan notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }
}