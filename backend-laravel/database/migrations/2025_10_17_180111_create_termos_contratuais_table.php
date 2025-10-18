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
        Schema::create('termos_contratuais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos_importados')->cascadeOnDelete();
            $table->enum('tipo', ['apostilamento', 'aditivo', 'reconhecimento_divida', 'rescisao']);
            $table->string('numero', 20);
            $table->timestamp('data_criacao')->useCurrent();
            $table->date('data_vigencia');
            $table->date('data_execucao')->nullable();
            $table->decimal('valor_original', 15, 2)->default(0);
            $table->decimal('valor_aditivo', 15, 2)->nullable();
            $table->decimal('percentual_aditivo', 5, 2)->nullable();
            $table->text('descricao');
            $table->text('justificativa');
            $table->enum('status', ['pendente', 'aprovado', 'rejeitado', 'em_analise', 'executado'])->default('pendente');
            $table->string('empenho_id', 50)->nullable();
            $table->string('empenho_numero', 50)->nullable();
            $table->text('observacoes')->nullable();
            $table->json('anexos')->nullable(); // Array de URLs dos anexos
            $table->string('criado_por', 100);
            $table->timestamp('criado_em')->useCurrent();
            $table->string('atualizado_por', 100)->nullable();
            $table->timestamp('atualizado_em')->nullable();
            $table->timestamps();
            
            // Índices
            $table->unique(['contrato_id', 'numero'], 'unique_termo_contrato_numero');
            $table->index('contrato_id');
            $table->index('tipo');
            $table->index('status');
            $table->index('data_criacao');
            $table->index('data_vigencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('termos_contratuais');
    }
};