<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ProfileService
{
    /**
     * Update user profile
     */
    public function updateProfile(int $userId, array $data): User
    {
        $user = User::findOrFail($userId);
        
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]);
        
        return $user->fresh();
    }
    
    /**
     * Change user password
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): bool
    {
        $user = User::findOrFail($userId);
        
        // Check if current password is correct
        if (!Hash::check($currentPassword, $user->password)) {
            return false;
        }
        
        // Update password
        $user->update([
            'password' => Hash::make($newPassword)
        ]);
        
        return true;
    }
}