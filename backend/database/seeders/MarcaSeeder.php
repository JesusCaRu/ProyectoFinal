<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Marca;

class MarcaSeeder extends Seeder
{
    public function run(): void
    {
        $marcas = [
            ['nombre' => 'RobotTech', 'descripcion' => 'Líder en robótica industrial'],
            ['nombre' => 'AutoBot', 'descripcion' => 'Robots para automóviles y movilidad'],
            ['nombre' => 'SmartBot', 'descripcion' => 'Robots inteligentes para el hogar'],
            ['nombre' => 'RoboMaster', 'descripcion' => 'Robots educativos y de competencia'],
            ['nombre' => 'TechBot', 'descripcion' => 'Accesorios y piezas para robots']
        ];

        foreach ($marcas as $marca) {
            Marca::create($marca);
        }
    }
}
