<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sede extends Model
{
    use HasFactory;

    protected $table = 'sedes';

    protected $fillable = [
        'nombre',
        'direccion'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'sede_id');
    }

    public function transferenciasOrigen()
    {
        return $this->hasMany(Transferencia::class, 'sede_origen_id');
    }

    public function transferenciasDestino()
    {
        return $this->hasMany(Transferencia::class, 'sede_destino_id');
    }
}
