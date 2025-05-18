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
    Route::apiResource('auditorias', AuditoriaController::class);

    // Categorias
    Route::apiResource('categorias', CategoriaController::class);

    // Marcas
    Route::apiResource('marcas', MarcaController::class);

    // Sedes
    Route::apiResource('sedes', SedeController::class);

    // Productos
    Route::apiResource('productos', ProductoController::class);

    // Transferencias
    Route::apiResource('transferencias', TransferenciaController::class);

    // Proveedores
    Route::apiResource('proveedores', ProveedorController::class);

    // Compras
    Route::apiResource('compras', CompraController::class);
    Route::apiResource('compra-detalles', CompraDetalleController::class);

    // Ventas
    Route::prefix('ventas')->group(function () {
        Route::get('/', [VentaController::class, 'index']);
        Route::post('/', [VentaController::class, 'store']);
        Route::get('/por-fechas', [VentaController::class, 'getByDateRange']);
        Route::get('/resumen', [VentaController::class, 'getResumen']);
        Route::get('/{venta}', [VentaController::class, 'show']);
    });
    Route::apiResource('venta-detalles', VentaDetalleController::class);

    // Movimientos
    Route::apiResource('movimientos', MovimientoController::class);
});
