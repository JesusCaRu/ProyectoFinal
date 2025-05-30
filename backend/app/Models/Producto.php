<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Producto extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'productos';

    protected $fillable = [
        'nombre',
        'sku',
        'tipo_producto',
        'descripcion',
        'categoria_id',
        'marca_id',
        'stock_minimo'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'marca_id');
    }

    public function sedes()
    {
        return $this->belongsToMany(Sede::class, 'producto_sede')
            ->withPivot(['stock', 'precio_compra', 'precio_venta'])
            ->withTimestamps();
    }

    public function transferencias()
    {
        return $this->hasMany(Transferencia::class, 'producto_id');
    }

    public function compraDetalles()
    {
        return $this->hasMany(CompraDetalle::class, 'producto_id');
    }

    public function ventaDetalles()
    {
        return $this->hasMany(VentaDetalle::class, 'producto_id');
    }

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class, 'producto_id');
    }
}
