<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class PdfProcessor implements ProcessorInterface
{
    /**
     * Processa arquivo PDF
     */
    public function process(FileImport $fileImport): void
    {
        $filePath = Storage::path($fileImport->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        // Parse do PDF
        $parser = new PdfParser();
        
        try {
            $pdf = $parser->parseFile($filePath);
        } catch (\Exception $e) {
            throw new \Exception('Erro ao carregar arquivo PDF: ' . $e->getMessage());
        }

        // Extrai texto do PDF
        $text = $pdf->getText();
        
        if (empty($text)) {
            // Se não conseguiu extrair texto, tenta OCR
            \Log::info('PDF sem texto detectado, tentando OCR', ['file_import_id' => $fileImport->id]);
            
            try {
                $ocrProcessor = new PdfOcrProcessor();
                $ocrProcessor->process($fileImport);
                return; // OCR processou com sucesso, sai da função
            } catch (\Exception $e) {
                \Log::error('OCR também falhou', [
                    'file_import_id' => $fileImport->id,
                    'error' => $e->getMessage(),
                ]);
                throw new \Exception('Não foi possível extrair texto do PDF nem via OCR. Verifique a qualidade da imagem.');
            }
        }

        // Conta total de registros
        $totalRecords = 1; // Assume 1 contrato por PDF
        $successCount = 0;
        $failCount = 0;

        try {
            $this->processContratoPdf($text, $fileImport);
            $successCount++;
        } catch (\Exception $e) {
            $failCount++;
            \Log::error('Erro ao processar contrato PDF', [
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
    }

    /**
     * Processa um contrato extraído do PDF
     */
    private function processContratoPdf(string $text, FileImport $fileImport): void
    {
        // Extrai dados do texto usando regex
        $dados = $this->extractData($text);
        
        ContratoImportado::create([
            'file_import_id' => $fileImport->id,
            'numero_contrato' => $dados['numero_contrato'],
            'objeto' => $dados['objeto'],
            'contratante' => $dados['contratante'],
            'contratado' => $dados['contratado'],
            'cnpj_contratado' => $dados['cnpj_contratado'],
            'valor' => $dados['valor'],
            'data_inicio' => $dados['data_inicio'],
            'data_fim' => $dados['data_fim'],
            'modalidade' => $dados['modalidade'],
            'status' => $dados['status'],
            'tipo_contrato' => $dados['tipo_contrato'],
            'secretaria' => $dados['secretaria'],
            'fonte_recurso' => $dados['fonte_recurso'],
            'observacoes' => $dados['observacoes'],
            'pdf_path' => $fileImport->file_path, // Armazena caminho do PDF original
            'dados_originais' => ['texto_extraido' => substr($text, 0, 5000)], // Primeiros 5000 chars
        ]);
    }

    /**
     * Extrai dados estruturados do texto do PDF
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
            'status' => 'vigente', // Status padrão
            'tipo_contrato' => $this->extractTipoContrato($text),
            'secretaria' => $this->extractSecretaria($text),
            'fonte_recurso' => $this->extractFonteRecurso($text),
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
            '/n[úu]mero\s*(?:do\s*)?contrato[:\s]+([^\n]{1,50})/i',
            '/contrato\s*n[°º]?\s*[:\s]*([0-9\/\-\.]+)/i',
            '/n[°º]\s*([0-9\/\-\.]+)/i',
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
            '/objeto[:\s]+([^\n]{10,500})/i',
            '/objeto\s*do\s*contrato[:\s]+([^\n]{10,500})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1]);
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
            '/munic[íi]pio\s*de\s*([^\n]{5,100})/i',
            '/prefeitura\s*municipal\s*de\s*([^\n]{5,100})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1]);
            }
        }

        return 'Prefeitura Municipal'; // Valor padrão
    }

    /**
     * Extrai contratado
     */
    private function extractContratado(string $text): ?string
    {
        $patterns = [
            '/contratad[ao][:\s]+([^\n]{5,200})/i',
            '/empresa[:\s]+([^\n]{5,200})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $contratado = trim($matches[1]);
                // Remove CNPJ do nome se presente
                $contratado = preg_replace('/\s*-?\s*cnpj.*$/i', '', $contratado);
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
        // Padrão de CNPJ: XX.XXX.XXX/XXXX-XX ou variações
        $pattern = '/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})/';
        
        if (preg_match($pattern, $text, $matches)) {
            // Formata CNPJ
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
     * Extrai data de início
     */
    private function extractDataInicio(string $text): ?string
    {
        $patterns = [
            '/data\s*(?:de\s*)?in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/vig[êe]ncia[:\s]*(?:de\s*)?([\d\/\-\.]+)/i',
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
     * Converte string para decimal
     */
    private function parseDecimal(?string $value): ?float
    {
        if (empty($value)) {
            return null;
        }

        // Remove caracteres não numéricos exceto . e ,
        $value = preg_replace('/[^\d,\.]/', '', $value);
        
        // Trata formato brasileiro (1.234.567,89)
        if (strpos($value, ',') !== false && strpos($value, '.') !== false) {
            // Se tem ambos, remove pontos (milhares) e substitui vírgula por ponto
            $value = str_replace('.', '', $value);
            $value = str_replace(',', '.', $value);
        } else if (strpos($value, ',') !== false) {
            // Só tem vírgula, substitui por ponto
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

        // Remove espaços
        $value = trim($value);

        try {
            // Tenta vários formatos de data
            $formats = ['d/m/Y', 'd-m-Y', 'd.m.Y', 'Y-m-d', 'Y/m/d'];
            
            foreach ($formats as $format) {
                $date = \DateTime::createFromFormat($format, $value);
                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            }
            
            // Tenta parse genérico
            $date = \Carbon\Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}


