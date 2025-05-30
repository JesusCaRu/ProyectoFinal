<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transferencia;
use App\Models\Producto;
use App\Models\Sede;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TransferenciaSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener sedes
        $sedes = Sede::all();

        if ($sedes->count() < 2) {
            $this->command->info('Se necesitan al menos 2 sedes para crear transferencias');
            return;
        }

        // Obtener productos
        $productos = Producto::whereHas('sedes', function($query) {
            $query->where('stock', '>', 10);
        })->get();

        if ($productos->isEmpty()) {
            $this->command->info('No hay productos con stock suficiente para crear transferencias');
            return;
        }

        // Obtener usuarios almacenistas
        $almacenistas = Usuario::whereHas('rol', function($query) {
            $query->where('nombre', 'Almacenista');
        })->get();

        if ($almacenistas->isEmpty()) {
            $this->command->info('No hay almacenistas disponibles para crear transferencias');
            return;
        }

        // Estados posibles para las transferencias
        $estados = ['pendiente', 'enviado', 'recibido'];

        // Crear 10 transferencias
        for ($i = 0; $i < 10; $i++) {
            // Seleccionar sedes origen y destino diferentes
            $sedesArray = $sedes->all();
            $sedeOrigen = $sedesArray[array_rand($sedesArray)];
            $sedeDestino = $sedeOrigen;

            // Asegurarnos de que las sedes origen y destino sean diferentes
            while ($sedeDestino->id === $sedeOrigen->id) {
                $sedeDestino = $sedesArray[array_rand($sedesArray)];
            }

            $usuario = $almacenistas->random();
            $estado = $estados[array_rand($estados)];
            $fecha = Carbon::now()->subDays(rand(1, 30));

            // Seleccionar un producto aleatorio que exista en la sede origen
            $productosEnOrigen = Producto::whereHas('sedes', function($query) use ($sedeOrigen) {
                $query->where('sede_id', $sedeOrigen->id)
                      ->where('stock', '>', 5);  // Asegurar que hay suficiente stock
            })->get();

            if ($productosEnOrigen->isEmpty()) {
                continue;  // Si no hay productos con suficiente stock, saltar esta iteración
            }

            $producto = $productosEnOrigen->random();

            // Obtener el stock actual en la sede origen
            $productoSede = $producto->sedes()
                ->where('sede_id', $sedeOrigen->id)
                ->first();

            if (!$productoSede) {
                continue;
            }

            $stockDisponible = $productoSede->pivot->stock;
            $cantidad = rand(1, min(5, $stockDisponible - 5));  // Dejar al menos 5 unidades

            if ($cantidad <= 0) {
                continue;
            }

            // Crear la transferencia
            $transferencia = Transferencia::create([
                'sede_origen_id' => $sedeOrigen->id,
                'sede_destino_id' => $sedeDestino->id,
                'producto_id' => $producto->id,
                'cantidad' => $cantidad,
                'estado' => $estado,
                'usuario_id' => $usuario->id,
                'fecha' => $fecha,
            ]);

            // Si la transferencia está completada (recibida), actualizar el stock
            if ($estado === 'recibido') {
                // Disminuir stock en sede origen
                DB::table('producto_sede')
                    ->where('producto_id', $producto->id)
                    ->where('sede_id', $sedeOrigen->id)
                    ->decrement('stock', $cantidad);

                // Aumentar stock en sede destino
                // Primero verificar si el producto ya existe en la sede destino
                $existeEnDestino = DB::table('producto_sede')
                    ->where('producto_id', $producto->id)
                    ->where('sede_id', $sedeDestino->id)
                    ->exists();

                if ($existeEnDestino) {
                    // Si existe, incrementar el stock
                    DB::table('producto_sede')
                        ->where('producto_id', $producto->id)
                        ->where('sede_id', $sedeDestino->id)
                        ->increment('stock', $cantidad);
                } else {
                    // Si no existe, crear la relación con el stock transferido
                    // Obtener precio_compra y precio_venta de la sede origen
                    $precioCompra = $productoSede->pivot->precio_compra;
                    $precioVenta = $productoSede->pivot->precio_venta;

                    DB::table('producto_sede')->insert([
                        'producto_id' => $producto->id,
                        'sede_id' => $sedeDestino->id,
                        'stock' => $cantidad,
                        'precio_compra' => $precioCompra,
                        'precio_venta' => $precioVenta,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }

        $this->command->info('Se han creado transferencias de ejemplo');
    }
}
