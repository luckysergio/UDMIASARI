<?php
// app/Services/NotificationService.php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    const CACHE_KEY = 'order_notifications';
    const DURATION = 1800; // 30 menit dalam detik

    /**
     * Get all active notifications
     */
    public function getActiveNotifications(): array
    {
        try {
            $notifications = Cache::get(self::CACHE_KEY, []);

            // Filter notifikasi yang masih aktif (belum melewati 30 menit)
            $active = array_filter($notifications, function ($notification) {
                if (!isset($notification['created_at'])) {
                    return false;
                }
                try {
                    $createdAt = \Carbon\Carbon::parse($notification['created_at']);
                    return $createdAt->diffInMinutes(now()) < 30;
                } catch (\Exception $e) {
                    return false;
                }
            });

            // Update cache jika ada yang expired
            if (count($active) !== count($notifications)) {
                Cache::put(self::CACHE_KEY, array_values($active), self::DURATION);
            }

            return array_values($active);
        } catch (\Exception $e) {
            Log::error('Error getting notifications: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Add new notification
     */
    public function addNotification(array $data): void
{
    try {
        $notifications = Cache::get(self::CACHE_KEY, []);

        $data['created_at'] = now()->toISOString();
        $data['expires_at'] = now()->addMinutes(30)->timestamp;

        $exists = collect($notifications)
            ->contains('id', $data['id'] ?? null);

        if (!$exists) {

            $notifications[] = $data;

            // maksimal 50 data
            $notifications = array_slice($notifications, -50);

            Cache::put(
                self::CACHE_KEY,
                $notifications,
                self::DURATION
            );

            Log::info('✅ Notification added to cache', [
                'id' => $data['id'],
                'total' => count($notifications)
            ]);
        }
    } catch (\Exception $e) {
        Log::error(
            'Error adding notification: ' .
            $e->getMessage()
        );
    }
}

    /**
     * Mark notification as read (remove from cache)
     */
    public function markAsRead(int $notificationId): bool
    {
        try {
            $notifications = Cache::get(self::CACHE_KEY, []);
            $filtered = array_filter($notifications, function ($n) use ($notificationId) {
                return ($n['id'] ?? null) !== $notificationId;
            });

            Cache::put(self::CACHE_KEY, array_values($filtered), self::DURATION);
            Log::info('✅ Notification marked as read', ['id' => $notificationId, 'remaining' => count($filtered)]);
            return true;
        } catch (\Exception $e) {
            Log::error('Error marking notification as read: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Clear all notifications
     */
    public function clearAll(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
            Log::info('✅ All notifications cleared');
        } catch (\Exception $e) {
            Log::error('Error clearing notifications: ' . $e->getMessage());
        }
    }
}
