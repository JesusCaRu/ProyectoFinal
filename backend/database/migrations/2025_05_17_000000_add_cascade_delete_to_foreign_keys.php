<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Productos
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropForeign(['marca_id']);
            $table->dropForeign(['sede_id']);

            $table->foreign('categoria_id')
                ->references('id')
                ->on('categorias')
                ->onDelete('cascade');

            $table->foreign('marca_id')
                ->references('id')
                ->on('marcas')
                ->onDelete('cascade');

            $table->foreign('sede_id')
                ->references('id')
                ->on('sedes')
                ->onDelete('cascade');
        });

        // Compras
        Schema::table('compras', function (Blueprint $table) {
            $table->dropForeign(['proveedor_id']);
            $table->dropForeign(['usuario_id']);

            $table->foreign('proveedor_id')
                ->references('id')
                ->on('proveedores')
                ->onDelete('cascade');

            $table->foreign('usuario_id')
                ->references('id')
                ->on('usuarios')
                ->onDelete('cascade');
        });

        // Compra detalles
        Schema::table('compra_detalles', function (Blueprint $table) {
            $table->dropForeign(['compra_id']);
            $table->dropForeign(['producto_id']);

            $table->foreign('compra_id')
                ->references('id')
                ->on('compras')
                ->onDelete('cascade');

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos')
                ->onDelete('cascade');
        });

        // Venta detalles
        Schema::table('venta_detalles', function (Blueprint $table) {
            $table->dropForeign(['venta_id']);
            $table->dropForeign(['producto_id']);

            $table->foreign('venta_id')
                ->references('id')
                ->on('ventas')
                ->onDelete('cascade');

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos')
                ->onDelete('cascade');
        });

        // Transferencias
        Schema::table('transferencias', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->dropForeign(['sede_origen_id']);
            $table->dropForeign(['sede_destino_id']);

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos')
                ->onDelete('cascade');

            $table->foreign('sede_origen_id')
                ->references('id')
                ->on('sedes')
                ->onDelete('cascade');

            $table->foreign('sede_destino_id')
                ->references('id')
                ->on('sedes')
                ->onDelete('cascade');
        });

        // Movimientos
        Schema::table('movimientos', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->dropForeign(['usuario_id']);

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos')
                ->onDelete('cascade');

            $table->foreign('usuario_id')
                ->references('id')
                ->on('usuarios')
                ->onDelete('cascade');
        });

        // Usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropForeign(['rol_id']);
            $table->dropForeign(['sede_id']);

            $table->foreign('rol_id')
                ->references('id')
                ->on('roles')
                ->onDelete('cascade');

            $table->foreign('sede_id')
                ->references('id')
                ->on('sedes')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        // Productos
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropForeign(['marca_id']);
            $table->dropForeign(['sede_id']);

            $table->foreign('categoria_id')
                ->references('id')
                ->on('categorias');

            $table->foreign('marca_id')
                ->references('id')
                ->on('marcas');

            $table->foreign('sede_id')
                ->references('id')
                ->on('sedes');
        });

        // Compras
        Schema::table('compras', function (Blueprint $table) {
            $table->dropForeign(['proveedor_id']);
            $table->dropForeign(['usuario_id']);

            $table->foreign('proveedor_id')
                ->references('id')
                ->on('proveedores');

            $table->foreign('usuario_id')
                ->references('id')
                ->on('usuarios');
        });

        // Compra detalles
        Schema::table('compra_detalles', function (Blueprint $table) {
            $table->dropForeign(['compra_id']);
            $table->dropForeign(['producto_id']);

            $table->foreign('compra_id')
                ->references('id')
                ->on('compras');

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos');
        });

        // Venta detalles
        Schema::table('venta_detalles', function (Blueprint $table) {
            $table->dropForeign(['venta_id']);
            $table->dropForeign(['producto_id']);

            $table->foreign('venta_id')
                ->references('id')
                ->on('ventas');

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos');
        });

        // Transferencias
        Schema::table('transferencias', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->dropForeign(['sede_origen_id']);
            $table->dropForeign(['sede_destino_id']);

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos');

            $table->foreign('sede_origen_id')
                ->references('id')
                ->on('sedes');

            $table->foreign('sede_destino_id')
                ->references('id')
                ->on('sedes');
        });

        // Movimientos
        Schema::table('movimientos', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->dropForeign(['usuario_id']);

            $table->foreign('producto_id')
                ->references('id')
                ->on('productos');

            $table->foreign('usuario_id')
                ->references('id')
                ->on('usuarios');
        });

        // Usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropForeign(['rol_id']);
            $table->dropForeign(['sede_id']);

            $table->foreign('rol_id')
                ->references('id')
                ->on('roles');

            $table->foreign('sede_id')
                ->references('id')
                ->on('sedes');
        });
    }
};
