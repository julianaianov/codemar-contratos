<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // MySQL não permite alterar ENUM diretamente, então vamos usar SQL raw
        DB::statement("ALTER TABLE file_imports MODIFY COLUMN file_type ENUM('xml', 'excel', 'csv', 'pdf') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'pdf' do ENUM
        DB::statement("ALTER TABLE file_imports MODIFY COLUMN file_type ENUM('xml', 'excel', 'csv') NOT NULL");
    }
};
