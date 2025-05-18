<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sede;

class SedeSeeder extends Seeder
{
    public function run(): void
    {
        $sedes = [
            ['nombre' => 'Sin sede', 'direccion' => 'No asignada'],
            ['nombre' => 'Sede Principal', 'direccion' => 'Av. Principal 123'],
            ['nombre' => 'Sucursal Norte', 'direccion' => 'Calle Norte 456'],
            ['nombre' => 'Sucursal Sur', 'direccion' => 'Av. Sur 789']
        ];

        foreach ($sedes as $sede) {
            Sede::create($sede);
        }
    }
}
