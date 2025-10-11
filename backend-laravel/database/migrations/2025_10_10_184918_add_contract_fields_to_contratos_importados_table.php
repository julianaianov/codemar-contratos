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
            // Novos campos para informações específicas dos contratos
            $table->string('ano_numero')->nullable()->after('numero_contrato')->comment('ano-nº');
            $table->integer('ano')->nullable()->after('ano_numero')->comment('ano');
            $table->string('pa')->nullable()->after('ano')->comment('P.A');
            $table->string('diretoria')->nullable()->after('pa')->comment('DIRETORIA');
            $table->string('nome_empresa')->nullable()->after('modalidade')->comment('NOME DA EMPRESA');
            $table->string('cnpj_empresa')->nullable()->after('nome_empresa')->comment('CNPJ DA EMPRESA');
            $table->date('data_assinatura')->nullable()->after('objeto')->comment('DATA DA ASSINATURA');
            $table->integer('prazo')->nullable()->after('data_assinatura')->comment('PRAZO');
            $table->string('unidade_prazo')->nullable()->after('prazo')->comment('UNID. PRAZO');
            $table->decimal('valor_contrato', 15, 2)->nullable()->after('unidade_prazo')->comment('VALOR DO CONTRATO');
            $table->date('vencimento')->nullable()->after('valor_contrato')->comment('VENCIMENTO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos_importados', function (Blueprint $table) {
            $table->dropColumn([
                'ano_numero',
                'ano',
                'pa',
                'diretoria',
                'nome_empresa',
                'cnpj_empresa',
                'data_assinatura',
                'prazo',
                'unidade_prazo',
                'valor_contrato',
                'vencimento',
            ]);
        });
    }
};