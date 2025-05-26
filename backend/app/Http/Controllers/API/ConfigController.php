<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ConfigController extends Controller
{
    /**
     * Obtener la configuración del usuario
     */
    public function index(Request $request)
    {
        try {
            $usuario = $request->user();

            return response()->json([
                'perfil' => [
                    'nombre' => $usuario->nombre,
                    'email' => $usuario->email,
                    'telefono' => $usuario->telefono ?? ''
                ],
                'seguridad' => [
                    'notificaciones_email' => $usuario->notificaciones_email ?? true,
                    'notificaciones_push' => $usuario->notificaciones_push ?? true,
                    'recordatorios_stock' => $usuario->recordatorios_stock ?? true
                ],
                'pago' => [
                    'metodo_pago' => $usuario->metodo_pago ?? 'Tarjeta de Crédito',
                    'moneda' => $usuario->moneda ?? 'MXN'
                ],
                'idioma' => [
                    'idioma' => $usuario->idioma ?? 'Español',
                    'zona_horaria' => $usuario->zona_horaria ?? 'UTC-6'
                ],
                'apariencia' => [
                    'tema' => $usuario->tema ?? 'Claro',
                    'densidad' => $usuario->densidad ?? 'Normal'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la configuración',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la configuración del perfil
     */
    public function updatePerfil(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:100',
                'email' => 'required|email|unique:usuarios,email,' . $request->user()->id,
                'telefono' => 'nullable|string|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = $request->user();
            $usuario->update($request->only(['nombre', 'email', 'telefono']));

            return response()->json([
                'message' => 'Perfil actualizado correctamente',
                'data' => [
                    'nombre' => $usuario->nombre,
                    'email' => $usuario->email,
                    'telefono' => $usuario->telefono
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la configuración de seguridad
     */
    public function updateSeguridad(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notificaciones_email' => 'boolean',
                'notificaciones_push' => 'boolean',
                'recordatorios_stock' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = $request->user();
            $usuario->update($request->all());

            return response()->json([
                'message' => 'Configuración de seguridad actualizada correctamente',
                'data' => [
                    'notificaciones_email' => $usuario->notificaciones_email,
                    'notificaciones_push' => $usuario->notificaciones_push,
                    'recordatorios_stock' => $usuario->recordatorios_stock
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la configuración de seguridad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la configuración de pago
     */
    public function updatePago(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'metodo_pago' => 'required|string|in:Tarjeta de Crédito,PayPal,Transferencia Bancaria',
                'moneda' => 'required|string|in:MXN,USD,EUR'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = $request->user();
            $usuario->update($request->all());

            return response()->json([
                'message' => 'Configuración de pago actualizada correctamente',
                'data' => [
                    'metodo_pago' => $usuario->metodo_pago,
                    'moneda' => $usuario->moneda
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la configuración de pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la configuración de idioma
     */
    public function updateIdioma(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'idioma' => 'required|string|in:Español,English,Français',
                'zona_horaria' => 'required|string|in:UTC-6,UTC-5,UTC-4'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = $request->user();
            $usuario->update($request->all());

            return response()->json([
                'message' => 'Configuración de idioma actualizada correctamente',
                'data' => [
                    'idioma' => $usuario->idioma,
                    'zona_horaria' => $usuario->zona_horaria
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la configuración de idioma',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la configuración de apariencia
     */
    public function updateApariencia(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tema' => 'required|string|in:Claro,Oscuro,Sistema',
                'densidad' => 'required|string|in:Compacto,Normal,Espacioso'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = $request->user();
            $usuario->update($request->all());

            return response()->json([
                'message' => 'Configuración de apariencia actualizada correctamente',
                'data' => [
                    'tema' => $usuario->tema,
                    'densidad' => $usuario->densidad
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la configuración de apariencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la contraseña
     */
    public function updatePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $usuario = $request->user();

            // Verificar contraseña actual
            if (!Hash::check($request->current_password, $usuario->password)) {
                return response()->json([
                    'message' => 'La contraseña actual es incorrecta'
                ], 422);
            }

            // Actualizar contraseña
            $usuario->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'message' => 'Contraseña actualizada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la contraseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
