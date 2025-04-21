<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $auditorias = Auditoria::with('usuario')->get();
        return response()->json(['data' => $auditorias]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:usuarios,id',
            'accion' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditoria = Auditoria::create($request->all());
        return response()->json(['data' => $auditoria], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Auditoria $auditoria)
    {
        return response()->json(['data' => $auditoria->load('usuario')]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Auditoria $auditoria)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:usuarios,id',
            'accion' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditoria->update($request->all());
        return response()->json(['data' => $auditoria]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Auditoria $auditoria)
    {
        $auditoria->delete();
        return response()->json(null, 204);
    }
}
