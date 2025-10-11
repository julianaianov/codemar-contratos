<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use App\Models\ContratoImportado;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ExcelProcessor implements ProcessorInterface
{
    private ?string $diretoria = null;

    public function setDiretoria(string $diretoria): void
    {
        $this->diretoria = $diretoria;
    }
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
        // Normaliza cabeçalhos: sem acentos/pontuação e minúsculo
        $normalizedHeaders = [];
        foreach ($headers as $idx => $h) {
            $nk = $this->normalizeKey($h);
            // Evita headers vazios/duplicados
            if ($nk === '') {
                $nk = 'col_' . $idx;
            }
            // Garante unicidade mínima
            $suffix = 1;
            $base = $nk;
            while (isset($normalizedHeaders[$nk])) {
                $nk = $base . '_' . $suffix++;
            }
            $normalizedHeaders[$nk] = $nk;
        }
        $headers = array_values($normalizedHeaders);

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

                // Normaliza valores para array associativo com cabeçalhos normalizados
                // Se quantidade divergir, faz trim/resize seguro
                $rowValues = $row;
                if (count($rowValues) !== count($headers)) {
                    $rowValues = array_pad(array_slice($rowValues, 0, count($headers)), count($headers), null);
                }
                $data = array_combine($headers, $rowValues);
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
        // Extrai dados específicos dos novos campos (ordem de prioridade: nomes exatos primeiro)
        $anoNumero = $this->getValue($data, ['ano-nº', 'ano_numero', 'ano_numero_contrato','ano numero','ano-n']);
        $numeroContrato = $this->getValue($data, ['contrato', 'numero', 'numero_contrato', 'nº contrato']);
        $ano = $this->parseAno($this->getValue($data, ['ano', 'ano_contrato']));
        $pa = $this->getValue($data, ['P.A', 'pa', 'p.a', 'processo_administrativo', 'processo']);
        // Para Excel, usa DIRETORIA REQUISITANTE como diretoria principal
        $diretoria = $this->getValue($data, ['DIRETORIA REQUISITANTE', 'diretoria_requisitante', 'DIRETORIA', 'diretoria', 'secretaria', 'unidade']);
        if (empty($diretoria)) {
            $diretoria = $this->diretoria ?: 'Diretoria não especificada';
        }
        $modalidade = $this->getValue($data, ['MODALIDADE', 'modalidade', 'modalidade_licitacao']);
        $nomeEmpresa = $this->getValue($data, ['NOME DA EMPRESA', 'nome_empresa', 'empresa', 'contratado', 'fornecedor', 'razao_social']);
        $cnpjEmpresa = $this->getValue($data, ['CNPJ DA EMPRESA', 'cnpj_empresa', 'cnpj', 'cnpj_contratado']);
        $objeto = $this->getValue($data, ['OBJETO', 'objeto', 'descricao', 'descrição', 'objeto_contrato']);
        $dataAssinatura = $this->parseDate($this->getValue($data, ['DATA DA ASSINATURA', 'data_assinatura', 'assinatura', 'data_contrato']));
        $prazo = $this->parseInteger($this->getValue($data, ['PRAZO', 'prazo', 'prazo_contrato', 'duracao']));
        $unidadePrazo = $this->getValue($data, ['UNID. PRAZO', 'unidade_prazo', 'unid_prazo', 'unidade', 'periodo']);
        $valorContrato = $this->parseDecimal($this->getValue($data, ['VALOR DO CONTRATO', 'valor_contrato', 'valor', 'valor_total']));
        $vencimento = $this->parseDate($this->getValue($data, ['VENCIMENTO', 'vencimento', 'data_vencimento', 'data_fim', 'vigencia_fim']));
        
        // Novos campos específicos
        $gestorContrato = $this->getValue($data, ['GESTOR DO CONTRATO', 'gestor_contrato', 'gestor', 'responsavel']);
        $fiscalTecnico = $this->getValue($data, ['FISCAL TÉCNICO', 'fiscal_tecnico', 'fiscal_tecnico', 'fiscal_tecnico']);
        $fiscalAdministrativo = $this->getValue($data, ['FISCAL ADMINISTRATIVO', 'fiscal_administrativo', 'fiscal_admin', 'fiscal_administrativo']);
        $suplente = $this->getValue($data, ['SUPLENTE', 'suplente', 'substituto']);
        $status = $this->getValue($data, ['STATUS', 'status', 'situacao', 'situação']);

        ContratoImportado::create([
            'file_import_id' => $fileImport->id,
            // Novos campos específicos
            'ano_numero' => $anoNumero,
            'numero_contrato' => $numeroContrato,
            'ano' => $ano,
            'pa' => $pa,
            'diretoria' => $diretoria,
            'modalidade' => $modalidade,
            'nome_empresa' => $nomeEmpresa,
            'cnpj_empresa' => $cnpjEmpresa,
            'objeto' => $objeto,
            'data_assinatura' => $dataAssinatura,
            'prazo' => $prazo,
            'unidade_prazo' => $unidadePrazo,
            'valor_contrato' => $valorContrato,
            'vencimento' => $vencimento,
            'gestor_contrato' => $gestorContrato,
            'fiscal_tecnico' => $fiscalTecnico,
            'fiscal_administrativo' => $fiscalAdministrativo,
            'suplente' => $suplente,
            // Campos legados para compatibilidade
            'contratante' => $this->getValue($data, ['contratante', 'orgao', 'prefeitura']), // Mantém lógica original
            'contratado' => $nomeEmpresa, // CONTRATADO = NOME DA EMPRESA
            'cnpj_contratado' => $cnpjEmpresa, // CNPJ = CNPJ DA EMPRESA
            'valor' => $valorContrato, // VALOR = VALOR DO CONTRATO
            'data_inicio' => $dataAssinatura,
            'data_fim' => $vencimento,
            'status' => $status ?: 'vigente', // Para Excel, usa STATUS da planilha
            'tipo_contrato' => $this->getValue($data, ['tipo', 'tipo_contrato']),
            'secretaria' => $diretoria, // SECRETARIA = DIRETORIA REQUISITANTE
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
        // Chaves já estão normalizadas; normaliza também as buscas
        foreach ($possibleKeys as $key) {
            $nk = $this->normalizeKey($key);
            if (isset($data[$nk]) && $data[$nk] !== '') {
                return is_string($data[$nk]) ? trim($data[$nk]) : $data[$nk];
            }
            // procurar variantes com sufixo numérico e variantes com parênteses (e.g., "fiscal tecnico 1", "fiscal tecnico (titular)")
            foreach ($data as $dk => $val) {
                if ($val === '' || $val === null) continue;
                if (preg_match('/^'.preg_quote($nk, '/').'(\s+|_)\d+$/', $dk)
                    || preg_match('/^'.preg_quote($nk, '/').'\s*\(/', $dk)) {
                    return is_string($val) ? trim($val) : $val;
                }
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

        // Mantém apenas dígitos e separadores
        $s = preg_replace('/[^\d,\.]/', '', (string) $value);

        $lastDot = strrpos($s, '.');
        $lastComma = strrpos($s, ',');

        if ($lastDot !== false && $lastComma !== false) {
            // Ambos presentes: decimal é o separador que aparece por último
            if ($lastDot > $lastComma) {
                // decimal '.' -> remove vírgulas (milhar)
                $s = str_replace(',', '', $s);
            } else {
                // decimal ',' -> remove pontos (milhar) e troca vírgula por ponto
                $s = str_replace('.', '', $s);
                $s = str_replace(',', '.', $s);
            }
        } elseif ($lastComma !== false) {
            // Apenas vírgula -> considera decimal e troca por ponto
            $s = str_replace(',', '.', $s);
        } else {
            // Apenas ponto ou apenas dígitos -> já está OK
        }

        return is_numeric($s) ? (float) $s : null;
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

    /**
     * Converte valor para inteiro
     */
    private function parseInteger($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        // Remove caracteres não numéricos
        $value = preg_replace('/[^\d]/', '', $value);
        
        return !empty($value) ? (int) $value : null;
    }

    /**
     * Converte valor para ano
     */
    private function parseAno($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $ano = $this->parseInteger($value);
        
        // Valida se é um ano válido
        if ($ano && $ano >= 2000 && $ano <= 2030) {
            return $ano;
        }

        return null;
    }

    private function normalizeKey($key): string
    {
        if ($key === null) return '';
        $key = (string) $key;
        $key = \Illuminate\Support\Str::ascii(\Illuminate\Support\Str::lower(trim($key)));
        $key = str_replace(['.', ',', ';', ':', '\\', '/', '-', '–', '—', '_', '(', ')', '[', ']', '{', '}'], ' ', $key);
        $key = preg_replace('/\s+/', ' ', $key);
        return $key;
    }
}

