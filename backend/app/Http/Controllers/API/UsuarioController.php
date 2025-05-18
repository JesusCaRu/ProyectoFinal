<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = Usuario::with(['rol', 'sede'])->get();
        return response()->json(['data' => $usuarios]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios',
            'password' => 'required|string|min:6',
            'rol_id' => 'required|exists:roles,id',
            'sede_id' => 'required|exists:sedes,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol_id' => $request->rol_id,
            'sede_id' => $request->sede_id
        ]);

        return response()->json(['data' => $usuario], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Usuario $usuario)
    {
        return response()->json(['data' => $usuario->load(['rol', 'sede'])]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Usuario $usuario)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios,email,' . $usuario->id,
            'password' => 'nullable|string|min:6',
            'rol_id' => 'required|exists:roles,id',
            'sede_id' => 'required|exists:sedes,id',
            'activo' => 'boolean|in:0,1,true,false'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['nombre', 'email', 'rol_id', 'sede_id', 'activo']);
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Asegurarnos de que activo sea booleano
        if ($request->has('activo')) {
            $data['activo'] = (bool)$request->activo;
        }

        $usuario->update($data);
        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'data' => $usuario->load(['rol', 'sede'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Usuario $usuario)
    {
        try {
            $usuario->delete();
            return response()->json([
                'message' => 'Usuario eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurar un usuario eliminado
     */
    public function restore($id)
    {
        try {
            $usuario = Usuario::withTrashed()->findOrFail($id);
            $usuario->restore();
            return response()->json([
                'message' => 'Usuario restaurado correctamente',
                'data' => $usuario->load(['rol', 'sede'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al restaurar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener usuarios eliminados
     */
    public function trashed()
    {
        $usuarios = Usuario::onlyTrashed()->with(['rol', 'sede'])->get();
        return response()->json(['data' => $usuarios]);
    }

    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:100',
                'email' => 'required|email|unique:usuarios',
                'password' => 'required|string|min:6',
                'rol_id' => 'required|exists:roles,id',
                'sede_id' => 'required|exists:sedes,id',
                'activo' => 'boolean|in:0,1,true,false'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $usuario = Usuario::create([
                'nombre' => $request->nombre,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'rol_id' => $request->rol_id,
                'sede_id' => $request->sede_id,
                'activo' => (bool)$request->activo
            ]);

            $token = $usuario->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'data' => $usuario->load(['rol', 'sede']),
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar el usuario',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $usuario = Usuario::where('email', $request->email)->first();

            if (!$usuario || !Hash::check($request->password, $usuario->password)) {
                return response()->json([
                    'message' => 'Credenciales inválidas'
                ], 401);
            }

            // Verificar si el usuario está activo
            if (!$usuario->activo) {
                return response()->json([
                    'message' => 'Tu cuenta está inactiva. Por favor, contacta al administrador.'
                ], 403);
            }

            // Actualizar último acceso
            $usuario->ultimo_acceso = now();
            $usuario->save();

            // Eliminar tokens anteriores del usuario
            $usuario->tokens()->delete();

            // Crear nuevo token
            $token = $usuario->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login exitoso',
                'data' => $usuario->load(['rol', 'sede']),
                'token' => $token,
                'token_type' => 'Bearer'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    /**
     * Obtener los datos del usuario autenticado
     */
    public function me(Request $request)
    {
        $usuario = $request->user();

        // Actualizar último acceso
        $usuario->ultimo_acceso = now();
        $usuario->save();

        return response()->json([
            'data' => $usuario->load(['rol', 'sede'])
        ]);
    }

    /**
     * Cambiar el estado activo/inactivo de un usuario
     */
    public function cambiarEstado(Request $request, Usuario $usuario)
    {
        try {
            $validator = Validator::make($request->all(), [
                'activo' => 'required|boolean|in:0,1,true,false'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $usuario->activo = (bool)$request->activo;
            $usuario->save();

            return response()->json([
                'message' => $usuario->activo ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente',
                'data' => $usuario->load(['rol', 'sede'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cambiar el estado del usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
