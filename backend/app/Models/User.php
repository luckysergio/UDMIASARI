<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Illuminate\Database\Eloquent\Relations\HasMany;

use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isKaryawan(): bool
    {
        return $this->role === 'karyawan';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function productMovements(): HasMany
    {
        return $this->hasMany(ProductMovement::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'customer_id');
    }

    public function createdTransactions()
    {
        return $this->hasMany(Transaction::class, 'created_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'created_by');
    }

    public function returs()
    {
        return $this->hasMany(Retur::class, 'created_by');
    }
}
