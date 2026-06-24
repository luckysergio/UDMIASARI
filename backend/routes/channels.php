<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('dashboard', function ($user) {
    return in_array($user->role, [
        'admin',
        'kepala_produksi'
    ]);
});

Broadcast::channel('notifications', function ($user) {
    return in_array($user->role, [
        'admin',
        'kepala_produksi'
    ]);
});