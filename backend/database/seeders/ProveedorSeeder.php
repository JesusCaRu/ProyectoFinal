<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Proveedor;

class ProveedorSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = [
            [
                'nombre' => 'RobotSupply S.A.',
                'contacto' => 'Juan Pérez'
            ],
            [
                'nombre' => 'TechParts Inc.',
                'contacto' => 'María García'
            ],
            [
                'nombre' => 'AutoBot Distributors',
                'contacto' => 'Carlos López'
            ]
        ];

        foreach ($proveedores as $proveedor) {
            Proveedor::create($proveedor);
        }
    }
}
