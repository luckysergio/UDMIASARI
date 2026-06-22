<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected AuthService $service;

    public function __construct(AuthService $service)
    {
        $this->service = $service;
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|min:6',
            'role' => ['nullable', Rule::in(['admin', 'karyawan', 'customer'])],
        ]);

        $user = $this->service->register($validated);

        return response()->json([
            'status' => true,
            'message' => 'Register berhasil',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Key unik per email + IP
        $key = Str::lower($request->email) . '|' . $request->ip();

        // Maksimal 5 percobaan dalam 1 menit
        if (RateLimiter::tooManyAttempts($key, 5)) {

            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'status' => false,
                'message' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik."
            ], 429);
        }

        $result = $this->service->login(
            $request->only('email', 'password')
        );

        // Login gagal
        if (!$result) {

            RateLimiter::hit($key, 600);

            return response()->json([
                'status' => false,
                // Jangan kasih tahu email/password mana yang salah
                'message' => 'Email atau password salah'
            ], 401);
        }

        // Clear limiter jika sukses login
        RateLimiter::clear($key);

        return response()->json([
            'status' => true,
            'message' => 'Login berhasil',
            'data' => [
                'token' => $result['token'],
                'user' => $result['user'],
            ]
        ], 200);
    }

    public function me()
    {
        $result = $this->service->validateToken();

        if (!$result['status']) {

            return response()->json([
                'status' => false,
                'message' => $result['message'],
                'expired' => $result['expired'] ?? false,
            ], $result['code']);
        }

        return response()->json([
            'status' => true,
            'data' => $result['user']
        ]);
    }

    public function logout()
    {
        $this->service->logout();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    public function refresh()
    {
        try {

            $token = $this->service->refresh();

            return response()->json([
                'status' => true,
                'message' => 'Token berhasil diperbarui',
                'data' => [
                    'token' => $token
                ]
            ]);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {

            return response()->json([
                'status' => false,
                'message' => 'Session expired, silakan login ulang',
                'expired' => true,
            ], 401);
        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Token tidak valid'
            ], 401);
        }
    }
}
