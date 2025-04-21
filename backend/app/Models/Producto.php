<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'categoria_id',
        'marca_id',
        'stock',
        'stock_minimo',
        'precio_compra',
        'precio_venta',
        'sede_id'
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'marca_id');
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'sede_id');
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
