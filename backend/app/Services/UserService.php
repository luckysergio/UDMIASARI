<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * Get All Users
     */
    public function getAll(
        Request $request
    ): LengthAwarePaginator {

        return User::query()

            ->when($request->search, function ($query) use ($request) {

                $query->where('name', 'ilike', '%' . $request->search . '%')
                    ->orWhere('email', 'ilike', '%' . $request->search . '%')
                    ->orWhere('phone', 'ilike', '%' . $request->search . '%');
            })

            ->orderByDesc('id')

            ->paginate($request->limit ?? 10);
    }

    /**
     * Detail User
     */
    public function detail(int $id): User
    {
        return User::findOrFail($id);
    }

    /**
     * Create User
     */
    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => $data['role'],
        ]);
    }

    /**
     * Update User
     */
    public function update(
        array $data,
        int $id
    ): User {

        $user = User::findOrFail($id);

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'],
        ]);

        if (!empty($data['password'])) {

            $user->update([
                'password' => $data['password']
            ]);
        }

        return $user;
    }

    /**
     * Delete User
     */
    public function delete(int $id): void
    {
        $user = User::findOrFail($id);

        $user->delete();
    }
}