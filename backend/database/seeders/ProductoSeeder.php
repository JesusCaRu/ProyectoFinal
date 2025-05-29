<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Sede;
use Illuminate\Support\Facades\DB;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $productos = [
            [
                'nombre' => 'Robot Industrial RX-100',
                'sku' => 'ROB-001',
                'descripcion' => 'Robot industrial de alta precisión para líneas de producción',
                'categoria_id' => 1,
                'marca_id' => 1,
                'stock_minimo' => 5,
                'sede_data' => [
                    [
                        'stock' => 10,
                        'precio_compra' => 150000.00,
                        'precio_venta' => 180000.00,
                        'sede_id' => 1
                    ],
                    [
                        'stock' => 8,
                        'precio_compra' => 150000.00,
                        'precio_venta' => 180000.00,
                        'sede_id' => 2
                    ]
                ]
            ],
            [
                'nombre' => 'Robot Educativo EduBot',
                'sku' => 'ROB-002',
                'descripcion' => 'Robot educativo para enseñanza de programación',
                'categoria_id' => 2,
                'marca_id' => 2,
                'stock_minimo' => 3,
                'sede_data' => [
                    [
                        'stock' => 15,
                        'precio_compra' => 25000.00,
                        'precio_venta' => 30000.00,
                        'sede_id' => 1
                    ],
                    [
                        'stock' => 12,
                        'precio_compra' => 25000.00,
                        'precio_venta' => 30000.00,
                        'sede_id' => 2
                    ]
                ]
            ],
            [
                'nombre' => 'Robot de Servicio HelperBot',
                'sku' => 'ROB-003',
                'descripcion' => 'Robot de servicio para asistencia en oficinas',
                'categoria_id' => 3,
                'marca_id' => 1,
                'stock_minimo' => 2,
                'sede_data' => [
                    [
                        'stock' => 5,
                        'precio_compra' => 75000.00,
                        'precio_venta' => 90000.00,
                        'sede_id' => 1
                    ],
                    [
                        'stock' => 4,
                        'precio_compra' => 75000.00,
                        'precio_venta' => 90000.00,
                        'sede_id' => 2
                    ]
                ]
            ],
            [
                'nombre' => 'Kit de Repuestos Básico',
                'sku' => 'REP-001',
                'descripcion' => 'Kit de repuestos básicos para mantenimiento de robots',
                'categoria_id' => 4,
                'marca_id' => 2,
                'stock_minimo' => 10,
                'sede_data' => [
                    [
                        'stock' => 25,
                        'precio_compra' => 5000.00,
                        'precio_venta' => 7500.00,
                        'sede_id' => 1
                    ],
                    [
                        'stock' => 20,
                        'precio_compra' => 5000.00,
                        'precio_venta' => 7500.00,
                        'sede_id' => 2
                    ]
                ]
            ],
            [
                'nombre' => 'Cargador Universal para Robots',
                'sku' => 'ACC-001',
                'descripcion' => 'Cargador universal compatible con múltiples modelos de robots',
                'categoria_id' => 5,
                'marca_id' => 1,
                'stock_minimo' => 8,
                'sede_data' => [
                    [
                        'stock' => 15,
                        'precio_compra' => 3000.00,
                        'precio_venta' => 4500.00,
                        'sede_id' => 1
                    ],
                    [
                        'stock' => 12,
                        'precio_compra' => 3000.00,
                        'precio_venta' => 4500.00,
                        'sede_id' => 2
                    ]
                ]
            ]
        ];

        foreach ($productos as $productoData) {
            $sedeData = $productoData['sede_data'];
            unset($productoData['sede_data']);

            DB::transaction(function () use ($productoData, $sedeData) {
                $producto = Producto::create($productoData);

                foreach ($sedeData as $sede) {
                    $producto->sedes()->attach($sede['sede_id'], [
                        'stock' => $sede['stock'],
                        'precio_compra' => $sede['precio_compra'],
                        'precio_venta' => $sede['precio_venta']
                    ]);
                }
            });
        }
    }
}
