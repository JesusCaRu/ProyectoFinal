<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auditoria extends Model
{
    use HasFactory;

    protected $table = 'auditorias';

    protected $fillable = [
        'usuario_id',
        'accion',
        'tabla',
        'registro_id',
        'datos_anteriores',
        'datos_nuevos',
        'ip_address',
        'user_agent',
        'created_at'
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
        'created_at' => 'datetime'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }
}
