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
            $table->unsignedBigInteger('rol_id')->nullable()->change();
            $table->unsignedBigInteger('sede_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->unsignedBigInteger('rol_id')->nullable(false)->change();
            $table->unsignedBigInteger('sede_id')->nullable(false)->change();
        });
    }
};
