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
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos');
            $table->enum('tipo', ['entrada', 'salida', 'transferencia', 'ajuste']);
            $table->integer('cantidad');
            $table->text('descripcion')->nullable();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->foreignId('sede_id')->nullable()->constrained('sedes');
            $table->foreignId('sede_origen_id')->nullable()->constrained('sedes');
            $table->foreignId('sede_destino_id')->nullable()->constrained('sedes');
            $table->timestamp('fecha')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};
