<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\UsuarioController;
use App\Http\Controllers\API\AuditoriaController;
use App\Http\Controllers\API\CategoriaController;
use App\Http\Controllers\API\MarcaController;
use App\Http\Controllers\API\SedeController;
use App\Http\Controllers\API\ProductoController;
use App\Http\Controllers\API\TransferenciaController;
use App\Http\Controllers\API\ProveedorController;
use App\Http\Controllers\API\CompraController;
use App\Http\Controllers\API\CompraDetalleController;
use App\Http\Controllers\API\VentaController;
use App\Http\Controllers\API\VentaDetalleController;
use App\Http\Controllers\API\MovimientoController;
use App\Http\Controllers\API\ConfigController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\MensajeSedeController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\MessageController;
use App\Models\Producto;
use App\Models\Sede;
use App\Models\Usuario;
use App\Notifications\StockNotification;
use Illuminate\Support\Facades\Log;

// Rutas públicas
Route::post('login', [UsuarioController::class, 'login']);
Route::post('register', [UsuarioController::class, 'register']);

// Test routes
Route::get('/test-notification', [App\Http\Controllers\API\TestController::class, 'sendTestNotification']);
Route::get('/test-message', [App\Http\Controllers\API\TestController::class, 'sendTestMessage']);
Route::get('/test-get-notifications', function() {
    try {
        $user = Usuario::where('rol_id', 1)->first();
        if (!$user) {
            return response()->json(['message' => 'No admin user found'], 404);
        }

        $notifications = $user->notifications()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $notifications->count(),
            'data' => $notifications
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching notifications',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-send-message', function() {
    try {
        // Get an admin user as sender
        $sender = Usuario::where('rol_id', 1)->first();
        if (!$sender) {
            return response()->json(['message' => 'No admin user found'], 404);
        }

        // Get a user as recipient
        $recipient = Usuario::where('id', '!=', $sender->id)->first();
        if (!$recipient) {
            return response()->json(['message' => 'No recipient user found'], 404);
        }

        // Send direct message
        $message = "Este es un mensaje de prueba directo desde la API " . date('Y-m-d H:i:s');
        Log::info("Enviando mensaje de prueba de {$sender->id} a {$recipient->id}");

        $recipient->notify(new \App\Notifications\MessageNotification($message, $sender));

        return response()->json([
            'success' => true,
            'message' => 'Test message sent successfully',
            'from' => $sender->nombre,
            'to' => $recipient->nombre
        ]);
    } catch (\Exception $e) {
        Log::error("Error sending test message: {$e->getMessage()}");
        return response()->json([
            'success' => false,
            'message' => 'Error sending test message',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-controller-message', function() {
    try {
        // Get an admin user as sender
        $sender = Usuario::where('rol_id', 1)->first();
        if (!$sender) {
            return response()->json(['message' => 'No admin user found'], 404);
        }

        // Get a user as recipient
        $recipient = Usuario::where('id', '!=', $sender->id)->first();
        if (!$recipient) {
            return response()->json(['message' => 'No recipient user found'], 404);
        }

        // Use NotificationHelper
        $message = "Este es un mensaje de prueba usando NotificationHelper " . date('Y-m-d H:i:s');
        Log::info("Enviando mensaje de prueba usando helper de {$sender->id} a {$recipient->id}");

        App\Helpers\NotificationHelper::sendMessage($message, $sender, $recipient);

        return response()->json([
            'success' => true,
            'message' => 'Test message sent using helper successfully',
            'from' => $sender->nombre,
            'to' => $recipient->nombre
        ]);
    } catch (\Exception $e) {
        Log::error("Error sending test message with helper: {$e->getMessage()}");
        return response()->json([
            'success' => false,
            'message' => 'Error sending test message with helper',
            'error' => $e->getMessage()
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [UsuarioController::class, 'logout']);

    // Roles
    Route::apiResource('roles', RoleController::class);

    // Usuarios
    Route::apiResource('usuarios', UsuarioController::class);
    Route::get('me', [UsuarioController::class, 'me']);
    Route::get('usuarios/trashed', [UsuarioController::class, 'trashed']);
    Route::post('usuarios/{id}/restore', [UsuarioController::class, 'restore']);
    Route::patch('usuarios/{usuario}/estado', [UsuarioController::class, 'cambiarEstado']);

    // Auditorias
    Route::get('/auditoria/acciones', [AuditoriaController::class, 'getAcciones']);
    Route::get('/auditoria/tablas', [AuditoriaController::class, 'getTablas']);
    Route::get('/auditoria', [AuditoriaController::class, 'index']);
    Route::get('/auditoria/{id}', [AuditoriaController::class, 'show']);

    // Categorias
    Route::apiResource('categorias', CategoriaController::class);

    // Marcas
    Route::apiResource('marcas', MarcaController::class);

    // Sedes
    Route::apiResource('sedes', SedeController::class);

    // Productos
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::get('/productos/{producto}', [ProductoController::class, 'show']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);
    Route::get('/productos/por-sede/{sedeId}', [ProductoController::class, 'getProductsBySede']);
    Route::get('/productos/stock-bajo', [ProductoController::class, 'getLowStockProducts']);

    // Transferencias
    Route::apiResource('transferencias', TransferenciaController::class);

    // Proveedores
    Route::apiResource('proveedores', ProveedorController::class);
    Route::get('proveedores/{proveedor}/resumen-compras', [ProveedorController::class, 'getResumenCompras']);

    // Compras
    Route::prefix('compras')->group(function () {
        Route::get('/', [CompraController::class, 'index']);
        Route::post('/', [CompraController::class, 'store']);
        Route::get('/por-fechas', [CompraController::class, 'getByDateRange']);
        Route::get('/resumen', [CompraController::class, 'getResumen']);
        Route::get('/{compra}', [CompraController::class, 'show']);
        Route::patch('/{compra}', [CompraController::class, 'update']);
        Route::delete('/{compra}', [CompraController::class, 'destroy']);
    });

    // Detalles de Compra
    Route::prefix('compra-detalles')->group(function () {
        Route::get('/', [CompraDetalleController::class, 'index']);
        Route::post('/', [CompraDetalleController::class, 'store']);
        Route::get('/{detalle}', [CompraDetalleController::class, 'show']);
        Route::patch('/{detalle}', [CompraDetalleController::class, 'update']);
        Route::delete('/{detalle}', [CompraDetalleController::class, 'destroy']);
        Route::get('/por-compra/{compraId}', [CompraDetalleController::class, 'getByCompra']);
        Route::get('/por-producto/{productoId}', [CompraDetalleController::class, 'getByProducto']);
    });

    // Ventas
    Route::prefix('ventas')->group(function () {
        Route::get('/', [VentaController::class, 'index']);
        Route::post('/', [VentaController::class, 'store']);
        Route::get('/por-fechas', [VentaController::class, 'getByDateRange']);
        Route::get('/resumen', [VentaController::class, 'getResumen']);
        Route::get('/{venta}', [VentaController::class, 'show']);
        Route::patch('/{venta}', [VentaController::class, 'update']);
        Route::delete('/{venta}', [VentaController::class, 'destroy']);
    });

    // Detalles de Venta
    Route::prefix('venta-detalles')->group(function () {
        Route::get('/', [VentaDetalleController::class, 'index']);
        Route::post('/', [VentaDetalleController::class, 'store']);
        Route::get('/{detalle}', [VentaDetalleController::class, 'show']);
        Route::patch('/{detalle}', [VentaDetalleController::class, 'update']);
        Route::delete('/{detalle}', [VentaDetalleController::class, 'destroy']);
        Route::get('/por-venta/{ventaId}', [VentaDetalleController::class, 'getByVenta']);
        Route::get('/por-producto/{productoId}', [VentaDetalleController::class, 'getByProducto']);
    });

    // Movimientos
    Route::prefix('movimientos')->group(function () {
        Route::get('/', [MovimientoController::class, 'index']);
        Route::post('/', [MovimientoController::class, 'store']);
        Route::get('/por-fecha', [MovimientoController::class, 'getByDateRange']);
        Route::get('/por-producto/{productoId}', [MovimientoController::class, 'getByProducto']);
        Route::get('/por-sede/{sedeId}', [MovimientoController::class, 'getBySede']);
        Route::get('/resumen', [MovimientoController::class, 'getResumen']);
        Route::get('/{movimiento}', [MovimientoController::class, 'show']);
        Route::delete('/{movimiento}', [MovimientoController::class, 'destroy']);
    });

    // Rutas de configuración
    Route::get('/config', [ConfigController::class, 'index']);
    Route::put('/config/perfil', [ConfigController::class, 'updatePerfil']);
    Route::put('/config/seguridad', [ConfigController::class, 'updateSeguridad']);
    Route::put('/config/pago', [ConfigController::class, 'updatePago']);
    Route::put('/config/idioma', [ConfigController::class, 'updateIdioma']);
    Route::put('/config/apariencia', [ConfigController::class, 'updateApariencia']);
    Route::put('/config/password', [ConfigController::class, 'updatePassword']);

    // Rutas del Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/ventas-por-mes', [DashboardController::class, 'getVentasPorMes']);
    Route::get('/dashboard/productos-mas-vendidos', [DashboardController::class, 'getProductosMasVendidos']);
    Route::get('/dashboard/productos-stock-bajo', [DashboardController::class, 'getProductosStockBajo']);
    Route::get('/dashboard/ultimas-ventas', [DashboardController::class, 'getUltimasVentas']);
    Route::get('/dashboard/ultimas-compras', [DashboardController::class, 'getUltimasCompras']);
    Route::get('/dashboard/ultimos-movimientos', [DashboardController::class, 'getUltimosMovimientos']);

    // Notificaciones
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'destroyAll']);
    });

    // Mensajes
    Route::prefix('messages')->group(function () {
        Route::post('/user', [MessageController::class, 'sendToUser']);
        Route::post('/sede', [MessageController::class, 'sendToSede']);
        Route::post('/all', [MessageController::class, 'sendToAll']);
    });

    // Rutas para facturas
    Route::get('/facturas', [App\Http\Controllers\API\FacturaController::class, 'index']);
    Route::get('/facturas/venta/{id}', [App\Http\Controllers\API\FacturaController::class, 'generarFacturaVenta']);
    Route::get('/facturas/compra/{id}', [App\Http\Controllers\API\FacturaController::class, 'generarFacturaCompra']);
    Route::get('/facturas/descargar/{tipo}/{id}', [App\Http\Controllers\API\FacturaController::class, 'descargarFactura']);
});
