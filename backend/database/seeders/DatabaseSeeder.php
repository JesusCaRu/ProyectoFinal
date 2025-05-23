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
            UpdateUserPasswordsSeeder::class,
            RoleSeeder::class,
            SedeSeeder::class,
            AdminSeeder::class,
            CategoriaSeeder::class,
            MarcaSeeder::class,
            ProveedorSeeder::class,
            ProductoSeeder::class
        ]);
    }
}
