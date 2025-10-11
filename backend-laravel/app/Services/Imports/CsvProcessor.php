<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CsvProcessor implements ProcessorInterface
{
    private ?string $diretoria = null;

    public function setDiretoria(string $diretoria): void
    {
        $this->diretoria = $diretoria;
    }
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
            // Campos estendidos / sinônimos
            'ano_numero' => $this->getValue($data, ['ano-nº','ano_numero','ano_numero_contrato','ano-numero']),
            'numero_contrato' => $this->getValue($data, ['contrato','numero','numero_contrato','nº contrato','numero contrato']),
            'ano' => $this->parseInteger($this->getValue($data, ['ano','ano_contrato'])),
            'pa' => $this->getValue($data, ['P.A','pa','p.a','processo_administrativo','processo']),
            'diretoria' => $this->getValue($data, ['DIRETORIA REQUISITANTE','diretoria_requisitante','DIRETORIA','diretoria','secretaria','unidade']) ?: $this->diretoria,
            'modalidade' => $this->getValue($data, ['MODALIDADE','modalidade','modalidade_licitacao']),
            'nome_empresa' => $this->getValue($data, ['NOME DA EMPRESA','nome_empresa','empresa','contratado','fornecedor','razao_social']),
            'cnpj_empresa' => $this->getValue($data, ['CNPJ DA EMPRESA','cnpj_empresa','cnpj','cnpj_contratado']),
            'objeto' => $this->getValue($data, ['OBJETO','objeto','descricao','descrição','objeto_contrato']),
            'data_assinatura' => $this->parseDate($this->getValue($data, ['DATA DA ASSINATURA','data_assinatura','assinatura','data_contrato'])),
            'prazo' => $this->parseInteger($this->getValue($data, ['PRAZO','prazo','prazo_contrato','duracao'])),
            'unidade_prazo' => $this->getValue($data, ['UNID. PRAZO','unidade_prazo','unid_prazo','unidade','periodo']),
            'valor_contrato' => $this->parseDecimal($this->getValue($data, ['VALOR DO CONTRATO','valor_contrato','valor','valor_total'])),
            'vencimento' => $this->parseDate($this->getValue($data, ['VENCIMENTO','vencimento','data_vencimento','data_fim','vigencia_fim'])),
            'gestor_contrato' => $this->getValue($data, ['GESTOR DO CONTRATO','gestor_contrato','gestor','responsavel']),
            'fiscal_tecnico' => $this->getValue($data, ['FISCAL TÉCNICO','fiscal_tecnico']),
            'fiscal_administrativo' => $this->getValue($data, ['FISCAL ADMINISTRATIVO','fiscal_administrativo','fiscal_admin']),
            'suplente' => $this->getValue($data, ['SUPLENTE','suplente','substituto']),
            // Legados/compatibilidade
            'contratante' => $this->getValue($data, ['contratante','orgao','órgão']),
            'contratado' => $this->getValue($data, ['contratado','fornecedor','empresa','nome_empresa','razao_social']) ?: $this->getValue($data, ['nome_empresa']),
            'cnpj_contratado' => $this->getValue($data, ['cnpj','cnpj_contratado','cnpj contratado','cnpj_empresa']),
            'valor' => $this->parseDecimal($this->getValue($data, ['valor','valor_contrato','valor contrato','valor_total'])),
            'data_inicio' => $this->parseDate($this->getValue($data, ['data_inicio','inicio','vigencia_inicio','data inicio','data_assinatura'])),
            'data_fim' => $this->parseDate($this->getValue($data, ['data_fim','fim','vigencia_fim','data fim','vencimento'])),
            'status' => $this->getValue($data, ['STATUS','status','situacao','situação']) ?: 'vigente',
            'tipo_contrato' => $this->getValue($data, ['tipo', 'tipo_contrato', 'tipo contrato']),
            // SECRETARIA = DIRETORIA (mantém compatibilidade com consultas antigas)
            'secretaria' => $this->getValue($data, ['DIRETORIA REQUISITANTE','diretoria_requisitante','DIRETORIA','diretoria','secretaria','unidade']) ?: $this->diretoria,
            'fonte_recurso' => $this->getValue($data, ['fonte_recurso', 'fonte', 'fonte recurso']),
            'observacoes' => $this->getValue($data, ['OBSERVAÇÕES','observacoes','observações','obs']),
            'dados_originais' => $data,
        ]);
    }

    /**
     * Obtém valor de um array usando múltiplas possíveis chaves
     */
    private function getValue(array $data, array $possibleKeys): ?string
    {
        // Normaliza cabeçalhos e chaves de busca para tolerar acentos, pontuação e variações
        $normalized = [];
        foreach ($data as $k => $v) {
            $normalized[$this->normalizeKey($k)] = $v;
        }
        foreach ($possibleKeys as $key) {
            $nk = $this->normalizeKey($key);
            if (isset($normalized[$nk]) && $normalized[$nk] !== '') {
                return is_string($normalized[$nk]) ? trim($normalized[$nk]) : $normalized[$nk];
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

    /**
     * Normaliza chave: minúsculas, sem acentos, remove pontuação e colapsa espaços
     */
    private function normalizeKey(string $key): string
    {
        $key = Str::ascii(Str::lower(trim($key)));
        $key = str_replace(['.', ',', ';', ':', '\\', '/', '-', '–', '—', '_'], ' ', $key);
        $key = preg_replace('/\s+/', ' ', $key);
        return $key;
    }

    /**
     * Converte valor para inteiro
     */
    private function parseInteger($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        $value = preg_replace('/[^\d]/', '', $value);
        return $value !== '' ? (int)$value : null;
    }
}

