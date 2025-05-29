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

// Rutas públicas
Route::post('login', [UsuarioController::class, 'login']);
Route::post('register', [UsuarioController::class, 'register']);

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
});
