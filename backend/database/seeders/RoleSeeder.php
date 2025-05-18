<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nombre' => 'Administrador'],
            ['nombre' => 'Vendedor'],
            ['nombre' => 'Almacenista']
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
