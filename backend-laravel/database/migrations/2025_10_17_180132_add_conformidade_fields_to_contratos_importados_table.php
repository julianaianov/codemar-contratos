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
            // Campos para controle de aditivos e conformidade
            $table->date('data_vigencia')->nullable()->after('data_fim');
            $table->date('data_execucao')->nullable()->after('data_vigencia');
            $table->decimal('valor_original', 15, 2)->nullable()->after('valor_contrato');
            $table->decimal('valor_atual', 15, 2)->nullable()->after('valor_original');
            $table->decimal('percentual_aditivo_total', 5, 2)->default(0)->after('valor_atual');
            $table->decimal('valor_aditivo_total', 15, 2)->default(0)->after('percentual_aditivo_total');
            $table->integer('quantidade_aditivos')->default(0)->after('valor_aditivo_total');
            $table->integer('quantidade_apostilamentos')->default(0)->after('quantidade_aditivos');
            $table->integer('quantidade_rescisoes')->default(0)->after('quantidade_apostilamentos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos_importados', function (Blueprint $table) {
            $table->dropColumn([
                'data_vigencia',
                'data_execucao',
                'valor_original',
                'valor_atual',
                'percentual_aditivo_total',
                'valor_aditivo_total',
                'quantidade_aditivos',
                'quantidade_apostilamentos',
                'quantidade_rescisoes',
            ]);
        });
    }
};