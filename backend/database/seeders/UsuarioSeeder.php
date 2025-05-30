<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\Role;
use App\Models\Sede;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener los roles
        $rolAdmin = Role::where('nombre', 'Administrador')->first()->id;
        $rolVendedor = Role::where('nombre', 'Vendedor')->first()->id;
        $rolAlmacenista = Role::where('nombre', 'Almacenista')->first()->id;

        // Obtener las sedes
        $sedes = Sede::pluck('id')->toArray();

        // Crear usuarios con diferentes roles
        $usuarios = [
            [
                'nombre' => 'Juan Pérez',
                'email' => 'vendedor1@stockflow.com',
                'password' => Hash::make('password123'),
                'rol_id' => $rolVendedor,
                'sede_id' => $sedes[0],
                'activo' => 1
            ],
            [
                'nombre' => 'María López',
                'email' => 'vendedor2@stockflow.com',
                'password' => Hash::make('password123'),
                'rol_id' => $rolVendedor,
                'sede_id' => $sedes[1],
                'activo' => 1
            ],
            [
                'nombre' => 'Carlos Rodríguez',
                'email' => 'almacenista1@stockflow.com',
                'password' => Hash::make('password123'),
                'rol_id' => $rolAlmacenista,
                'sede_id' => $sedes[0],
                'activo' => 1
            ],
            [
                'nombre' => 'Ana Martínez',
                'email' => 'almacenista2@stockflow.com',
                'password' => Hash::make('password123'),
                'rol_id' => $rolAlmacenista,
                'sede_id' => $sedes[1],
                'activo' => 1
            ],
            [
                'nombre' => 'Roberto Gómez',
                'email' => 'admin2@stockflow.com',
                'password' => Hash::make('password123'),
                'rol_id' => $rolAdmin,
                'sede_id' => $sedes[0],
                'activo' => 1
            ],
            // Usuario sin rol ni sede (pendiente de verificación)
            [
                'nombre' => 'Usuario Pendiente',
                'email' => 'pendiente@stockflow.com',
                'password' => Hash::make('password123'),
                'activo' => 1
            ],
        ];

        foreach ($usuarios as $usuario) {
            // Verificar si el usuario ya existe
            if (!Usuario::where('email', $usuario['email'])->exists()) {
                Usuario::create($usuario);
            }
        }
    }
}
