<?php

namespace App\Services;

use Illuminate\Support\Facades\Password;

class ForgotPasswordService
{
    public function sendResetLink(string $email): array
    {
        $status = Password::sendResetLink([
            'email' => $email
        ]);

        if ($status === Password::RESET_LINK_SENT) {
            return [
                'status' => true,
                'message' => __($status),
            ];
        }

        return [
            'status' => false,
            'message' => __($status),
        ];
    }
}