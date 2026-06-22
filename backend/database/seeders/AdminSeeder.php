<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@farel.com'
            ],
            [
                'name' => 'Administrator',
                'phone' => '081234567890',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );
    }
}