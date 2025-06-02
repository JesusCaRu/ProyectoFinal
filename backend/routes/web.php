<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Ruta principal que redirige a la documentación de la API o muestra un mensaje
Route::get('/', function () {
    return response()->json([
        'message' => 'StockFlow API',
        'version' => '1.0',
        'status' => 'running'
    ]);
});

// Manejar rutas no encontradas
Route::fallback(function () {
    return response()->json([
        'message' => 'Not Found. If you are looking for API routes, please use /api prefix.',
        'error' => 'Not Found'
    ], 404);
});
