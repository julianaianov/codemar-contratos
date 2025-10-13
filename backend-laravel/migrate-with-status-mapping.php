<?php

/**
 * Script para migrar dados do Laravel para o Supabase (com mapeamento de status)
 * Execute: php migrate-with-status-mapping.php
 */

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\FileImport;
use App\Models\ContratoImportado;

// Configurações do Supabase
$supabaseUrl = 'https://syhnkxbeftosviscvmmd.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aG5reGJlZnRvc3Zpc2N2bW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMxMzY0NywiZXhwIjoyMDc1ODg5NjQ3fQ.SflWQ_60oTQsPMos0HM-RxuSoM-I0mlW2LCRY9kQJQ0';

// Mapeamento de status do Laravel para Supabase
$statusMapping = [
    'VIGENTE' => 'vigente',
    'ENCERRADO' => 'encerrado',
    'ENCERRAOD' => 'encerrado',
    'EMCERRADO' => 'encerrado',
    'PARALISADO' => 'suspenso',
    'CONTRATO SUSPENSO POR PERIODO DETERMINADO' => 'suspenso',
    'RESCISÃO CONTRATUAL' => 'rescindido',
    'ENCERRADO/RESCINDIDO' => 'rescindido',
    'CANCELADO' => 'rescindido',
    'RENOVAÇÃO EM ANDAMENTO' => 'vigente',
    'AGUARDANDO PUBLICAÇÃO' => 'vigente',
    '-' => null,
    '' => null,
    null => null
];

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

// Função para processar dados JSON
function processJsonData($data) {
    if (is_null($data)) {
        return null;
    }
    
    if (is_string($data)) {
        $decoded = json_decode($data, true);
        return $decoded !== null ? $decoded : $data;
    }
    
    if (is_array($data)) {
        return $data;
    }
    
    return null;
}

// Função para mapear status
function mapStatus($laravelStatus) {
    global $statusMapping;
    
    if (is_null($laravelStatus) || $laravelStatus === '') {
        return null;
    }
    
    $upperStatus = strtoupper(trim($laravelStatus));
    return $statusMapping[$upperStatus] ?? 'vigente'; // Default para vigente se não encontrar
}

// 1. Verificar se usuário admin já existe
echo "👥 Verificando usuários...\n";
$response = supabaseRequest('/rest/v1/users?select=id,email&email=eq.admin@codemar.com');
$userMap = [];

if ($response['status'] === 200 && !empty($response['data'])) {
    $adminId = $response['data'][0]['id'];
    $userMap[0] = $adminId;
    echo "  ✅ Usuário admin já existe (ID: {$adminId})\n";
} else {
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
        $userMap[0] = $adminId;
        echo "  ✅ Usuário admin criado (ID: {$adminId})\n";
    } else {
        echo "  ❌ Erro ao criar usuário admin: " . $response['raw_response'] . "\n";
        exit(1);
    }
}

echo "\n";

// 2. Migrar file_imports
echo "📁 Migrando importações de arquivos...\n";
$fileImports = FileImport::all();
$fileImportMap = [];

foreach ($fileImports as $fileImport) {
    $userId = $userMap[0] ?? null;
    
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
        'metadata' => processJsonData($fileImport->metadata),
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
$statusCounts = [];

foreach ($contratos as $contrato) {
    $fileImportId = $fileImportMap[$contrato->file_import_id] ?? null;
    $mappedStatus = mapStatus($contrato->status);
    
    // Contar status
    $statusCounts[$mappedStatus] = ($statusCounts[$mappedStatus] ?? 0) + 1;
    
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
        'status' => $mappedStatus,
        'tipo_contrato' => $contrato->tipo_contrato,
        'secretaria' => $contrato->secretaria,
        'fonte_recurso' => $contrato->fonte_recurso,
        'observacoes' => $contrato->observacoes,
        'dados_originais' => processJsonData($contrato->dados_originais),
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
        if ($errorCount <= 5) {
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

echo "\n📈 Distribuição de status:\n";
foreach ($statusCounts as $status => $count) {
    echo "  - {$status}: {$count} contratos\n";
}

if ($errorCount > 0) {
    echo "\n⚠️  Alguns contratos não foram migrados. Verifique os erros acima.\n";
}

echo "\n✅ Dados migrados com sucesso para o Supabase!\n";
echo "🌐 Acesse: https://syhnkxbeftosviscvmmd.supabase.co\n";

