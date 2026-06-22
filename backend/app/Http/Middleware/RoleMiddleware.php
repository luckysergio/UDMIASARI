<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {

        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden',
                'role' => $user->role,
                'allowed_roles' => $roles
            ], 403);
        }

        return $next($request);
    }
}