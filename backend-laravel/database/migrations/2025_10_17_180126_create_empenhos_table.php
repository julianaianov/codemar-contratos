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
        Schema::create('empenhos', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 50)->unique();
            $table->decimal('valor', 15, 2);
            $table->date('data_empenho');
            $table->date('data_vencimento');
            $table->enum('status', ['ativo', 'liquidado', 'cancelado'])->default('ativo');
            $table->text('observacoes')->nullable();
            $table->string('criado_por', 100);
            $table->timestamp('criado_em')->useCurrent();
            $table->string('atualizado_por', 100)->nullable();
            $table->timestamp('atualizado_em')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index('numero');
            $table->index('status');
            $table->index('data_empenho');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empenhos');
    }
};