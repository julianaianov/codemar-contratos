<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ContratoImportado;

class ReprocessarContratos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contratos:reprocessar {--file-id= : ID do arquivo de importação específico}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reprocessa contratos importados para preencher campos principais com dados do Excel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $fileId = $this->option('file-id');
        
        $query = ContratoImportado::query();
        
        if ($fileId) {
            $query->where('file_import_id', $fileId);
            $this->info("Reprocessando contratos do arquivo ID: {$fileId}");
        } else {
            $this->info("Reprocessando todos os contratos...");
        }
        
        $contratos = $query->get();
        $total = $contratos->count();
        
        if ($total === 0) {
            $this->warn('Nenhum contrato encontrado para reprocessar.');
            return;
        }
        
        $this->info("Encontrados {$total} contratos para reprocessar.");
        
        $bar = $this->output->createProgressBar($total);
        $bar->start();
        
        $processados = 0;
        $erros = 0;
        
        foreach ($contratos as $contrato) {
            try {
                $this->reprocessarContrato($contrato);
                $processados++;
            } catch (\Exception $e) {
                $erros++;
                $this->error("Erro ao processar contrato ID {$contrato->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        
        $this->info("Reprocessamento concluído!");
        $this->info("Processados com sucesso: {$processados}");
        if ($erros > 0) {
            $this->warn("Erros: {$erros}");
        }
    }
    
    private function reprocessarContrato(ContratoImportado $contrato)
    {
        $dadosOriginais = $contrato->dados_originais;
        
        if (!$dadosOriginais || !is_array($dadosOriginais)) {
            return;
        }
        
        // Extrai dados dos dados_originais
        $nomeEmpresa = $this->getValue($dadosOriginais, ['nome da empresa', 'NOME DA EMPRESA', 'empresa']);
        $cnpjEmpresa = $this->getValue($dadosOriginais, ['cnpj da empresa', 'CNPJ DA EMPRESA', 'cnpj']);
        $valorContrato = $this->getValue($dadosOriginais, ['valor do contrato', 'VALOR DO CONTRATO', 'valor']);
        $diretoriaRequisitante = $this->getValue($dadosOriginais, ['diretoria requisitante', 'DIRETORIA REQUISITANTE', 'diretoria']);
        $status = $this->getValue($dadosOriginais, ['status', 'STATUS']);
        $gestorContrato = $this->getValue($dadosOriginais, ['gestor do contrato', 'GESTOR DO CONTRATO', 'gestor']);
        $fiscalTecnico = $this->getValue($dadosOriginais, ['fiscal técnico', 'FISCAL TÉCNICO', 'fiscal_tecnico']);
        $fiscalAdministrativo = $this->getValue($dadosOriginais, ['fiscal administrativo', 'FISCAL ADMINISTRATIVO', 'fiscal_admin']);
        $suplente = $this->getValue($dadosOriginais, ['suplente', 'SUPLENTE']);
        $observacoes = $this->getValue($dadosOriginais, ['observações', 'OBSERVAÇÕES', 'obs']);
        
        // Atualiza os campos principais
        $contrato->update([
            // Campos específicos
            'nome_empresa' => $nomeEmpresa,
            'cnpj_empresa' => $cnpjEmpresa,
            'valor_contrato' => $this->parseDecimal($valorContrato),
            'diretoria' => $diretoriaRequisitante,
            'status' => $status,
            'gestor_contrato' => $gestorContrato,
            'fiscal_tecnico' => $fiscalTecnico,
            'fiscal_administrativo' => $fiscalAdministrativo,
            'suplente' => $suplente,
            'observacoes' => $observacoes,
            
            // Campos legados para compatibilidade
            'contratado' => $nomeEmpresa, // CONTRATADO = NOME DA EMPRESA
            'cnpj_contratado' => $cnpjEmpresa, // CNPJ = CNPJ DA EMPRESA
            'valor' => $this->parseDecimal($valorContrato), // VALOR = VALOR DO CONTRATO
            'secretaria' => $diretoriaRequisitante, // SECRETARIA = DIRETORIA REQUISITANTE
            
            'processado' => true,
        ]);
    }
    
    private function getValue(array $data, array $possibleKeys): ?string
    {
        foreach ($possibleKeys as $key) {
            if (isset($data[$key]) && !empty($data[$key])) {
                return trim($data[$key]);
            }
        }
        return null;
    }
    
    private function parseDecimal($value): ?float
    {
        if (!$value) {
            return null;
        }
        
        // Remove espaços e caracteres especiais (R$, espaços, etc.)
        $value = trim($value);
        $value = preg_replace('/[^\d,.-]/', '', $value);
        
        // Se está vazio após limpeza, retorna null
        if (empty($value)) {
            return null;
        }
        
        // Trata formato brasileiro: 12.535.373,49
        if (preg_match('/^\d{1,3}(\.\d{3})*,\d{2}$/', $value)) {
            // Remove pontos de milhares e substitui vírgula por ponto
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);
        }
        // Trata formato com ponto e vírgula: 12,535,373.49
        elseif (preg_match('/^\d{1,3}(,\d{3})*\.\d{2}$/', $value)) {
            // Remove vírgulas de milhares
            $value = str_replace(',', '', $value);
        }
        // Trata formato americano: 12535373.49
        elseif (preg_match('/^\d+\.\d{2}$/', $value)) {
            // Já está no formato correto
        }
        // Trata formato sem decimais: 12535373
        elseif (preg_match('/^\d+$/', $value)) {
            // Já está no formato correto
        }
        // Outros formatos - tenta limpar
        else {
            $value = str_replace(',', '.', $value);
        }
        
        return is_numeric($value) ? (float) $value : null;
    }
}