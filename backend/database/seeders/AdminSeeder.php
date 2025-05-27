<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si el usuario admin ya existe
        if (!Usuario::where('email', 'admin@stockflow.com')->exists()) {
            Usuario::create([
                'nombre' => 'Administrador',
                'email' => 'admin@stockflow.com',
                'password' => Hash::make('admin123'),
                'rol_id' => 1, // ID del rol de administrador
                'sede_id' => 1, // ID de la sede principal
            ]);
        }
    }
}
