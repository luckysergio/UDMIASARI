<?php

namespace Database\Seeders;

use App\Models\Jenis;
use App\Models\Category;
use Illuminate\Database\Seeder;

class JenisSeeder extends Seeder
{
    public function run(): void
    {
        $baksoBesar = Category::where(
            'name',
            'Bakso Besar'
        )->first();

        $baksoKecil = Category::where(
            'name',
            'Bakso Kecil'
        )->first();

        $jenis = [

            // Bakso Besar
            [
                'category_id' => $baksoBesar->id,
                'name' => 'Bakso Jumbo',
                'description' => 'Bakso ukuran jumbo'
            ],
            [
                'category_id' => $baksoBesar->id,
                'name' => 'Bakso Isi Telur',
                'description' => 'Bakso isi telur'
            ],
            [
                'category_id' => $baksoBesar->id,
                'name' => 'Bakso Mercon',
                'description' => 'Bakso isi sambal pedas'
            ],
            [
                'category_id' => $baksoBesar->id,
                'name' => 'Bakso Keju',
                'description' => 'Bakso isi keju'
            ],

            // Bakso Kecil
            [
                'category_id' => $baksoKecil->id,
                'name' => 'Bakso Urat',
                'description' => 'Bakso urat ukuran kecil'
            ],
            [
                'category_id' => $baksoKecil->id,
                'name' => 'Bakso Halus',
                'description' => 'Bakso halus ukuran kecil'
            ],
        ];

        foreach ($jenis as $item) {

            Jenis::firstOrCreate(
                [
                    'category_id' => $item['category_id'],
                    'name' => $item['name'],
                ],
                $item
            );
        }
    }
}