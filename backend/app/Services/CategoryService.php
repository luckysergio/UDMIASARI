<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService
{
    /**
     * List Category
     */
    public function getAll(
        Request $request
    ): LengthAwarePaginator {

        return Category::query()

            ->when($request->search, function ($query) use ($request) {

                $query->where(
                    'name',
                    'ilike',
                    '%' . $request->search . '%'
                );
            })

            ->latest()

            ->paginate($request->limit ?? 10);
    }

    /**
     * Detail
     */
    public function detail(int $id): Category
    {
        return Category::findOrFail($id);
    }

    /**
     * Create
     */
    public function create(array $data): Category
    {
        return Category::create([
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
    ): Category {

        $category = Category::findOrFail($id);

        $category->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return $category;
    }

    /**
     * Delete
     */
    public function delete(int $id): void
    {
        Category::findOrFail($id)->delete();
    }
}