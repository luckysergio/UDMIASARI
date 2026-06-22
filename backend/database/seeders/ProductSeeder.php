<?php

namespace Database\Seeders;

use App\Models\Jenis;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $variants = [

            [
                'qty' => 1,
                'price' => 5000,
            ],

            [
                'qty' => 10,
                'price' => 45000,
            ],

            [
                'qty' => 100,
                'price' => 400000,
            ],
        ];

        $jenisList = Jenis::with('category')->get();

        foreach ($jenisList as $jenis) {

            foreach ($variants as $variant) {

                $product = Product::firstOrCreate(
                    [
                        'code' => strtoupper(
                            'PRD-' .
                            $jenis->id .
                            '-' .
                            $variant['qty']
                        ),
                    ],
                    [
                        'category_id' => $jenis->category_id,
                        'jenis_id' => $jenis->id,

                        'name' => $jenis->name .
                            ' Isi ' .
                            $variant['qty'],

                        'price' => $variant['price'],

                        'description' =>
                            $jenis->name .
                            ' kemasan isi ' .
                            $variant['qty'] .
                            ' butir',

                        'image' => null,

                        'is_active' => true,
                    ]
                );

                /**
                 * Auto create inventory
                 */
                Inventory::firstOrCreate(
                    [
                        'product_id' => $product->id,
                    ],
                    [
                        'stock' => 100,
                    ]
                );
            }
        }
    }
}