<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Robots Industriales'],
            ['nombre' => 'Robots Educativos'],
            ['nombre' => 'Robots de Servicio'],
            ['nombre' => 'Piezas y Repuestos'],
            ['nombre' => 'Accesorios']
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
