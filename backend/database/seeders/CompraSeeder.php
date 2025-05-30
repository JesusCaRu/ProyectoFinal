<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Compra;
use App\Models\CompraDetalle;
use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Sede;
use App\Models\Proveedor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CompraSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener usuarios
        $usuarios = Usuario::whereHas('rol', function($query) {
            $query->whereIn('nombre', ['Administrador', 'Vendedor']);
        })->get();

        if ($usuarios->isEmpty()) {
            $this->command->info('No hay usuarios disponibles para crear compras');
            return;
        }

        // Obtener sedes
        $sedes = Sede::all();

        if ($sedes->isEmpty()) {
            $this->command->info('No hay sedes disponibles para crear compras');
            return;
        }

        // Obtener proveedores
        $proveedores = Proveedor::all();

        if ($proveedores->isEmpty()) {
            $this->command->info('No hay proveedores disponibles para crear compras');
            return;
        }

        // Obtener productos
        $productos = Producto::all();

        if ($productos->isEmpty()) {
            $this->command->info('No hay productos disponibles para crear compras');
            return;
        }

        // Estados posibles para las compras
        $estados = ['pendiente', 'completada', 'cancelada'];

        // Crear 15 compras
        for ($i = 0; $i < 15; $i++) {
            $fecha = Carbon::now()->subDays(rand(1, 45));
            $usuario = $usuarios->random();
            $sede = $sedes->random();
            $proveedor = $proveedores->random();
            $estado = $estados[array_rand($estados)];

            // Crear la compra
            $compra = Compra::create([
                'usuario_id' => $usuario->id,
                'sede_id' => $sede->id,
                'proveedor_id' => $proveedor->id,
                'total' => 0,
                'estado' => $estado,
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ]);

            // Añadir entre 1 y 8 productos a la compra, pero no más de los disponibles
            $numProductos = min(rand(1, 5), $productos->count());
            $productosCompra = $productos->random($numProductos);
            $total = 0;

            foreach ($productosCompra as $producto) {
                $cantidad = rand(5, 20);
                $precio = $producto->precio_compra > 0 ? $producto->precio_compra : $producto->precio_venta * 0.7;
                $subtotal = $cantidad * $precio;
                $total += $subtotal;

                CompraDetalle::create([
                    'compra_id' => $compra->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precio,
                ]);

                // Si la compra está completada, actualizar el stock del producto en la sede correspondiente
                if ($estado === 'completada') {
                    // Actualizar el stock en la tabla pivote producto_sede en lugar de la tabla productos
                    DB::table('producto_sede')
                        ->where('producto_id', $producto->id)
                        ->where('sede_id', $sede->id)
                        ->increment('stock', $cantidad);
                }
            }

            // Actualizar el total de la compra
            $compra->update(['total' => $total]);
        }

        $this->command->info('Se han creado 15 compras de ejemplo');
    }
}
