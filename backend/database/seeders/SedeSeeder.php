<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sede;

class SedeSeeder extends Seeder
{
    public function run(): void
    {
        $sedes = [
            ['nombre' => 'Sin sede', 'direccion' => 'No asignada', 'telefono' => null, 'email' => null],
            ['nombre' => 'Sede Principal', 'direccion' => 'Av. Principal 123', 'telefono' => '555-0001', 'email' => 'principal@sede.com'],
            ['nombre' => 'Sucursal Norte', 'direccion' => 'Calle Norte 456', 'telefono' => '555-0002', 'email' => 'norte@sede.com'],
            ['nombre' => 'Sucursal Sur', 'direccion' => 'Av. Sur 789', 'telefono' => '555-0003', 'email' => 'sur@sede.com']
        ];

        foreach ($sedes as $sede) {
            Sede::create($sede);
        }
    }
}
