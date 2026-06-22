<?php

namespace App\Services;

use App\Models\Jenis;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class JenisService
{
    /**
     * List
     */
    public function getAll(
        Request $request
    ): LengthAwarePaginator {

        return Jenis::with('category')

            // Search nama
            ->when($request->search, function ($query) use ($request) {

                $query->where(
                    'name',
                    'ilike',
                    '%' . $request->search . '%'
                );
            })

            // Filter kategori
            ->when($request->category_id, function ($query) use ($request) {

                $query->where(
                    'category_id',
                    $request->category_id
                );
            })

            ->latest()

            ->paginate($request->limit ?? 10);
    }

    /**
     * Detail
     */
    public function detail(int $id): Jenis
    {
        return Jenis::with('category')
            ->findOrFail($id);
    }

    /**
     * Create
     */
    public function create(array $data): Jenis
    {
        return Jenis::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);
    }

    /**
     * Update
     */
    public function update(
        array $data,
        int $id
    ): Jenis {

        $jenis = Jenis::findOrFail($id);

        $jenis->update([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return $jenis;
    }

    /**
     * Delete
     */
    public function delete(int $id): void
    {
        Jenis::findOrFail($id)->delete();
    }
}
