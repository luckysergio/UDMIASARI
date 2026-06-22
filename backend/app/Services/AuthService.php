<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

class AuthService
{
    public function register(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => bcrypt($data['password']),
            'role' => $data['role'] ?? 'customer',
        ]);
    }

    public function login(array $credentials): ?array
    {
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return null;
        }

        return [
            'token' => $token,
            'user' => Auth::guard('api')->user(),
        ];
    }

    public function logout(): void
    {
        Auth::guard('api')->logout();
    }

    public function me(): ?User
    {
        return Auth::guard('api')->user();
    }

    public function refresh(): string
    {
        return JWTAuth::refresh();
    }

    /**
     * Validate Token
     */
    public function validateToken(): array
    {
        try {

            $user = Auth::guard('api')->user();

            if (!$user) {
                return [
                    'status' => false,
                    'message' => 'Unauthorized',
                    'code' => 401,
                ];
            }

            return [
                'status' => true,
                'user' => $user,
            ];

        } catch (TokenExpiredException $e) {

            return [
                'status' => false,
                'message' => 'Session expired, silakan login ulang',
                'code' => 401,
                'expired' => true,
            ];

        } catch (JWTException $e) {

            return [
                'status' => false,
                'message' => 'Token tidak valid',
                'code' => 401,
            ];
        }
    }
}