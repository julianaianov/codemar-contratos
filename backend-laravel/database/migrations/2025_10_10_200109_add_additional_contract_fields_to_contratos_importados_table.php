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
            // Novos campos específicos para contratos
            $table->text('gestor_contrato')->nullable()->after('observacoes');
            $table->text('fiscal_tecnico')->nullable()->after('gestor_contrato');
            $table->text('fiscal_administrativo')->nullable()->after('fiscal_tecnico');
            $table->text('suplente')->nullable()->after('fiscal_administrativo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos_importados', function (Blueprint $table) {
            $table->dropColumn([
                'gestor_contrato',
                'fiscal_tecnico',
                'fiscal_administrativo',
                'suplente',
            ]);
        });
    }
};