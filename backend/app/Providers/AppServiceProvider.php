<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) {

            return env('FRONTEND_URL')
                . '/reset-password'
                . '?token=' . $token
                . '&email=' . urlencode($user->email);
        });
    }
}