<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;

class CsvProcessor implements ProcessorInterface
{
    /**
     * Processa arquivo CSV
     */
    public function process(FileImport $fileImport): void
    {
        $filePath = Storage::path($fileImport->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        $handle = fopen($filePath, 'r');
        
        if ($handle === false) {
            throw new \Exception('Não foi possível abrir o arquivo CSV');
        }

        // Detecta o encoding
        $encoding = $this->detectEncoding($filePath);
        
        // Primeira linha contém cabeçalhos
        $headers = fgetcsv($handle, 0, ',');
        
        if ($headers === false) {
            fclose($handle);
            throw new \Exception('Arquivo CSV vazio ou inválido');
        }

        // Converte encoding se necessário
        if ($encoding !== 'UTF-8') {
            $headers = array_map(function($header) use ($encoding) {
                return mb_convert_encoding($header, 'UTF-8', $encoding);
            }, $headers);
        }

        $headers = array_map('strtolower', $headers);
        $headers = array_map('trim', $headers);

        $totalRecords = 0;
        $successCount = 0;
        $failCount = 0;

        // Processa cada linha
        $lineNumber = 1;
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            $lineNumber++;
            $totalRecords++;

            try {
                // Converte encoding se necessário
                if ($encoding !== 'UTF-8') {
                    $row = array_map(function($value) use ($encoding) {
                        return mb_convert_encoding($value, 'UTF-8', $encoding);
                    }, $row);
                }

                // Pula linhas vazias
                if (empty(array_filter($row))) {
                    continue;
                }

                $data = array_combine($headers, $row);
                $this->processContratoCsv($data, $fileImport);
                $successCount++;
            } catch (\Exception $e) {
                $failCount++;
                \Log::error('Erro ao processar linha CSV', [
                    'file_import_id' => $fileImport->id,
                    'line' => $lineNumber,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        fclose($handle);

        // Atualiza contadores
        $fileImport->update([
            'total_records' => $totalRecords,
            'processed_records' => $totalRecords,
            'successful_records' => $successCount,
            'failed_records' => $failCount,
        ]);
    }

    /**
     * Detecta o encoding do arquivo
     */
    private function detectEncoding(string $filePath): string
    {
        $content = file_get_contents($filePath, false, null, 0, 10000);
        $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        
        return $encoding ?: 'UTF-8';
    }

    /**
     * Processa um contrato individual do CSV
     */
    private function processContratoCsv(array $data, FileImport $fileImport): void
    {
        ContratoImportado::create([
            'file_import_id' => $fileImport->id,
            'numero_contrato' => $this->getValue($data, ['numero', 'numero_contrato', 'nº contrato', 'numero contrato']),
            'objeto' => $this->getValue($data, ['objeto', 'descricao', 'descrição']),
            'contratante' => $this->getValue($data, ['contratante', 'orgao', 'órgão']),
            'contratado' => $this->getValue($data, ['contratado', 'fornecedor', 'empresa']),
            'cnpj_contratado' => $this->getValue($data, ['cnpj', 'cnpj_contratado', 'cnpj contratado']),
            'valor' => $this->parseDecimal($this->getValue($data, ['valor', 'valor_contrato', 'valor contrato'])),
            'data_inicio' => $this->parseDate($this->getValue($data, ['data_inicio', 'inicio', 'vigencia_inicio', 'data inicio'])),
            'data_fim' => $this->parseDate($this->getValue($data, ['data_fim', 'fim', 'vigencia_fim', 'data fim'])),
            'modalidade' => $this->getValue($data, ['modalidade']),
            'status' => $this->getValue($data, ['status', 'situacao', 'situação']),
            'tipo_contrato' => $this->getValue($data, ['tipo', 'tipo_contrato', 'tipo contrato']),
            'secretaria' => $this->getValue($data, ['secretaria', 'unidade']),
            'fonte_recurso' => $this->getValue($data, ['fonte_recurso', 'fonte', 'fonte recurso']),
            'observacoes' => $this->getValue($data, ['observacoes', 'observações', 'obs']),
            'dados_originais' => $data,
        ]);
    }

    /**
     * Obtém valor de um array usando múltiplas possíveis chaves
     */
    private function getValue(array $data, array $possibleKeys): ?string
    {
        foreach ($possibleKeys as $key) {
            if (isset($data[$key]) && !empty($data[$key])) {
                return trim($data[$key]);
            }
        }
        return null;
    }

    /**
     * Converte valor para decimal
     */
    private function parseDecimal($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        // Remove caracteres não numéricos exceto . e ,
        $value = preg_replace('/[^\d,\.]/', '', $value);
        
        // Substitui vírgula por ponto
        $value = str_replace(',', '.', $value);
        
        return (float) $value;
    }

    /**
     * Converte valor para data
     */
    private function parseDate($value): ?string
    {
        if ($value === null || $value === '') {
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

