<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Marca;

class MarcaSeeder extends Seeder
{
    public function run(): void
    {
        $marcas = [
            ['nombre' => 'RobotTech'],
            ['nombre' => 'AutoBot'],
            ['nombre' => 'SmartBot'],
            ['nombre' => 'RoboMaster'],
            ['nombre' => 'TechBot']
        ];

        foreach ($marcas as $marca) {
            Marca::create($marca);
        }
    }
}
