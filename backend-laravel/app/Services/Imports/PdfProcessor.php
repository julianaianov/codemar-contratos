<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class PdfProcessor implements ProcessorInterface
{
    private ?string $diretoria = null;

    /**
     * Define a diretoria para o processamento
     */
    public function setDiretoria(string $diretoria): void
    {
        $this->diretoria = $diretoria;
    }

    /**
     * Extrai texto do PDF usando múltiplas abordagens para melhor qualidade
     */
    private function extractTextFromPdf(string $filePath): string
    {
        $text = '';
        
        // Método 1: Tenta com smalot/pdfparser (método original)
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            $text = $pdf->getText();
            
            // Se o texto não está corrompido, usa ele
            if (!empty($text) && !$this->isTextCorrupted($text)) {
                \Log::info('Texto extraído com sucesso usando smalot/pdfparser');
                return $text;
            }
        } catch (\Exception $e) {
            \Log::warning('Erro ao extrair texto com smalot/pdfparser: ' . $e->getMessage());
        }
        
        // Método 2: Tenta com pdftotext (se disponível)
        try {
            $text = $this->extractWithPdftotext($filePath);
            if (!empty($text) && !$this->isTextCorrupted($text)) {
                \Log::info('Texto extraído com sucesso usando pdftotext');
                return $text;
            }
        } catch (\Exception $e) {
            \Log::warning('Erro ao extrair texto com pdftotext: ' . $e->getMessage());
        }
        
        // Método 3: Tenta com pdf2txt (se disponível)
        try {
            $text = $this->extractWithPdf2txt($filePath);
            if (!empty($text) && !$this->isTextCorrupted($text)) {
                \Log::info('Texto extraído com sucesso usando pdf2txt');
                return $text;
            }
        } catch (\Exception $e) {
            \Log::warning('Erro ao extrair texto com pdf2txt: ' . $e->getMessage());
        }
        
        // Se chegou aqui, retorna o texto original (mesmo que corrompido)
        return $text;
    }

    /**
     * Verifica se o texto está corrompido
     */
    private function isTextCorrupted(string $text): bool
    {
        // Se o texto está muito curto, considera corrompido
        if (strlen(trim($text)) < 100) {
            return true;
        }
        
        // Verifica padrões de texto corrompido
        $corruptionPatterns = [
            '/o = E/',
            '/Data do Inigio/',
            '/TARVE»\. na/',
            '/SPCODEMAR AA \| urna um/',
            '/MARICÁ DESENVOLVIMENTO ECT e de, dr apEo POA: E/',
            '/Dom l — OBIETO: O E/',
            '/asilos -/',
            '/\/ N ERES %/',
            '/\f\f\f\f\f\f\f\f\f\f\f\f\f\f\f\f\f\f/', // Caracteres de controle
            '/^[\s\f]*$/', // Apenas espaços e caracteres de controle
        ];
        
        foreach ($corruptionPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }
        
        // Verifica se tem muitos caracteres de controle
        $controlChars = substr_count($text, "\f");
        if ($controlChars > 10) {
            return true;
        }
        
        return false;
    }

    /**
     * Extrai texto usando pdftotext (ferramenta do sistema)
     */
    private function extractWithPdftotext(string $filePath): string
    {
        $outputFile = tempnam(sys_get_temp_dir(), 'pdf_text_');
        
        // Comando pdftotext
        $command = sprintf('pdftotext "%s" "%s" 2>/dev/null', $filePath, $outputFile);
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0 || !file_exists($outputFile)) {
            throw new \Exception('pdftotext falhou');
        }
        
        $text = file_get_contents($outputFile);
        unlink($outputFile);
        
        return $text;
    }

    /**
     * Extrai texto usando pdf2txt (ferramenta do sistema)
     */
    private function extractWithPdf2txt(string $filePath): string
    {
        // Comando pdf2txt
        $command = sprintf('pdf2txt "%s" 2>/dev/null', $filePath);
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new \Exception('pdf2txt falhou');
        }
        
        return implode("\n", $output);
    }

    /**
     * Processa arquivo PDF
     */
    public function process(FileImport $fileImport): void
    {
        $filePath = Storage::path($fileImport->file_path);
        
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        // **MELHOR EXTRAÇÃO DE TEXTO PARA PDFs BEM ESCANEADOS**
        
        // Tenta extrair texto usando múltiplas abordagens
        $text = $this->extractTextFromPdf($filePath);
        
        if (empty($text) || $this->isTextCorrupted($text)) {
            // Se não conseguiu extrair texto ou está corrompido, tenta OCR
            \Log::info('PDF sem texto ou texto corrompido detectado, tentando OCR', ['file_import_id' => $fileImport->id]);
            
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
        
        // **SOLUÇÃO ROBUSTA PARA TEXTO CORROMPIDO**
        
        // 1. SEMPRE usa a diretoria selecionada
        $dados['secretaria'] = $this->diretoria ?: 'Diretoria não especificada';
        
        // 2. Garante contratante padrão
        $dados['contratante'] = $dados['contratante'] ?: 'Prefeitura Municipal';
        
        // 3. Tenta extrair valor de qualquer forma
        if (empty($dados['valor']) || $dados['valor'] == 0) {
            $dados['valor'] = $this->extractAnyValue($text);
        }
        
        // 4. Tenta extrair datas de qualquer forma
        if (empty($dados['data_inicio'])) {
            $dados['data_inicio'] = $this->extractAnyDate($text);
        }
        
        if (empty($dados['data_fim'])) {
            $dados['data_fim'] = $this->extractAnyDate($text, true);
        }
        
        // 5. Garante objeto mínimo
        if (empty($dados['objeto'])) {
            $dados['objeto'] = 'Contrato importado via PDF';
        }
        
        // 6. Tenta extrair número do contrato de qualquer forma
        if (empty($dados['numero_contrato'])) {
            $dados['numero_contrato'] = $this->extractAnyContractNumber($text);
        }
        
        // 7. Tenta extrair contratado de qualquer forma
        if (empty($dados['contratado']) || $dados['contratado'] == 'o = E') {
            $dados['contratado'] = $this->extractAnyContractor($text);
        }
        
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
        
        // Corrige caracteres corrompidos comuns
        $text = $this->fixCorruptedText($text);
        
        return trim($text);
    }

    /**
     * Corrige texto corrompido comum em PDFs
     */
    private function fixCorruptedText(string $text): string
    {
        // Corrige caracteres corrompidos comuns
        $corrections = [
            '/Data do Inigio/i' => 'Data do Início',
            '/Inigio/i' => 'Início',
            '/TARVE»\. na/i' => '',
            '/SPCODEMAR AA \| urna um/i' => '',
            '/MARICÁ DESENVOLVIMENTO ECT e de, dr apEo POA: E/i' => '',
            '/O TERMODECONTRATO uns/i' => 'TERMO DE CONTRATO Nº',
            '/Dom l — OBIETO: O E/i' => 'OBJETO:',
            '/o = E/i' => '',
            '/asilos -/i' => '',
            '/\/ N ERES %/i' => '',
        ];

        foreach ($corrections as $pattern => $replacement) {
            $text = preg_replace($pattern, $replacement, $text);
        }

        // Remove linhas muito curtas ou com caracteres estranhos
        $lines = explode("\n", $text);
        $cleanLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            // Pula linhas muito curtas ou com caracteres estranhos
            if (strlen($line) < 3 || preg_match('/^[^a-zA-Z0-9\s]+$/', $line)) {
                continue;
            }
            $cleanLines[] = $line;
        }
        
        return implode("\n", $cleanLines);
    }

    /**
     * Extrai número do contrato
     */
    private function extractNumeroContrato(string $text): ?string
    {
        $patterns = [
            '/contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/n[°º]\s*([0-9\/\-\.]+)/i',
            '/n[úu]mero\s*(?:do\s*)?contrato[:\s]+([^\n]{1,50})/i',
            '/contrato\s*de\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/termo\s*de\s*contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/processo\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/n[°º]\s*([0-9\/\-\.]+)/i',
            '/contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/n[°º]\s*([0-9\/\-\.]+)/i',
            // Padrões mais flexíveis para texto corrompido
            '/n[°º]?\s*([0-9\/\-\.]+)/i',
            '/contrato\s*([0-9\/\-\.]+)/i',
            '/processo\s*([0-9\/\-\.]+)/i',
            // Padrões mais específicos
            '/termo\s*de\s*contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/contrato\s*n[°º]?\s*([0-9\/\-\.]+)/i',
            '/n[°º]\s*([0-9\/\-\.]+)/i',
            // Padrões sem caracteres especiais
            '/contrato\s*([0-9\/\-\.]+)/i',
            '/termo\s*([0-9\/\-\.]+)/i',
            '/processo\s*([0-9\/\-\.]+)/i',
            // Padrões mais específicos para "TERMO DE CONTRATO"
            '/termo\s*de\s*contrato\s*([0-9\/\-\.]+)/i',
            '/contrato\s*([0-9\/\-\.]+)/i',
            '/termo\s*([0-9\/\-\.]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $numero = trim($matches[1]);
                // Limpa caracteres extras mas mantém números, barras, hífens e pontos
                $numero = preg_replace('/[^\d\/\-\.]/', '', $numero);
                if (!empty($numero) && strlen($numero) >= 3) {
                    return $numero;
                }
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
            '/objeto[:\s]+([^\.]{10,500})/i',
            '/contrata[çc][ãa]o\s*de\s*([^\.]{10,500})/i',
            '/presta[çc][ãa]o\s*de\s*([^\.]{10,500})/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $objeto = trim($matches[1]);
                // Remove quebras de linha e espaços excessivos
                $objeto = preg_replace('/\s+/', ' ', $objeto);
                // Limita o tamanho
                if (strlen($objeto) > 500) {
                    $objeto = substr($objeto, 0, 500) . '...';
                }
                if (!empty($objeto)) {
                    return $objeto;
                }
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
            // Padrões específicos com dois pontos
            '/contratad[ao][:\s]+([^\n]{5,200})/i',
            '/empresa[:\s]+([^\n]{5,200})/i',
            '/executora[:\s]+([^\n]{5,200})/i',
            '/fornecedor[:\s]+([^\n]{5,200})/i',
            '/prestador[:\s]+([^\n]{5,200})/i',
            '/concession[áa]ria[:\s]+([^\n]{5,200})/i',
            '/licitante[:\s]+([^\n]{5,200})/i',
            '/vencedor[:\s]+([^\n]{5,200})/i',
            // Padrões sem dois pontos
            '/contratad[ao]\s+([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            '/empresa\s+([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            '/executora\s+([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            '/fornecedor\s+([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            '/prestador\s+([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            // Padrões mais genéricos
            '/([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $contratado = trim($matches[1]);
                // Remove CNPJ do nome se presente
                $contratado = preg_replace('/\s*-?\s*cnpj.*$/i', '', $contratado);
                // Remove caracteres especiais no final
                $contratado = preg_replace('/[^\w\s\.\-]+$/', '', $contratado);
                $contratado = trim($contratado);
                // Verifica se o nome tem tamanho razoável
                if (!empty($contratado) && strlen($contratado) >= 5 && strlen($contratado) <= 200) {
                    return $contratado;
                }
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
            // Padrões específicos com R$
            '/valor\s*(?:global|total|do\s*contrato)?[:\s]*r\$?\s*([\d\.,]+)/i',
            '/valor\s*do\s*contrato[:\s]*r\$?\s*([\d\.,]+)/i',
            '/r\$\s*([\d\.,]+)/i',
            '/total[:\s]*r\$?\s*([\d\.,]+)/i',
            '/montante[:\s]*r\$?\s*([\d\.,]+)/i',
            '/preço[:\s]*r\$?\s*([\d\.,]+)/i',
            '/custo[:\s]*r\$?\s*([\d\.,]+)/i',
            // Padrões sem R$ mas com contexto
            '/valor[:\s]*([\d\.,]+)/i',
            '/total[:\s]*([\d\.,]+)/i',
            '/montante[:\s]*([\d\.,]+)/i',
            '/preço[:\s]*([\d\.,]+)/i',
            '/custo[:\s]*([\d\.,]+)/i',
            // Padrões mais flexíveis para texto corrompido
            '/r\$?\s*([\d\.,]+)/i',
            '/valor[:\s]*([\d\.,]+)/i',
            '/total[:\s]*([\d\.,]+)/i',
            // Procura por qualquer valor monetário no texto (formato brasileiro)
            '/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/',
            // Procura por valores simples
            '/(\d+(?:,\d{2})?)/',
        ];

        $valores = [];
        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches)) {
                foreach ($matches[1] as $match) {
                    $valor = $this->parseDecimal($match);
                    if ($valor !== null && $valor > 0) {
                        $valores[] = $valor;
                    }
                }
            }
        }

        // Retorna o maior valor encontrado (provavelmente o valor total)
        return !empty($valores) ? max($valores) : null;
    }

    /**
     * Extrai data de início
     */
    private function extractDataInicio(string $text): ?string
    {
        $patterns = [
            // Padrões específicos para vigência/período (captura duas datas)
            '/vig[êe]ncia[:\s]*([\d\/\-\.]+)\s*at[ée]\s*([\d\/\-\.]+)/i',
            '/per[íi]odo[:\s]*([\d\/\-\.]+)\s*at[ée]\s*([\d\/\-\.]+)/i',
            '/prazo[:\s]*([\d\/\-\.]+)\s*at[ée]\s*([\d\/\-\.]+)/i',
            // Padrões específicos para data de início
            '/data\s*(?:de\s*)?in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/data\s*do\s*in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/data\s*de\s*in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            // Padrões mais flexíveis para texto corrompido
            '/in[íi]cio[:\s]*([\d\/\-\.]+)/i',
            '/data[:\s]*([\d\/\-\.]+)/i',
            // Procura por qualquer data no formato DD/MM/AAAA
            '/(\d{1,2}\/\d{1,2}\/\d{4})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                // Se o padrão capturou duas datas (vigência), pega a primeira (início)
                $data = isset($matches[2]) ? $matches[1] : $matches[1];
                $dataParsed = $this->parseDate($data);
                if ($dataParsed) {
                    return $dataParsed;
                }
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
            // Padrões específicos para vigência/período (pega a segunda data)
            '/vig[êe]ncia[:\s]*([\d\/\-\.]+)\s*at[ée]\s*([\d\/\-\.]+)/i',
            '/per[íi]odo[:\s]*([\d\/\-\.]+)\s*at[ée]\s*([\d\/\-\.]+)/i',
            '/prazo[:\s]*([\d\/\-\.]+)\s*at[ée]\s*([\d\/\-\.]+)/i',
            // Padrões específicos para data de fim/término
            '/data\s*(?:de\s*)?t[ée]rmino[:\s]*([\d\/\-\.]+)/i',
            '/data\s*(?:de\s*)?fim[:\s]*([\d\/\-\.]+)/i',
            '/t[ée]rmino[:\s]*([\d\/\-\.]+)/i',
            '/at[ée][:\s]*([\d\/\-\.]+)/i',
            '/data\s*de\s*t[ée]rmino[:\s]*([\d\/\-\.]+)/i',
            // Padrões mais flexíveis para texto corrompido
            '/t[ée]rmino[:\s]*([\d\/\-\.]+)/i',
            '/fim[:\s]*([\d\/\-\.]+)/i',
            '/at[ée][:\s]*([\d\/\-\.]+)/i',
            // Procura por qualquer data no formato DD/MM/AAAA
            '/(\d{1,2}\/\d{1,2}\/\d{4})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                // Se o padrão capturou duas datas, pega a segunda (fim)
                $data = isset($matches[2]) ? $matches[2] : $matches[1];
                $dataParsed = $this->parseDate($data);
                if ($dataParsed) {
                    return $dataParsed;
                }
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

    /**
     * Extrai qualquer valor monetário do texto
     */
    private function extractAnyValue(string $text): ?float
    {
        // Procura por valores monetários no texto
        $patterns = [
            '/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/', // Formato brasileiro
            '/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/', // Formato americano
            '/(\d+(?:,\d{2})?)/', // Formato simples
        ];

        $values = [];
        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches)) {
                foreach ($matches[1] as $match) {
                    $value = $this->parseDecimal($match);
                    if ($value !== null && $value > 0) {
                        $values[] = $value;
                    }
                }
            }
        }

        // Retorna o maior valor encontrado
        return !empty($values) ? max($values) : null;
    }

    /**
     * Extrai qualquer data do texto
     */
    private function extractAnyDate(string $text, bool $last = false): ?string
    {
        // Procura por datas no formato DD/MM/AAAA
        $pattern = '/(\d{1,2}\/\d{1,2}\/\d{4})/';
        
        if (preg_match_all($pattern, $text, $matches)) {
            $dates = [];
            foreach ($matches[1] as $match) {
                $date = $this->parseDate($match);
                if ($date) {
                    $dates[] = $date;
                }
            }
            
            if (!empty($dates)) {
                // Ordena as datas
                sort($dates);
                
                // Retorna a primeira ou última data
                return $last ? end($dates) : $dates[0];
            }
        }

        return null;
    }

    /**
     * Extrai qualquer número de contrato do texto
     */
    private function extractAnyContractNumber(string $text): ?string
    {
        // Procura por qualquer padrão que pareça um número de contrato
        $patterns = [
            '/(\d{1,4}\/\d{4})/', // Formato 001/2025
            '/(\d{1,4}-\d{4})/', // Formato 001-2025
            '/(\d{1,4}\.\d{4})/', // Formato 001.2025
            '/(\d{1,4}\/\d{2})/', // Formato 001/25
            '/(\d{1,4}-\d{2})/', // Formato 001-25
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Extrai qualquer contratado do texto
     */
    private function extractAnyContractor(string $text): ?string
    {
        // Procura por padrões que parecem nomes de empresas
        $patterns = [
            '/empresa\s+([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            '/([A-Z][A-Za-z\s]+(?:ltda|s\.a\.|ltda\.|s\.a\.|eireli))/i',
            '/contratad[ao][:\s]+([A-Z][A-Za-z\s]+)/i',
            '/fornecedor[:\s]+([A-Z][A-Za-z\s]+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $contratado = trim($matches[1]);
                if (strlen($contratado) > 3 && strlen($contratado) < 100) {
                    return $contratado;
                }
            }
        }

        return 'Empresa não identificada';
    }
}


