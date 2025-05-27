<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Añadir campos a proveedores
        Schema::table('proveedores', function (Blueprint $table) {
            $table->string('email')->nullable()->after('contacto');
            $table->string('telefono')->nullable()->after('email');
        });

        // Añadir campo a marcas
        Schema::table('marcas', function (Blueprint $table) {
            $table->text('descripcion')->nullable()->after('nombre');
        });

        // Añadir campos a sedes
        Schema::table('sedes', function (Blueprint $table) {
            $table->string('telefono')->nullable()->after('direccion');
            $table->string('email')->nullable()->after('telefono');
        });

        // Añadir campo a categorias
        Schema::table('categorias', function (Blueprint $table) {
            $table->text('descripcion')->nullable()->after('nombre');
        });
    }

    public function down()
    {
        // Revertir cambios en proveedores
        Schema::table('proveedores', function (Blueprint $table) {
            $table->dropColumn(['email', 'telefono']);
        });

        // Revertir cambios en marcas
        Schema::table('marcas', function (Blueprint $table) {
            $table->dropColumn('descripcion');
        });

        // Revertir cambios en sedes
        Schema::table('sedes', function (Blueprint $table) {
            $table->dropColumn(['telefono', 'email']);
        });

        // Revertir cambios en categorias
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn('descripcion');
        });
    }
};
