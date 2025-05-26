<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            // Campos de notificaciones
            $table->boolean('notificaciones_email')->default(true);
            $table->boolean('notificaciones_push')->default(true);
            $table->boolean('recordatorios_stock')->default(true);

            // Campos de pago
            $table->string('metodo_pago')->default('Tarjeta de Crédito');
            $table->string('moneda')->default('MXN');

            // Campos de idioma
            $table->string('idioma')->default('Español');
            $table->string('zona_horaria')->default('UTC-6');

            // Campos de apariencia
            $table->string('tema')->default('Claro');
            $table->string('densidad')->default('Normal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'notificaciones_email',
                'notificaciones_push',
                'recordatorios_stock',
                'metodo_pago',
                'moneda',
                'idioma',
                'zona_horaria',
                'tema',
                'densidad'
            ]);
        });
    }
};
