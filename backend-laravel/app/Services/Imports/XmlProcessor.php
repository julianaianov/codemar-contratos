<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;

class XmlProcessor implements ProcessorInterface
{
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
            'numero_contrato' => (string) ($xml->numero ?? null),
            'objeto' => (string) ($xml->objeto ?? null),
            'contratante' => (string) ($xml->contratante ?? null),
            'contratado' => (string) ($xml->contratado ?? null),
            'cnpj_contratado' => (string) ($xml->cnpj ?? null),
            'valor' => $this->parseDecimal((string) ($xml->valor ?? '0')),
            'data_inicio' => $this->parseDate((string) ($xml->data_inicio ?? null)),
            'data_fim' => $this->parseDate((string) ($xml->data_fim ?? null)),
            'modalidade' => (string) ($xml->modalidade ?? null),
            'status' => (string) ($xml->status ?? null),
            'tipo_contrato' => (string) ($xml->tipo ?? null),
            'secretaria' => (string) ($xml->secretaria ?? null),
            'fonte_recurso' => (string) ($xml->fonte_recurso ?? null),
            'observacoes' => (string) ($xml->observacoes ?? null),
            'dados_originais' => json_decode(json_encode($xml), true),
        ]);
    }

    /**
     * Converte string para decimal
     */
    private function parseDecimal(?string $value): ?float
    {
        if (empty($value)) {
            return null;
        }

        // Remove caracteres não numéricos exceto . e ,
        $value = preg_replace('/[^\d,\.]/', '', $value);
        
        // Substitui vírgula por ponto
        $value = str_replace(',', '.', $value);
        
        return (float) $value;
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

