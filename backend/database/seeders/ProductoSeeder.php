<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $productos = [
            [
                'nombre' => 'Robot Industrial RX-100',
                'sku' => 'RX100-001',
                'descripcion' => 'Robot industrial de alta precisión para líneas de producción',
                'precio_compra' => 12000.00,
                'precio_venta' => 15000.00,
                'stock' => 10,
                'stock_minimo' => 2,
                'categoria_id' => 1,
                'marca_id' => 1,
                'sede_id' => 1
            ],
            [
                'nombre' => 'Robot Educativo EduBot',
                'sku' => 'EDUBOT-002',
                'descripcion' => 'Robot educativo para enseñanza de programación',
                'precio_compra' => 249.99,
                'precio_venta' => 299.99,
                'stock' => 50,
                'stock_minimo' => 10,
                'categoria_id' => 2,
                'marca_id' => 2,
                'sede_id' => 1
            ],
            [
                'nombre' => 'Robot de Servicio HelperBot',
                'sku' => 'HELPER-003',
                'descripcion' => 'Robot de servicio para asistencia en el hogar',
                'precio_compra' => 1599.99,
                'precio_venta' => 1999.99,
                'stock' => 15,
                'stock_minimo' => 3,
                'categoria_id' => 3,
                'marca_id' => 3,
                'sede_id' => 1
            ],
            [
                'nombre' => 'Kit de Repuestos Básico',
                'sku' => 'KITREP-004',
                'descripcion' => 'Kit de repuestos básicos para mantenimiento',
                'precio_compra' => 119.99,
                'precio_venta' => 149.99,
                'stock' => 100,
                'stock_minimo' => 20,
                'categoria_id' => 4,
                'marca_id' => 4,
                'sede_id' => 1
            ],
            [
                'nombre' => 'Cargador Universal',
                'sku' => 'CARGA-005',
                'descripcion' => 'Cargador universal para robots',
                'precio_compra' => 39.99,
                'precio_venta' => 49.99,
                'stock' => 200,
                'stock_minimo' => 40,
                'categoria_id' => 5,
                'marca_id' => 5,
                'sede_id' => 1
            ]
        ];

        foreach ($productos as $producto) {
            Producto::create($producto);
        }
    }
}
