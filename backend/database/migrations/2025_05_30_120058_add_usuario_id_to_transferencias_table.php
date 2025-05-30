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
        Schema::table('transferencias', function (Blueprint $table) {
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transferencias', function (Blueprint $table) {
            $table->dropForeign(['usuario_id']);
            $table->dropColumn('usuario_id');
        });
    }
};
