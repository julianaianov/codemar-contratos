<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ExcelProcessor implements ProcessorInterface
{
    /**
     * Processa arquivo Excel
     */
    public function process(FileImport $fileImport): void
    {
        $filePath = Storage::path($fileImport->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        // Carrega o arquivo Excel
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        
        // Obtém todos os dados
        $rows = $worksheet->toArray();
        
        if (empty($rows)) {
            throw new \Exception('Arquivo Excel vazio');
        }

        // Primeira linha contém cabeçalhos
        $headers = array_shift($rows);
        $headers = array_map('strtolower', $headers);
        $headers = array_map('trim', $headers);

        $totalRecords = count($rows);
        $successCount = 0;
        $failCount = 0;

        // Processa cada linha
        foreach ($rows as $index => $row) {
            try {
                // Pula linhas vazias
                if (empty(array_filter($row))) {
                    continue;
                }

                $data = array_combine($headers, $row);
                $this->processContratoExcel($data, $fileImport);
                $successCount++;
            } catch (\Exception $e) {
                $failCount++;
                \Log::error('Erro ao processar linha Excel', [
                    'file_import_id' => $fileImport->id,
                    'row' => $index + 2, // +2 porque removemos header e índice começa em 0
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
     * Processa um contrato individual do Excel
     */
    private function processContratoExcel(array $data, FileImport $fileImport): void
    {
        ContratoImportado::create([
            'file_import_id' => $fileImport->id,
            'numero_contrato' => $this->getValue($data, ['numero', 'numero_contrato', 'nº contrato']),
            'objeto' => $this->getValue($data, ['objeto', 'descricao']),
            'contratante' => $this->getValue($data, ['contratante', 'orgao']),
            'contratado' => $this->getValue($data, ['contratado', 'fornecedor', 'empresa']),
            'cnpj_contratado' => $this->getValue($data, ['cnpj', 'cnpj_contratado']),
            'valor' => $this->parseDecimal($this->getValue($data, ['valor', 'valor_contrato'])),
            'data_inicio' => $this->parseDate($this->getValue($data, ['data_inicio', 'inicio', 'vigencia_inicio'])),
            'data_fim' => $this->parseDate($this->getValue($data, ['data_fim', 'fim', 'vigencia_fim'])),
            'modalidade' => $this->getValue($data, ['modalidade']),
            'status' => $this->getValue($data, ['status', 'situacao']),
            'tipo_contrato' => $this->getValue($data, ['tipo', 'tipo_contrato']),
            'secretaria' => $this->getValue($data, ['secretaria', 'unidade']),
            'fonte_recurso' => $this->getValue($data, ['fonte_recurso', 'fonte']),
            'observacoes' => $this->getValue($data, ['observacoes', 'obs']),
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

        // Se já é número
        if (is_numeric($value)) {
            return (float) $value;
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
            // Se é número do Excel, converte
            if (is_numeric($value)) {
                $date = Date::excelToDateTimeObject($value);
                return $date->format('Y-m-d');
            }

            // Tenta parsear como string
            $date = \Carbon\Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}

