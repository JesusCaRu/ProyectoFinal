<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Venta;
use App\Models\VentaDetalle;
use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Sede;
use Carbon\Carbon;

class VentaSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener usuarios vendedores
        $vendedores = Usuario::whereHas('rol', function($query) {
            $query->where('nombre', 'Vendedor');
        })->get();

        if ($vendedores->isEmpty()) {
            $this->command->info('No hay vendedores disponibles para crear ventas');
            return;
        }

        // Obtener sedes
        $sedes = Sede::all();

        if ($sedes->isEmpty()) {
            $this->command->info('No hay sedes disponibles para crear ventas');
            return;
        }

        // Crear 20 ventas
        for ($i = 0; $i < 20; $i++) {
            $fecha = Carbon::now()->subDays(rand(1, 30));
            $vendedor = $vendedores->random();
            $sede = $sedes->random();

            // Crear la venta
            $venta = Venta::create([
                'usuario_id' => $vendedor->id,
                'sede_id' => $sede->id,
                'total' => 0,
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ]);

            // Obtener productos con stock en esta sede específica
            $productosConStock = Producto::whereHas('sedes', function($query) use ($sede) {
                $query->where('sede_id', $sede->id)
                      ->where('stock', '>', 0);
            })->get();

            if ($productosConStock->isEmpty()) {
                // Si no hay productos con stock en esta sede, eliminar la venta y continuar
                $venta->delete();
                continue;
            }

            // Añadir entre 1 y 5 productos a la venta, pero no más de los disponibles
            $numProductos = min(rand(1, 5), $productosConStock->count());
            $productosVenta = $productosConStock->random($numProductos);
            $total = 0;

            foreach ($productosVenta as $producto) {
                // Obtener la relación producto_sede para este producto y sede
                $productoSede = $producto->sedes()->where('sede_id', $sede->id)->first();

                if (!$productoSede) {
                    continue;
                }

                // Determinar cantidad a vender (no mayor que el stock disponible)
                $stockDisponible = $productoSede->pivot->stock;
                $cantidad = rand(1, min(3, $stockDisponible));

                if ($cantidad <= 0) {
                    continue;
                }

                $precio = $productoSede->pivot->precio_venta;
                $subtotal = $cantidad * $precio;
                $total += $subtotal;

                VentaDetalle::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precio,
                ]);

                // Actualizar stock del producto en la sede
                $producto->sedes()->updateExistingPivot($sede->id, [
                    'stock' => $productoSede->pivot->stock - $cantidad
                ]);
            }

            // Si no se agregaron productos, eliminar la venta
            if ($total == 0) {
                $venta->delete();
                continue;
            }

            // Actualizar el total de la venta
            $venta->update(['total' => $total]);
        }

        $this->command->info('Se han creado ventas de ejemplo');
    }
}
