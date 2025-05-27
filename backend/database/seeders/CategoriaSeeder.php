<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Robots Industriales', 'descripcion' => 'Robots para procesos industriales y automatización'],
            ['nombre' => 'Robots Educativos', 'descripcion' => 'Robots para enseñanza y aprendizaje'],
            ['nombre' => 'Robots de Servicio', 'descripcion' => 'Robots para asistencia y servicios'],
            ['nombre' => 'Piezas y Repuestos', 'descripcion' => 'Componentes y repuestos para robots'],
            ['nombre' => 'Accesorios', 'descripcion' => 'Accesorios y complementos para robots']
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
