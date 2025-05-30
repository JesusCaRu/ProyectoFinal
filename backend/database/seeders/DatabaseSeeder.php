<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Seeders básicos
            RoleSeeder::class,
            SedeSeeder::class,
            AdminSeeder::class,
            UsuarioSeeder::class,

            // Seeders de catálogo
            CategoriaSeeder::class,
            MarcaSeeder::class,
            ProveedorSeeder::class,
            ProductoSeeder::class,

            // Seeders de operaciones
            CompraSeeder::class,
            VentaSeeder::class,
            TransferenciaSeeder::class,

            // Seeders de auditoría
            AuditoriaSeeder::class,

            // Actualización de contraseñas (si es necesario)
            UpdateUserPasswordsSeeder::class,
        ]);
    }
}
