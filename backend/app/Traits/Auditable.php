<?php

namespace App\Traits;

use App\Models\Auditoria;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->audit('CREATE', null, $model->toArray());
        });

        static::updated(function ($model) {
            $model->audit('UPDATE', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->audit('DELETE', $model->toArray(), null);
        });
    }

    protected function audit($accion, $datosAnteriores, $datosNuevos)
    {
        if (!Auth::check()) {
            return;
        }

        Auditoria::create([
            'usuario_id' => Auth::id(),
            'accion' => $accion,
            'tabla' => $this->getTable(),
            'registro_id' => $this->getKey(),
            'datos_anteriores' => $datosAnteriores,
            'datos_nuevos' => $datosNuevos,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent()
        ]);
    }
}