<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;

class XmlProcessor implements ProcessorInterface
{
    private ?string $diretoria = null;

    public function setDiretoria(string $diretoria): void
    {
        $this->diretoria = $diretoria;
    }
    /**
     * Processa arquivo XML
     */
    public function process(FileImport $fileImport): void
    {
        $filePath = Storage::path($fileImport->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        // Carrega o XML
        $xml = simplexml_load_file($filePath);
        
        if ($xml === false) {
            throw new \Exception('Erro ao carregar arquivo XML');
        }

        // Conta total de registros
        $totalRecords = 0;
        $successCount = 0;
        $failCount = 0;

        // Processa cada contrato no XML
        // Assume estrutura: <contratos><contrato>...</contrato></contratos>
        foreach ($xml->contrato ?? [] as $contratoXml) {
            $totalRecords++;
            
            try {
                $this->processContratoXml($contratoXml, $fileImport);
                $successCount++;
            } catch (\Exception $e) {
                $failCount++;
                \Log::error('Erro ao processar contrato XML', [
                    'file_import_id' => $fileImport->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Atualiza contadores
        $fileImport->update([
            'total_records' => $totalRecords,
            'processed_records' => $totalRecords,
            'successful_records' => $successCount,
            'failed_records' => $failCount,
        ]);
    }

    /**
     * Processa um contrato individual do XML
     */
    private function processContratoXml(\SimpleXMLElement $xml, FileImport $fileImport): void
    {
        ContratoImportado::create([
            'file_import_id' => $fileImport->id,
            // Estendidos
            'ano_numero' => (string) ($xml->{'ano-nº'} ?? $xml->{'ano_numero'} ?? $xml->{'ano_numero_contrato'} ?? null),
            'numero_contrato' => (string) ($xml->{'contrato'} ?? $xml->{'numero'} ?? $xml->{'numero_contrato'} ?? $xml->{'nº contrato'} ?? null),
            'ano' => (string) ($xml->{'ano'} ?? $xml->{'ano_contrato'} ?? null),
            'pa' => (string) ($xml->{'P.A'} ?? $xml->{'pa'} ?? $xml->{'p.a'} ?? $xml->{'processo_administrativo'} ?? $xml->{'processo'} ?? null),
            'diretoria' => (string) ($xml->{'DIRETORIA REQUISITANTE'} ?? $xml->{'diretoria_requisitante'} ?? $xml->{'DIRETORIA'} ?? $xml->{'diretoria'} ?? $xml->{'secretaria'} ?? $xml->{'unidade'} ?? $this->diretoria ?? null),
            'modalidade' => (string) ($xml->{'MODALIDADE'} ?? $xml->{'modalidade'} ?? $xml->{'modalidade_licitacao'} ?? null),
            'nome_empresa' => (string) ($xml->{'NOME DA EMPRESA'} ?? $xml->{'nome_empresa'} ?? $xml->{'empresa'} ?? $xml->{'contratado'} ?? $xml->{'fornecedor'} ?? $xml->{'razao_social'} ?? null),
            'cnpj_empresa' => (string) ($xml->{'CNPJ DA EMPRESA'} ?? $xml->{'cnpj_empresa'} ?? $xml->{'cnpj'} ?? $xml->{'cnpj_contratado'} ?? null),
            'objeto' => (string) ($xml->{'OBJETO'} ?? $xml->{'objeto'} ?? $xml->{'descricao'} ?? $xml->{'descrição'} ?? $xml->{'objeto_contrato'} ?? null),
            'data_assinatura' => $this->parseDate((string) ($xml->{'DATA DA ASSINATURA'} ?? $xml->{'data_assinatura'} ?? $xml->{'assinatura'} ?? $xml->{'data_contrato'} ?? null)),
            'prazo' => (string) ($xml->{'PRAZO'} ?? $xml->{'prazo'} ?? $xml->{'prazo_contrato'} ?? $xml->{'duracao'} ?? null),
            'unidade_prazo' => (string) ($xml->{'UNID. PRAZO'} ?? $xml->{'unidade_prazo'} ?? $xml->{'unid_prazo'} ?? $xml->{'unidade'} ?? $xml->{'periodo'} ?? null),
            'valor_contrato' => $this->parseDecimal((string) ($xml->{'VALOR DO CONTRATO'} ?? $xml->{'valor_contrato'} ?? $xml->{'valor'} ?? $xml->{'valor_total'} ?? '0')),
            'vencimento' => $this->parseDate((string) ($xml->{'VENCIMENTO'} ?? $xml->{'vencimento'} ?? $xml->{'data_vencimento'} ?? $xml->{'data_fim'} ?? $xml->{'vigencia_fim'} ?? null)),
            'gestor_contrato' => (string) ($xml->{'GESTOR DO CONTRATO'} ?? $xml->{'gestor_contrato'} ?? $xml->{'gestor'} ?? $xml->{'responsavel'} ?? null),
            'fiscal_tecnico' => (string) ($xml->{'FISCAL TÉCNICO'} ?? $xml->{'fiscal_tecnico'} ?? null),
            'fiscal_administrativo' => (string) ($xml->{'FISCAL ADMINISTRATIVO'} ?? $xml->{'fiscal_administrativo'} ?? $xml->{'fiscal_admin'} ?? null),
            'suplente' => (string) ($xml->{'SUPLENTE'} ?? $xml->{'suplente'} ?? $xml->{'substituto'} ?? null),
            // Legados
            'contratante' => (string) ($xml->contratante ?? null),
            'contratado' => (string) ($xml->contratado ?? ($xml->{'NOME DA EMPRESA'} ?? $xml->{'nome_empresa'} ?? $xml->{'empresa'} ?? $xml->{'fornecedor'} ?? null)),
            'cnpj_contratado' => (string) ($xml->cnpj ?? $xml->{'cnpj_empresa'} ?? null),
            'valor' => $this->parseDecimal((string) ($xml->valor ?? $xml->{'valor_contrato'} ?? $xml->{'valor_total'} ?? '0')),
            'data_inicio' => $this->parseDate((string) ($xml->data_inicio ?? $xml->{'data_assinatura'} ?? null)),
            'data_fim' => $this->parseDate((string) ($xml->data_fim ?? $xml->{'vencimento'} ?? null)),
            'status' => (string) ($xml->status ?? null),
            'tipo_contrato' => (string) ($xml->tipo ?? null),
            'secretaria' => (string) ($xml->{'DIRETORIA REQUISITANTE'} ?? $xml->{'diretoria_requisitante'} ?? $xml->{'DIRETORIA'} ?? $xml->{'diretoria'} ?? $xml->{'secretaria'} ?? $this->diretoria ?? null),
            'fonte_recurso' => (string) ($xml->fonte_recurso ?? null),
            'observacoes' => (string) ($xml->{'OBSERVAÇÕES'} ?? $xml->observacoes ?? null),
            'dados_originais' => json_decode(json_encode($xml), true),
        ]);
    }

    /**
     * Converte string para decimal
     */
    private function parseDecimal(?string $value): ?float
    {
        if ($value === null || $value === '') return null;
        if (is_numeric($value)) return (float)$value;
        $s = preg_replace('/[^\d,\.]/', '', (string)$value);
        $lastDot = strrpos($s, '.');
        $lastComma = strrpos($s, ',');
        if ($lastDot !== false && $lastComma !== false) {
            if ($lastDot > $lastComma) {
                $s = str_replace(',', '', $s);
            } else {
                $s = str_replace('.', '', $s);
                $s = str_replace(',', '.', $s);
            }
        } elseif ($lastComma !== false) {
            $s = str_replace(',', '.', $s);
        }
        return is_numeric($s) ? (float)$s : null;
    }

    /**
     * Converte string para data
     */
    private function parseDate(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            $date = \Carbon\Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}

