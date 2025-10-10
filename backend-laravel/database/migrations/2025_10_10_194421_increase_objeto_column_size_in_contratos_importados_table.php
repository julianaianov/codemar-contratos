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
            // Aumentar o tamanho da coluna objeto para TEXT (até 65.535 caracteres)
            $table->text('objeto')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos_importados', function (Blueprint $table) {
            // Reverter para string menor
            $table->string('objeto', 500)->nullable()->change();
        });
    }
};