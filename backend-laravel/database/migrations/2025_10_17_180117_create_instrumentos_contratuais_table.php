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
        Schema::create('instrumentos_contratuais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos_importados')->cascadeOnDelete();
            $table->enum('tipo', [
                'colaboracao', 
                'comodato', 
                'concessao', 
                'convenio', 
                'cooperacao', 
                'fomento', 
                'parceria', 
                'patrocinio', 
                'protocolo_intencoes', 
                'cessao', 
                'reconhecimento_divida'
            ]);
            $table->string('numero', 20);
            $table->date('data_inicio');
            $table->date('data_fim');
            $table->decimal('valor', 15, 2);
            $table->text('descricao');
            $table->enum('status', ['ativo', 'suspenso', 'encerrado', 'cancelado'])->default('ativo');
            $table->text('observacoes')->nullable();
            $table->json('anexos')->nullable(); // Array de URLs dos anexos
            $table->string('criado_por', 100);
            $table->timestamp('criado_em')->useCurrent();
            $table->string('atualizado_por', 100)->nullable();
            $table->timestamp('atualizado_em')->nullable();
            $table->timestamps();
            
            // Validações serão feitas no modelo
            
            // Índices
            $table->unique(['contrato_id', 'numero'], 'unique_instrumento_contrato_numero');
            $table->index('contrato_id');
            $table->index('tipo');
            $table->index('status');
            $table->index('data_inicio');
            $table->index('data_fim');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instrumentos_contratuais');
    }
};