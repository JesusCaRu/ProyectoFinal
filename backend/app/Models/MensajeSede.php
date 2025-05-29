<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MensajeSede extends Model
{
    protected $table = 'mensaje_sedes';

    protected $fillable = [
        'mensaje',
        'usuario_id',
        'sede_id',
        'leido'
    ];

    protected $with = ['usuario', 'sede'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'leido' => 'boolean'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class, 'sede_id');
    }
}
