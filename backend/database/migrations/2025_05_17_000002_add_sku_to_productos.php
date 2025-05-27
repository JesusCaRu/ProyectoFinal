<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Primero añadimos la columna sin la restricción única
        Schema::table('productos', function (Blueprint $table) {
            $table->string('sku')->nullable()->after('nombre');
        });

        // Generamos SKUs únicos para productos existentes
        $productos = DB::table('productos')->get();
        foreach ($productos as $producto) {
            $sku = 'SKU-' . str_pad($producto->id, 6, '0', STR_PAD_LEFT);
            DB::table('productos')
                ->where('id', $producto->id)
                ->update(['sku' => $sku]);
        }

        // Ahora añadimos la restricción única
        Schema::table('productos', function (Blueprint $table) {
            $table->unique('sku');
        });
    }

    public function down()
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropColumn('sku');
        });
    }
};
