<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Sede extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'sedes';

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'email',
        'estado'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function productos()
    {
        return $this->hasMany(Producto::class);
    }

    public function usuarios()
    {
        return $this->hasMany(Usuario::class);
    }

    public function transferenciasOrigen()
    {
        return $this->hasMany(Transferencia::class, 'sede_origen_id');
    }

    public function transferenciasDestino()
    {
        return $this->hasMany(Transferencia::class, 'sede_destino_id');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function compras()
    {
        return $this->hasMany(Compra::class);
    }
}
