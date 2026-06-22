<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [

            [
                'name' => 'Bakso Besar',
                'description' => 'Kategori bakso ukuran besar'
            ],

            [
                'name' => 'Bakso Kecil',
                'description' => 'Kategori bakso ukuran kecil'
            ],

        ];

        foreach ($categories as $category) {

            Category::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}