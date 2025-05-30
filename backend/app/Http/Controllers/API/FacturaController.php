<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Compra;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ActivityHelper;
use Illuminate\Support\Facades\Log;

class FacturaController extends Controller
{
    /**
     * Genera una factura PDF para una venta específica
     */
    public function generarFacturaVenta(Request $request, $id)
    {
        try {
            $venta = Venta::with(['detalles.producto', 'usuario', 'sede'])->findOrFail($id);

            // Verificar que la venta tenga los datos necesarios
            if (!$venta->detalles || $venta->detalles->isEmpty()) {
                throw new \Exception("La venta #{$id} no tiene detalles");
            }

            if (!$venta->usuario) {
                throw new \Exception("La venta #{$id} no tiene usuario asociado");
            }

            if (!$venta->sede) {
                throw new \Exception("La venta #{$id} no tiene sede asociada");
            }

            // Generar el PDF
            $pdf = PDF::loadView('facturas.venta', [
                'venta' => $venta,
                'fecha' => now()->format('d/m/Y'),
                'numero' => 'V-' . str_pad($venta->id, 6, '0', STR_PAD_LEFT)
            ]);

            // Registrar actividad
            ActivityHelper::log(
                "Factura de venta #{$venta->id} generada",
                'facturas',
                [
                    'venta_id' => $venta->id,
                    'usuario_id' => $request->user()->id,
                    'tipo' => 'factura_venta_generada'
                ]
            );

            // Nombre del archivo
            $filename = 'factura-venta-' . $venta->id . '-' . now()->format('YmdHis') . '.pdf';

            // Verificar si existe el directorio
            $directory = 'public/facturas';
            if (!Storage::exists($directory)) {
                Storage::makeDirectory($directory);
            }

            // Guardar la factura en storage
            Storage::put($directory . '/' . $filename, $pdf->output());

            // Actualizar la venta con la referencia a la factura
            $venta->factura_url = 'facturas/' . $filename;
            $venta->save();

            // Devolver el PDF para descarga
            return $pdf->download('factura-venta-' . $venta->id . '.pdf');
        } catch (\Exception $e) {
            Log::error('Error al generar factura de venta: ' . $e->getMessage(), [
                'venta_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al generar la factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Genera una factura PDF para una compra específica
     */
    public function generarFacturaCompra(Request $request, $id)
    {
        try {
            $compra = Compra::with(['detalles.producto', 'proveedor', 'usuario', 'sede'])->findOrFail($id);

            // Verificar que la compra tenga los datos necesarios
            if (!$compra->detalles || $compra->detalles->isEmpty()) {
                throw new \Exception("La compra #{$id} no tiene detalles");
            }

            if (!$compra->usuario) {
                throw new \Exception("La compra #{$id} no tiene usuario asociado");
            }

            if (!$compra->sede) {
                throw new \Exception("La compra #{$id} no tiene sede asociada");
            }

            if (!$compra->proveedor) {
                throw new \Exception("La compra #{$id} no tiene proveedor asociado");
            }

            // Generar el PDF
            $pdf = PDF::loadView('facturas.compra', [
                'compra' => $compra,
                'fecha' => now()->format('d/m/Y'),
                'numero' => 'C-' . str_pad($compra->id, 6, '0', STR_PAD_LEFT)
            ]);

            // Registrar actividad
            ActivityHelper::log(
                "Factura de compra #{$compra->id} generada",
                'facturas',
                [
                    'compra_id' => $compra->id,
                    'usuario_id' => $request->user()->id,
                    'tipo' => 'factura_compra_generada'
                ]
            );

            // Nombre del archivo
            $filename = 'factura-compra-' . $compra->id . '-' . now()->format('YmdHis') . '.pdf';

            // Verificar si existe el directorio
            $directory = 'public/facturas';
            if (!Storage::exists($directory)) {
                Storage::makeDirectory($directory);
            }

            // Guardar la factura en storage
            Storage::put($directory . '/' . $filename, $pdf->output());

            // Actualizar la compra con la referencia a la factura
            $compra->factura_url = 'facturas/' . $filename;
            $compra->save();

            // Devolver el PDF para descarga
            return $pdf->download('factura-compra-' . $compra->id . '.pdf');
        } catch (\Exception $e) {
            Log::error('Error al generar factura de compra: ' . $e->getMessage(), [
                'compra_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al generar la factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene la lista de facturas generadas
     */
    public function index(Request $request)
    {
        try {
            $sedeId = $request->user()->sede_id;

            // Obtener facturas de ventas
            $ventas = Venta::whereNotNull('factura_url')
                ->where('sede_id', $sedeId)
                ->with(['usuario', 'sede'])
                ->when($request->has('fecha_inicio') && $request->has('fecha_fin'), function($query) use ($request) {
                    $query->whereBetween('created_at', [$request->fecha_inicio, $request->fecha_fin]);
                })
                ->get()
                ->map(function($venta) {
                    return [
                        'id' => $venta->id,
                        'tipo' => 'venta',
                        'numero' => 'V-' . str_pad($venta->id, 6, '0', STR_PAD_LEFT),
                        'fecha' => $venta->created_at,
                        'total' => $venta->total,
                        'usuario' => $venta->usuario,
                        'sede' => $venta->sede,
                        'factura_url' => $venta->factura_url,
                        'estado' => 'completada'
                    ];
                });

            // Obtener facturas de compras
            $compras = Compra::whereNotNull('factura_url')
                ->where('sede_id', $sedeId)
                ->with(['usuario', 'sede', 'proveedor'])
                ->when($request->has('fecha_inicio') && $request->has('fecha_fin'), function($query) use ($request) {
                    $query->whereBetween('created_at', [$request->fecha_inicio, $request->fecha_fin]);
                })
                ->get()
                ->map(function($compra) {
                    return [
                        'id' => $compra->id,
                        'tipo' => 'compra',
                        'numero' => 'C-' . str_pad($compra->id, 6, '0', STR_PAD_LEFT),
                        'fecha' => $compra->created_at,
                        'total' => $compra->total,
                        'usuario' => $compra->usuario,
                        'sede' => $compra->sede,
                        'proveedor' => $compra->proveedor,
                        'factura_url' => $compra->factura_url,
                        'estado' => $compra->estado
                    ];
                });

            // Combinar y ordenar por fecha
            $facturas = $ventas->concat($compras)->sortByDesc('fecha')->values();

            return response()->json([
                'data' => $facturas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las facturas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descarga una factura existente
     */
    public function descargarFactura(Request $request, $tipo, $id)
    {
        try {
            if ($tipo === 'venta') {
                $modelo = Venta::findOrFail($id);
            } else if ($tipo === 'compra') {
                $modelo = Compra::findOrFail($id);
            } else {
                return response()->json(['message' => 'Tipo de factura no válido'], 400);
            }

            if (!$modelo->factura_url) {
                // Si no existe la factura, generarla
                if ($tipo === 'venta') {
                    return $this->generarFacturaVenta($request, $id);
                } else {
                    return $this->generarFacturaCompra($request, $id);
                }
            }

            // Verificar si el archivo existe
            if (!Storage::exists('public/' . $modelo->factura_url)) {
                // Si no existe, regenerar
                if ($tipo === 'venta') {
                    return $this->generarFacturaVenta($request, $id);
                } else {
                    return $this->generarFacturaCompra($request, $id);
                }
            }

            // Registrar actividad
            ActivityHelper::log(
                "Factura de {$tipo} #{$modelo->id} descargada",
                'facturas',
                [
                    "{$tipo}_id" => $modelo->id,
                    'usuario_id' => $request->user()->id,
                    'tipo' => "factura_{$tipo}_descargada"
                ]
            );

            // Devolver el archivo para descarga
            return Storage::download('public/' . $modelo->factura_url, "factura-{$tipo}-{$modelo->id}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al descargar la factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
