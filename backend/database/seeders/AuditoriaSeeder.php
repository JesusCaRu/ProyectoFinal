<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Activitylog\Models\Activity;
use App\Models\Usuario;
use Carbon\Carbon;

class AuditoriaSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener usuarios
        $usuarios = Usuario::all();

        if ($usuarios->isEmpty()) {
            $this->command->info('No hay usuarios disponibles para crear registros de auditoría');
            return;
        }

        // Tipos de acciones para la auditoría
        $acciones = [
            'login' => 'Inicio de sesión',
            'logout' => 'Cierre de sesión',
            'crear_producto' => 'Creación de producto',
            'editar_producto' => 'Edición de producto',
            'eliminar_producto' => 'Eliminación de producto',
            'crear_venta' => 'Creación de venta',
            'crear_compra' => 'Creación de compra',
            'cambiar_estado_compra' => 'Cambio de estado de compra',
            'crear_transferencia' => 'Creación de transferencia',
            'cambiar_estado_transferencia' => 'Cambio de estado de transferencia',
            'crear_usuario' => 'Creación de usuario',
            'editar_usuario' => 'Edición de usuario',
            'desactivar_usuario' => 'Desactivación de usuario',
            'activar_usuario' => 'Activación de usuario'
        ];

        // Crear 50 registros de auditoría
        for ($i = 0; $i < 50; $i++) {
            $usuario = $usuarios->random();
            $accionKey = array_rand($acciones);
            $accion = $acciones[$accionKey];
            $fecha = Carbon::now()->subDays(rand(0, 60))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            // Datos adicionales según el tipo de acción
            $detalles = [];

            switch ($accionKey) {
                case 'login':
                case 'logout':
                    $detalles = [
                        'ip' => '192.168.' . rand(0, 255) . '.' . rand(0, 255),
                        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' . rand(80, 100) . '.0.' . rand(1000, 9999) . '.' . rand(100, 999)
                    ];
                    break;

                case 'crear_producto':
                case 'editar_producto':
                case 'eliminar_producto':
                    $detalles = [
                        'producto_id' => rand(1, 50),
                        'nombre' => 'Producto ' . rand(1, 100),
                        'categoria' => 'Categoría ' . rand(1, 10)
                    ];
                    break;

                case 'crear_venta':
                    $detalles = [
                        'venta_id' => rand(1, 20),
                        'total' => rand(1000, 50000) / 100,
                        'productos' => rand(1, 10)
                    ];
                    break;

                case 'crear_compra':
                case 'cambiar_estado_compra':
                    $detalles = [
                        'compra_id' => rand(1, 15),
                        'proveedor' => 'Proveedor ' . rand(1, 5),
                        'estado' => ['pendiente', 'completada', 'cancelada'][rand(0, 2)]
                    ];
                    break;

                case 'crear_transferencia':
                case 'cambiar_estado_transferencia':
                    $detalles = [
                        'transferencia_id' => rand(1, 10),
                        'sede_origen' => 'Sede ' . rand(1, 3),
                        'sede_destino' => 'Sede ' . rand(1, 3),
                        'estado' => ['pendiente', 'enviado', 'recibido'][rand(0, 2)]
                    ];
                    break;

                case 'crear_usuario':
                case 'editar_usuario':
                case 'desactivar_usuario':
                case 'activar_usuario':
                    $detalles = [
                        'usuario_id' => rand(1, 10),
                        'email' => 'usuario' . rand(1, 100) . '@stockflow.com',
                        'rol' => ['Administrador', 'Vendedor', 'Almacenista'][rand(0, 2)]
                    ];
                    break;
            }

            Activity::create([
                'log_name' => 'default',
                'description' => $accion,
                'subject_type' => null,
                'subject_id' => null,
                'causer_type' => Usuario::class,
                'causer_id' => $usuario->id,
                'properties' => json_encode($detalles),
                'created_at' => $fecha,
                'updated_at' => $fecha
            ]);
        }

        $this->command->info('Se han creado 50 registros de auditoría de ejemplo');
    }
}
