<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\ForgotPasswordService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    protected ForgotPasswordService $service;

    public function __construct(ForgotPasswordService $service)
    {
        $this->service = $service;
    }

    public function sendResetLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $key = 'forgot-password:' .
            Str::lower($request->email) .
            '|' .
            $request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {

            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'status' => false,
                'message' => "Terlalu banyak permintaan. Coba lagi dalam {$seconds} detik."
            ], 429);
        }

        RateLimiter::hit($key, 300);

        $result = $this->service->sendResetLink(
            $request->email
        );

        return response()->json(
            $result,
            $result['status'] ? 200 : 400
        );
    }
}
