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
                'contacto' => 'Juan Pérez',
                'email' => 'contacto@robotsupply.com',
                'telefono' => '555-1234'
            ],
            [
                'nombre' => 'TechParts Inc.',
                'contacto' => 'María García',
                'email' => 'ventas@techparts.com',
                'telefono' => '555-5678'
            ],
            [
                'nombre' => 'AutoBot Distributors',
                'contacto' => 'Carlos López',
                'email' => 'info@autobot.com',
                'telefono' => '555-9012'
            ]
        ];

        foreach ($proveedores as $proveedor) {
            Proveedor::create($proveedor);
        }
    }
}
