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
        Schema::create('contratos_importados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_import_id')->nullable()->constrained('file_imports')->cascadeOnDelete();
            $table->string('numero_contrato')->nullable();
            $table->string('objeto')->nullable();
            $table->string('contratante')->nullable();
            $table->string('contratado')->nullable();
            $table->string('cnpj_contratado')->nullable();
            $table->decimal('valor', 15, 2)->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->string('modalidade')->nullable();
            $table->string('status')->nullable();
            $table->string('tipo_contrato')->nullable();
            $table->string('secretaria')->nullable();
            $table->string('fonte_recurso')->nullable();
            $table->text('observacoes')->nullable();
            $table->json('dados_originais')->nullable();
            $table->boolean('processado')->default(false);
            $table->text('erro_processamento')->nullable();
            $table->timestamps();
            
            $table->index('numero_contrato');
            $table->index('cnpj_contratado');
            $table->index('file_import_id');
            $table->index('processado');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contratos_importados');
    }
};
