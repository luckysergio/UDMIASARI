<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('dashboard', function ($user) {
    return in_array($user->role, [
        'admin',
        'kepala_produksi'
    ]);
});