<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Usuario;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// User private channel
Broadcast::channel('App.Models.Usuario.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Sede private channel
Broadcast::channel('sede.{sedeId}', function ($user, $sedeId) {
    return $user->sede_id === (int) $sedeId || $user->rol_id === 1; // Sede members or admins
});

// Role private channel
Broadcast::channel('role.{roleId}', function ($user, $roleId) {
    return (int) $user->rol_id === (int) $roleId;
});
