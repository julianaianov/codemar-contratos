<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Criar usuário administrador padrão
        User::firstOrCreate(
            ['email' => 'admin@codemar.com.br'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
                'cpf' => '00000000000',
                'department' => 'Tecnologia da Informação',
            ]
        );

        // Criar usuário de teste
        User::firstOrCreate(
            ['email' => 'usuario@codemar.com.br'],
            [
                'name' => 'Usuário Teste',
                'password' => Hash::make('usuario123'),
                'role' => 'user',
                'is_active' => true,
                'cpf' => '11111111111',
                'department' => 'Administração',
            ]
        );
    }
}