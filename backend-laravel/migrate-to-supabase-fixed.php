<?php

/**
 * Script para migrar dados do Laravel para o Supabase (Versão Corrigida)
 * Execute: php migrate-to-supabase-fixed.php
 */

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\FileImport;
use App\Models\ContratoImportado;

// Configurações do Supabase
$supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMxMzY0NywiZXhwIjoyMDc1ODg5NjQ3fQ.SflWQ_60oTQsPMos0HM-RxuSoM-I0mlW2LCRY9kQJQ0';

// Inicializar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🚀 Iniciando migração de dados do Laravel para Supabase...\n\n";

// Função para fazer requisições ao Supabase
function supabaseRequest($url, $data = null, $method = 'GET') {
    global $supabaseUrl, $supabaseKey;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $supabaseUrl . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $supabaseKey,
        'apikey: ' . $supabaseKey
    ]);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $decodedResponse = json_decode($response, true);
    
    return [
        'data' => $decodedResponse,
        'status' => $httpCode,
        'raw_response' => $response
    ];
}

// 1. Migrar usuários
echo "👥 Migrando usuários...\n";
$users = User::all();
$userMap = []; // Para mapear IDs antigos para novos

foreach ($users as $user) {
    $userData = [
        'name' => $user->name,
        'email' => $user->email,
        'password' => $user->password,
        'role' => $user->role ?? 'user',
        'is_active' => $user->is_active ?? true,
        'cpf' => $user->cpf,
        'department' => $user->department,
        'last_login_at' => $user->last_login_at,
        'created_at' => $user->created_at->toISOString(),
        'updated_at' => $user->updated_at->toISOString()
    ];
    
    $response = supabaseRequest('/rest/v1/users', $userData, 'POST');
    
    if ($response['status'] === 201 && isset($response['data']['id'])) {
        $newUserId = $response['data']['id'];
        $userMap[$user->id] = $newUserId;
        echo "  ✅ Usuário '{$user->name}' migrado (ID: {$newUserId})\n";
    } else {
        echo "  ❌ Erro ao migrar usuário '{$user->name}': " . $response['raw_response'] . "\n";
    }
}

// Se não há usuários, criar um admin padrão
if (empty($userMap)) {
    echo "  📝 Criando usuário admin padrão...\n";
    $adminData = [
        'name' => 'Administrador',
        'email' => 'admin@codemar.com',
        'password' => 'hashed_admin_password_123',
        'role' => 'admin',
        'is_active' => true,
        'department' => 'Presidência'
    ];
    
    $response = supabaseRequest('/rest/v1/users', $adminData, 'POST');
    if ($response['status'] === 201 && isset($response['data']['id'])) {
        $adminId = $response['data']['id'];
        $userMap[0] = $adminId; // Usar 0 como ID padrão
        echo "  ✅ Usuário admin criado (ID: {$adminId})\n";
    } else {
        echo "  ❌ Erro ao criar usuário admin: " . $response['raw_response'] . "\n";
    }
}

echo "\n";

// 2. Migrar file_imports
echo "📁 Migrando importações de arquivos...\n";
$fileImports = FileImport::all();
$fileImportMap = []; // Para mapear IDs antigos para novos

foreach ($fileImports as $fileImport) {
    $userId = $userMap[$fileImport->user_id] ?? $userMap[0] ?? null;
    
    $fileImportData = [
        'original_filename' => $fileImport->original_filename,
        'stored_filename' => $fileImport->stored_filename,
        'file_path' => $fileImport->file_path,
        'file_type' => $fileImport->file_type,
        'status' => $fileImport->status,
        'total_records' => $fileImport->total_records,
        'processed_records' => $fileImport->processed_records,
        'successful_records' => $fileImport->successful_records,
        'failed_records' => $fileImport->failed_records,
        'error_message' => $fileImport->error_message,
        'metadata' => $fileImport->metadata ? json_decode($fileImport->metadata, true) : null,
        'user_id' => $userId,
        'started_at' => $fileImport->started_at ? $fileImport->started_at->toISOString() : null,
        'completed_at' => $fileImport->completed_at ? $fileImport->completed_at->toISOString() : null,
        'created_at' => $fileImport->created_at->toISOString(),
        'updated_at' => $fileImport->updated_at->toISOString()
    ];
    
    $response = supabaseRequest('/rest/v1/file_imports', $fileImportData, 'POST');
    
    if ($response['status'] === 201 && isset($response['data']['id'])) {
        $newFileImportId = $response['data']['id'];
        $fileImportMap[$fileImport->id] = $newFileImportId;
        echo "  ✅ Importação '{$fileImport->original_filename}' migrada (ID: {$newFileImportId})\n";
    } else {
        echo "  ❌ Erro ao migrar importação '{$fileImport->original_filename}': " . $response['raw_response'] . "\n";
    }
}

echo "\n";

// 3. Migrar contratos_importados
echo "📄 Migrando contratos...\n";
$contratos = ContratoImportado::all();
$migratedCount = 0;
$errorCount = 0;

foreach ($contratos as $contrato) {
    $fileImportId = $fileImportMap[$contrato->file_import_id] ?? null;
    
    $contratoData = [
        'file_import_id' => $fileImportId,
        'ano_numero' => $contrato->ano_numero,
        'numero_contrato' => $contrato->numero_contrato,
        'ano' => $contrato->ano,
        'pa' => $contrato->pa,
        'diretoria' => $contrato->diretoria,
        'modalidade' => $contrato->modalidade,
        'nome_empresa' => $contrato->nome_empresa,
        'cnpj_empresa' => $contrato->cnpj_empresa,
        'objeto' => $contrato->objeto,
        'data_assinatura' => $contrato->data_assinatura,
        'prazo' => $contrato->prazo,
        'unidade_prazo' => $contrato->unidade_prazo,
        'valor_contrato' => $contrato->valor_contrato,
        'vencimento' => $contrato->vencimento,
        'gestor_contrato' => $contrato->gestor_contrato,
        'fiscal_tecnico' => $contrato->fiscal_tecnico,
        'fiscal_administrativo' => $contrato->fiscal_administrativo,
        'suplente' => $contrato->suplente,
        'contratante' => $contrato->contratante,
        'contratado' => $contrato->contratado,
        'cnpj_contratado' => $contrato->cnpj_contratado,
        'valor' => $contrato->valor,
        'data_inicio' => $contrato->data_inicio,
        'data_fim' => $contrato->data_fim,
        'status' => $contrato->status,
        'tipo_contrato' => $contrato->tipo_contrato,
        'secretaria' => $contrato->secretaria,
        'fonte_recurso' => $contrato->fonte_recurso,
        'observacoes' => $contrato->observacoes,
        'dados_originais' => $contrato->dados_originais ? json_decode($contrato->dados_originais, true) : null,
        'pdf_path' => $contrato->pdf_path,
        'processado' => $contrato->processado,
        'erro_processamento' => $contrato->erro_processamento,
        'created_at' => $contrato->created_at->toISOString(),
        'updated_at' => $contrato->updated_at->toISOString()
    ];
    
    $response = supabaseRequest('/rest/v1/contratos_importados', $contratoData, 'POST');
    
    if ($response['status'] === 201) {
        $migratedCount++;
        if ($migratedCount % 50 === 0) {
            echo "  ✅ {$migratedCount} contratos migrados...\n";
        }
    } else {
        $errorCount++;
        if ($errorCount <= 5) { // Mostrar apenas os primeiros 5 erros
            echo "  ❌ Erro ao migrar contrato '{$contrato->numero_contrato}': " . $response['raw_response'] . "\n";
        }
    }
}

echo "\n";

// Resumo final
echo "🎉 Migração concluída!\n";
echo "📊 Resumo:\n";
echo "  👥 Usuários migrados: " . count($userMap) . "\n";
echo "  📁 Importações migradas: " . count($fileImportMap) . "\n";
echo "  📄 Contratos migrados: {$migratedCount}\n";
echo "  ❌ Erros: {$errorCount}\n";

if ($errorCount > 0) {
    echo "\n⚠️  Alguns contratos não foram migrados. Verifique os erros acima.\n";
}

echo "\n✅ Dados migrados com sucesso para o Supabase!\n";
echo "🌐 Acesse: https://syhnkxbeftosviscvmmd.supabase.co\n";

