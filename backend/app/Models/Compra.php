<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Compra extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'compras';

    protected $fillable = [
        'proveedor_id',
        'usuario_id',
        'sede_id',
        'total',
        'estado'
    ];

    protected $casts = [
        'total' => 'decimal:2'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function detalles()
    {
        return $this->hasMany(CompraDetalle::class, 'compra_id');
    }

    public function puedeCambiarEstado($nuevoEstado)
    {
        if (!in_array($nuevoEstado, ['pendiente', 'completada', 'cancelada'])) {
            return false;
        }

        if ($this->estado === 'cancelada') {
            return false;
        }

        if ($this->estado === 'completada') {
            return false;
        }

        return true;
    }
}
