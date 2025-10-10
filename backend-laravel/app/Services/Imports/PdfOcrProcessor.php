<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;
use Spatie\PdfToImage\Pdf;

class PdfOcrProcessor implements ProcessorInterface
{
    /**
     * Processa arquivo PDF escaneado usando Python OCR
     */
    public function process(FileImport $fileImport): void
    {
        $filePath = Storage::path($fileImport->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        try {
            // Usa script Python para extração
            $data = $this->extractWithPython($filePath);
            
            if (isset($data['error'])) {
                throw new \Exception('Erro na extração Python: ' . $data['error']);
            }

            // Conta total de registros
            $totalRecords = 1; // Assume 1 contrato por PDF
            $successCount = 0;
            $failCount = 0;

            try {
                $this->processContratoPdf($data, $fileImport);
                $successCount++;
            } catch (\Exception $e) {
                $failCount++;
                \Log::error('Erro ao processar contrato PDF via Python', [
                    'file_import_id' => $fileImport->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Atualiza contadores
            $fileImport->update([
                'total_records' => $totalRecords,
                'processed_records' => $totalRecords,
                'successful_records' => $successCount,
                'failed_records' => $failCount,
            ]);

        } catch (\Exception $e) {
            throw new \Exception('Erro ao processar PDF escaneado: ' . $e->getMessage());
        }
    }

    /**
     * Extrai dados usando script Python
     */
    private function extractWithPython(string $filePath): array
    {
        $scriptPath = base_path('scripts/minimal_extractor.py');
        $venvPath = base_path('venv/bin/python3');
        
        if (!file_exists($scriptPath)) {
            throw new \Exception('Script Python não encontrado: ' . $scriptPath);
        }
        
        if (!file_exists($venvPath)) {
            throw new \Exception('Ambiente virtual Python não encontrado: ' . $venvPath);
        }
        
        // Executa o script Python com timeout
        $command = sprintf(
            'timeout 30 %s %s "%s" 2>&1',
            $venvPath,
            $scriptPath,
            $filePath
        );
        
        $output = shell_exec($command);
        
        if (empty($output)) {
            throw new \Exception('Script Python não retornou dados ou travou');
        }
        
        $data = json_decode($output, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Erro ao decodificar JSON do Python: ' . json_last_error_msg() . ' - Output: ' . $output);
        }
        
        return $data;
    }

    /**
     * Executa OCR na imagem usando Tesseract
     */
    private function performOcr(string $imagePath): string
    {
        // Comando Tesseract para OCR em português
        $outputPath = str_replace('.png', '_ocr', $imagePath);
        
        // Executa OCR
        $command = sprintf(
            'tesseract "%s" "%s" -l por --psm 6 2>/dev/null',
            $imagePath,
            $outputPath
        );
        
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new \Exception('Erro ao executar OCR: ' . implode("\n", $output));
        }
        
        // Lê o resultado do OCR
        $textFile = $outputPath . '.txt';
        if (!file_exists($textFile)) {
            throw new \Exception('Arquivo de texto OCR não foi criado');
        }
        
        $text = file_get_contents($textFile);
        
        // Remove arquivo temporário do OCR
        unlink($textFile);
        
        return $text;
    }

    /**
     * Processa um contrato extraído via Python
     */
    private function processContratoPdf(array $data, FileImport $fileImport): void
    {
        ContratoImportado::create([
            'file_import_id' => $fileImport->id,
            'numero_contrato' => $data['numero_contrato'] ?? null,
            'objeto' => $data['objeto'] ?? null,
            'contratante' => $data['contratante'] ?? null,
            'contratado' => $data['contratado'] ?? null,
            'cnpj_contratado' => $data['cnpj_contratado'] ?? null,
            'valor' => $data['valor'] ?? null,
            'data_inicio' => $data['data_inicio'] ?? null,
            'data_fim' => $data['data_fim'] ?? null,
            'modalidade' => $data['modalidade'] ?? null,
            'status' => $data['status'] ?? 'vigente',
            'tipo_contrato' => $data['tipo_contrato'] ?? null,
            'secretaria' => $data['secretaria'] ?? 'Diretoria de Administração',
            'fonte_recurso' => $data['fonte_recurso'] ?? null,
            'observacoes' => $data['observacoes'] ?? null,
            'pdf_path' => $fileImport->file_path,
            'dados_originais' => [
                'texto_extraido' => $data['texto_extraido'] ?? '',
                'metodo' => $data['metodo'] ?? 'Python',
                'previsao_legal' => $data['previsao_legal'] ?? null,
                'data_final_documento' => $data['data_final_documento'] ?? null,
            ],
        ]);
    }

    /**
     * Extrai dados estruturados do texto OCR (reutiliza lógica do PdfProcessor)
     */
    private function extractData(string $text): array
    {
        // Normaliza o texto
        $text = $this->normalizeText($text);
        
        return [
            'numero_contrato' => $this->extractNumeroContrato($text),
            'objeto' => $this->extractObjeto($text),
            'contratante' => $this->extractContratante($text),
            'contratado' => $this->extractContratado($text),
            'cnpj_contratado' => $this->extractCNPJ($text),
            'valor' => $this->extractValor($text),
            'data_inicio' => $this->extractDataInicio($text),
            'data_fim' => $this->extractDataFim($text),
            'modalidade' => $this->extractModalidade($text),
            'status' => 'vigente',
            'tipo_contrato' => $this->extractTipoContrato($text),
            'secretaria' => $this->extractSecretaria($text),
            'fonte_recurso' => $this->extractFonteRecurso($text),
            'previsao_legal' => $this->extractPrevisaoLegal($text),
            'data_final_documento' => $this->extractDataFinalDocumento($text),
            'observacoes' => null,
        ];
    }

    /**
     * Normaliza texto para facilitar extração
     */
    private function normalizeText(string $text): string
    {
        // Remove quebras de linha excessivas
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        
        // Remove espaços múltiplos
        $text = preg_replace('/[ \t]+/', ' ', $text);
        
        return trim($text);
    }

    /**
     * Extrai número do contrato
     */
    private function extractNumeroContrato(string $text): ?string
    {
        $patterns = [
            '/n[°º]\s*([0-9\/\-\.]+)/i',
            '/contrato\s*n[°º]?\s*[:\s]*([0-9\/\-\.]+)/i',
            '/n[úu]mero\s*(?:do\s*)?contrato[:\s]+([^\n]{1,50})/i',
            '/termo\s*de\s*contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }

    /**
     * Extrai objeto do contrato
     */
    private function extractObjeto(string $text): ?string
    {
        $patterns = [
            '/objeto[:\s]+([^\n]{10,800})/i',
            '/objeto\s*do\s*contrato[:\s]+([^\n]{10,800})/i',
            '/1[°º]\s*uso\s*da\s*ata[^\n]{10,800}/i',
            '/contrata[çc][ãa]o\s*de\s*empresa[^\n]{10,800}/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $objeto = trim($matches[0] ?? $matches[1]);
                // Limita o tamanho do objeto
                if (strlen($objeto) > 500) {
                    $objeto = substr($objeto, 0, 500) . '...';
                }
                return $objeto;
            }
        }

        return null;
    }

    /**
     * Extrai contratante
     */
    private function extractContratante(string $text): ?string
    {
        $patterns = [
            '/contratante[:\s]+([^\n]{5,200})/i',
            '/companhia\s*de\s*desenvolvimento\s*de\s*maric[áa][^\n]{5,100}/i',
            '/codemar[^\n]{5,100}/i',
            '/munic[íi]pio\s*de\s*([^\n]{5,100})/i',
            '/prefeitura\s*municipal\s*de\s*([^\n]{5,100})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $contratante = trim($matches[0] ?? $matches[1]);
                // Limita o tamanho
                if (strlen($contratante) > 200) {
                    $contratante = substr($contratante, 0, 200);
                }
                return $contratante;
            }
        }

        return 'Companhia de Desenvolvimento de Maricá - CODEMAR';
    }

    /**
     * Extrai contratado
     */
    private function extractContratado(string $text): ?string
    {
        $patterns = [
            '/contratad[ao][:\s]+([^\n]{5,200})/i',
            '/destaq\s*com[ée]rcio\s*e\s*servi[çc]os[^\n]{5,100}/i',
            '/empresa[:\s]+([^\n]{5,200})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $contratado = trim($matches[0] ?? $matches[1]);
                $contratado = preg_replace('/\s*-?\s*cnpj.*$/i', '', $contratado);
                // Limita o tamanho
                if (strlen($contratado) > 200) {
                    $contratado = substr($contratado, 0, 200);
                }
                return trim($contratado);
            }
        }

        return null;
    }

    /**
     * Extrai CNPJ
     */
    private function extractCNPJ(string $text): ?string
    {
        $pattern = '/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})/';
        
        if (preg_match($pattern, $text, $matches)) {
            $cnpj = preg_replace('/[^\d]/', '', $matches[1]);
            if (strlen($cnpj) === 14) {
                return sprintf('%s.%s.%s/%s-%s',
                    substr($cnpj, 0, 2),
                    substr($cnpj, 2, 3),
                    substr($cnpj, 5, 3),
                    substr($cnpj, 8, 4),
                    substr($cnpj, 12, 2)
                );
            }
        }

        return null;
    }

    /**
     * Extrai valor do contrato
     */
    private function extractValor(string $text): ?float
    {
        $patterns = [
            '/valor\s*(?:global|total)?[:\s]*r\$?\s*([\d\.,]+)/i',
            '/valor\s*do\s*contrato[:\s]*r\$?\s*([\d\.,]+)/i',
            '/d[áa]-se\s*a\s*este\s*contrato\s*o\s*valor\s*total\s*de\s*r\$\s*([\d\.,]+)/i',
            '/r\$\s*([\d\.,]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return $this->parseDecimal($matches[1]);
            }
        }

        return null;
    }

    /**
     * Extrai data de início (CONTRADATA)
     */
    private function extractDataInicio(string $text): ?string
    {
        $patterns = [
            '/data\s*do\s*in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/data\s*(?:de\s*)?in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/vig[êe]ncia[:\s]*(?:de\s*)?([\d\/\-\.]+)/i',
            '/contrdata[:\s]*([\d\/\-\.]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return $this->parseDate($matches[1]);
            }
        }

        return null;
    }

    /**
     * Extrai data de fim/término
     */
    private function extractDataFim(string $text): ?string
    {
        $patterns = [
            '/data\s*(?:de\s*)?t[ée]rmino[:\s]*([\d\/\-\.]+)/i',
            '/data\s*(?:de\s*)?fim[:\s]*([\d\/\-\.]+)/i',
            '/t[ée]rmino[:\s]*([\d\/\-\.]+)/i',
            '/at[ée][:\s]*([\d\/\-\.]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return $this->parseDate($matches[1]);
            }
        }

        return null;
    }

    /**
     * Extrai data final do documento (data das assinaturas)
     */
    private function extractDataFinalDocumento(string $text): ?string
    {
        $patterns = [
            '/maric[áa],\s*([\d\s]+de\s+[a-zç]+de\s+[\d]+)/i',
            '/([\d]+\s+de\s+[a-zç]+de\s+[\d]+)/i',
            '/data[:\s]*([\d\/\-\.]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return $this->parseDate($matches[1]);
            }
        }

        return null;
    }

    /**
     * Extrai modalidade
     */
    private function extractModalidade(string $text): ?string
    {
        $modalidades = [
            'Pregão Eletrônico',
            'Pregão Presencial',
            'Concorrência',
            'Tomada de Preços',
            'Convite',
            'Dispensa',
            'Inexigibilidade',
        ];

        foreach ($modalidades as $modalidade) {
            if (stripos($text, $modalidade) !== false) {
                return $modalidade;
            }
        }

        return null;
    }

    /**
     * Extrai tipo de contrato
     */
    private function extractTipoContrato(string $text): ?string
    {
        $tipos = [
            'Prestação de Serviços' => ['prestação de serviços', 'serviços'],
            'Fornecimento' => ['fornecimento', 'aquisição'],
            'Obra' => ['obra', 'construção'],
            'Compra' => ['compra', 'aquisição'],
        ];

        foreach ($tipos as $tipo => $palavrasChave) {
            foreach ($palavrasChave as $palavra) {
                if (stripos($text, $palavra) !== false) {
                    return $tipo;
                }
            }
        }

        return null;
    }

    /**
     * Extrai secretaria/diretoria
     */
    private function extractSecretaria(string $text): ?string
    {
        $patterns = [
            '/secretaria\s*(?:de|municipal\s*de)?\s*([^\n]{5,100})/i',
            '/diretoria\s*(?:de)?\s*([^\n]{5,100})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }

    /**
     * Extrai fonte de recurso
     */
    private function extractFonteRecurso(string $text): ?string
    {
        $patterns = [
            '/fonte\s*(?:de\s*)?recurso[s]?[:\s]*([^\n]{5,100})/i',
            '/recursos?\s*(?:pr[óo]prios?|federais?|estaduais?)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[0]);
            }
        }

        return null;
    }

    /**
     * Extrai previsão legal
     */
    private function extractPrevisaoLegal(string $text): ?string
    {
        $patterns = [
            '/previs[ãa]o\s*legal[:\s]*([^\n]{10,200})/i',
            '/lei\s*n[°º]?\s*13\.303[^\n]{10,200}/i',
            '/procedimento\s*licitat[óo]rio[^\n]{10,200}/i',
            '/processo\s*administrativo[^\n]{10,200}/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $previsao = trim($matches[0] ?? $matches[1]);
                // Limita o tamanho
                if (strlen($previsao) > 200) {
                    $previsao = substr($previsao, 0, 200) . '...';
                }
                return $previsao;
            }
        }

        return null;
    }

    /**
     * Converte string para decimal
     */
    private function parseDecimal(?string $value): ?float
    {
        if (empty($value)) {
            return null;
        }

        $value = preg_replace('/[^\d,\.]/', '', $value);
        
        if (strpos($value, ',') !== false && strpos($value, '.') !== false) {
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);
        } else if (strpos($value, ',') !== false) {
            $value = str_replace(',', '.', $value);
        }
        
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

        $value = trim($value);

        try {
            // Mapeia meses em português
            $meses = [
                'janeiro' => '01', 'fevereiro' => '02', 'março' => '03', 'abril' => '04',
                'maio' => '05', 'junho' => '06', 'julho' => '07', 'agosto' => '08',
                'setembro' => '09', 'outubro' => '10', 'novembro' => '11', 'dezembro' => '12'
            ];

            // Converte datas em português (ex: "24 de outubro de 2023")
            foreach ($meses as $mes => $numero) {
                if (preg_match('/(\d+)\s+de\s+' . $mes . '\s+de\s+(\d{4})/i', $value, $matches)) {
                    return sprintf('%s-%s-%02d', $matches[2], $numero, (int)$matches[1]);
                }
            }

            // Tenta formatos padrão
            $formats = ['d/m/Y', 'd-m-Y', 'd.m.Y', 'Y-m-d', 'Y/m/d'];
            
            foreach ($formats as $format) {
                $date = \DateTime::createFromFormat($format, $value);
                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            }
            
            $date = \Carbon\Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}
