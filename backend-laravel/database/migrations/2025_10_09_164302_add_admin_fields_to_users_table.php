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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'user'])->default('user')->after('email');
            $table->boolean('is_active')->default(true)->after('role');
            $table->string('cpf')->nullable()->unique()->after('is_active');
            $table->string('department')->nullable()->after('cpf');
            $table->timestamp('last_login_at')->nullable()->after('department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active', 'cpf', 'department', 'last_login_at']);
        });
    }
};
