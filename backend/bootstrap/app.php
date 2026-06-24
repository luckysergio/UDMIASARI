<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(
    basePath: dirname(__DIR__)
)

    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })

    ->booting(function () {

        // 🔥 Tambahkan ini
        Broadcast::routes([
            'middleware' => ['auth:api']
        ]);

        RateLimiter::for('login', function (Request $request) {

            return Limit::perMinute(5)
                ->by($request->ip());
        });

        RateLimiter::for('register', function (Request $request) {

            return Limit::perMinute(3)
                ->by($request->ip());
        });

        RateLimiter::for('api', function (Request $request) {

            return Limit::perMinute(60)
                ->by(
                    $request->user()?->id
                        ?: $request->ip()
                );
        });
    })

    ->create();