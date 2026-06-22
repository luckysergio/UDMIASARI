<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;

use App\Http\Controllers\Api\Public\LandingPageController;
use App\Http\Controllers\Api\Public\ForgotPasswordController;
use App\Http\Controllers\Api\Public\ResetPasswordController;

use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\JenisController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\InventoryController;
use App\Http\Controllers\Api\Admin\PaymentController;
use App\Http\Controllers\Api\Admin\ProductMovementController;
use App\Http\Controllers\Api\Admin\ReturController;
use App\Http\Controllers\Api\Admin\TransactionController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:register');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::prefix('public')->group(function () {

    Route::get('/landing', [LandingPageController::class, 'index']);
    Route::get('/products/{id}', [LandingPageController::class, 'show']);

    Route::post(
        '/forgot-password',
        [ForgotPasswordController::class, 'sendResetLink']
    )->middleware('throttle:login');

    Route::post(
        '/reset-password',
        [ResetPasswordController::class, 'reset']
    );
});

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'throttle:api'
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put(
        '/profile/change-password',
        [ProfileController::class, 'changePassword']
    );

    /*
    |--------------------------------------------------------------------------
    | SHARED (SEMUA USER LOGIN)
    |--------------------------------------------------------------------------
    */

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    Route::get('/returs', [ReturController::class, 'index']);
    Route::get('/returs/{id}', [ReturController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER + ADMIN
    | Bisa melihat dan membuat pembayaran
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:customer,admin')->group(function () {

        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::post('/transactions', [
            TransactionController::class,
            'store'
        ]);

        Route::post('/returs', [
            ReturController::class,
            'store'
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN + KEPALA PRODUKSI
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin,kepala_produksi')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::prefix('dashboard')->group(function () {

            Route::get('/', [
                DashboardController::class,
                'index'
            ]);

            Route::get(
                '/monthly-revenue',
                [DashboardController::class, 'monthlyRevenue']
            );

            Route::get(
                '/daily-revenue',
                [DashboardController::class, 'dailyRevenue']
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Read Only Master Data
        |--------------------------------------------------------------------------
        */

        Route::get('/categories', [
            CategoryController::class,
            'index'
        ]);

        Route::get('/categories/{id}', [
            CategoryController::class,
            'show'
        ]);

        Route::get('/jenis', [
            JenisController::class,
            'index'
        ]);

        Route::get('/jenis/{id}', [
            JenisController::class,
            'show'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Inventory
        |--------------------------------------------------------------------------
        */

        Route::get('/inventories', [
            InventoryController::class,
            'index'
        ]);

        Route::get('/inventories/{id}', [
            InventoryController::class,
            'show'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Product Movement
        |--------------------------------------------------------------------------
        */

        Route::get('/product-movements', [
            ProductMovementController::class,
            'index'
        ]);

        Route::get('/product-movements/{id}', [
            ProductMovementController::class,
            'show'
        ]);

        Route::post('/product-movements', [
            ProductMovementController::class,
            'store'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Payment Verification
        |--------------------------------------------------------------------------
        */

        Route::patch(
            '/payments/{id}/status',
            [PaymentController::class, 'updateStatus']
        );
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {

        Route::get('/admin', function () {
            return response()->json([
                'status' => true,
                'message' => 'Halaman Admin'
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | User
        |--------------------------------------------------------------------------
        */

        Route::apiResource('users', UserController::class);

        /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */

        Route::post('/categories', [
            CategoryController::class,
            'store'
        ]);

        Route::put('/categories/{id}', [
            CategoryController::class,
            'update'
        ]);

        Route::delete('/categories/{id}', [
            CategoryController::class,
            'destroy'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Jenis
        |--------------------------------------------------------------------------
        */

        Route::post('/jenis', [
            JenisController::class,
            'store'
        ]);

        Route::put('/jenis/{id}', [
            JenisController::class,
            'update'
        ]);

        Route::delete('/jenis/{id}', [
            JenisController::class,
            'destroy'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        Route::post('/products', [
            ProductController::class,
            'store'
        ]);

        Route::put('/products/{id}', [
            ProductController::class,
            'update'
        ]);

        Route::delete('/products/{id}', [
            ProductController::class,
            'destroy'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Inventory CRUD
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'inventories',
            InventoryController::class
        )->except([
            'index',
            'show'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Transactions
        |--------------------------------------------------------------------------
        */

        Route::put(
            '/transactions/{id}',
            [TransactionController::class, 'update']
        );

        Route::patch(
            '/transactions/{id}/status',
            [TransactionController::class, 'updateStatus']
        );

        Route::delete(
            '/transactions/{id}',
            [TransactionController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */

        Route::put(
            '/payments/{id}',
            [PaymentController::class, 'update']
        );

        Route::delete(
            '/payments/{id}',
            [PaymentController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | Retur Management
        |--------------------------------------------------------------------------
        */

        Route::put(
            '/returs/{id}',
            [ReturController::class, 'update']
        );

        Route::delete(
            '/returs/{id}',
            [ReturController::class, 'destroy']
        );

        Route::post(
            '/returs/{id}/approve',
            [ReturController::class, 'approve']
        );

        Route::post(
            '/returs/{id}/reject',
            [ReturController::class, 'reject']
        );

        Route::post(
            '/returs/{id}/send-replacement',
            [ReturController::class, 'sendReplacement']
        );

        Route::post(
            '/returs/{id}/complete',
            [ReturController::class, 'complete']
        );
    });
});
