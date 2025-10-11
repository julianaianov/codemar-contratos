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
        Schema::table('contratos_importados', function (Blueprint $table) {
            // Aumentar o tamanho de campos que podem ter textos longos
            $table->text('nome_empresa')->nullable()->change();
            $table->text('diretoria')->nullable()->change();
            $table->text('modalidade')->nullable()->change();
            $table->text('observacoes')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos_importados', function (Blueprint $table) {
            // Reverter para strings menores
            $table->string('nome_empresa', 255)->nullable()->change();
            $table->string('diretoria', 255)->nullable()->change();
            $table->string('modalidade', 255)->nullable()->change();
            $table->string('observacoes', 1000)->nullable()->change();
        });
    }
};