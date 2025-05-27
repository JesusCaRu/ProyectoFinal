<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, LogsActivity;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'telefono',
        'rol_id',
        'sede_id',
        'activo',
        'ultimo_acceso',
        'notificaciones_email',
        'notificaciones_push',
        'recordatorios_stock',
        'metodo_pago',
        'moneda',
        'idioma',
        'zona_horaria',
        'tema',
        'densidad'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'notificaciones_email' => 'boolean',
        'notificaciones_push' => 'boolean',
        'recordatorios_stock' => 'boolean'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nombre', 'email', 'telefono', 'rol_id', 'sede_id', 'activo'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'sede_id');
    }

    public function auditorias()
    {
        return $this->hasMany(Auditoria::class, 'usuario_id');
    }

    public function compras()
    {
        return $this->hasMany(Compra::class, 'usuario_id');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'usuario_id');
    }

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class, 'usuario_id');
    }
}
