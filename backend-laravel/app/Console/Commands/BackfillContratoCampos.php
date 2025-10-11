<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ContratoImportado;
use Illuminate\Support\Str;

class BackfillContratoCampos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contratos:backfill-excel-fields {--limit=0 : Limita a quantidade de registros}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Preenche campos de contratos importados a partir de dados_originais (Excel/CSV/XML), sem necessidade de novo upload';

    public function handle(): int
    {
        $query = ContratoImportado::query()->orderBy('id');
        $limit = (int)$this->option('limit');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $count = 0;
        $updated = 0;
        $query->chunk(500, function($chunk) use (&$count, &$updated) {
            foreach ($chunk as $contrato) {
                $count++;
                $orig = $contrato->dados_originais ?? [];
                if (empty($orig) || !is_array($orig)) continue;

                $normalized = [];
                foreach ($orig as $k => $v) {
                    $normalized[$this->normalizeKey($k)] = $v;
                }

                $before = $contrato->getAttributes();

                $contrato->ano_numero = $contrato->ano_numero ?: $this->get($normalized, ['ano-nº','ano numero','ano_numero','ano_numero_contrato','ano-n']);
                $contrato->numero_contrato = $contrato->numero_contrato ?: $this->get($normalized, ['contrato','numero','numero_contrato','nº contrato']);
                $contrato->ano = $contrato->ano ?: $this->parseInt($this->get($normalized, ['ano','ano_contrato']));
                $contrato->pa = $contrato->pa ?: $this->get($normalized, ['p.a','pa','p a','processo_administrativo','processo']);
                $contrato->diretoria = $contrato->diretoria ?: $this->get($normalized, ['diretoria requisitante','diretoria','secretaria','unidade']);
                $contrato->modalidade = $contrato->modalidade ?: $this->get($normalized, ['modalidade','modalidade_licitacao']);
                $contrato->nome_empresa = $contrato->nome_empresa ?: $this->get($normalized, ['nome da empresa','nome_empresa','empresa','contratado','fornecedor','razao social','razao_social']);
                $contrato->cnpj_empresa = $contrato->cnpj_empresa ?: $this->get($normalized, ['cnpj da empresa','cnpj_empresa','cnpj','cnpj_contratado']);
                $contrato->objeto = $contrato->objeto ?: $this->get($normalized, ['objeto','descricao','descrição','objeto contrato','objeto_contrato']);
                $contrato->data_assinatura = $contrato->data_assinatura ?: $this->parseDate($this->get($normalized, ['data da assinatura','data_assinatura','assinatura','data contrato','data_contrato']));
                $contrato->prazo = $contrato->prazo ?: $this->parseInt($this->get($normalized, ['prazo','prazo contrato','duracao','duração']));
                $contrato->unidade_prazo = $contrato->unidade_prazo ?: $this->get($normalized, ['unid. prazo','unidade_prazo','unid_prazo','unidade','periodo','período']);
                $contrato->valor_contrato = $contrato->valor_contrato ?: $this->parseDecimal($this->get($normalized, ['valor do contrato','valor_contrato','valor total','valor_total','valor']));
                $contrato->vencimento = $contrato->vencimento ?: $this->parseDate($this->get($normalized, ['vencimento','data_vencimento','data fim','data_fim','vigencia_fim']));
                $contrato->gestor_contrato = $contrato->gestor_contrato ?: $this->getWithNumeric($normalized, ['gestor do contrato','gestor_contrato','gestor','responsavel','responsável']);
                $contrato->fiscal_tecnico = $contrato->fiscal_tecnico ?: $this->getWithNumeric($normalized, ['fiscal tecnico','fiscal tecnico','fiscal_tecnico','fiscal técnico']);
                $contrato->fiscal_administrativo = $contrato->fiscal_administrativo ?: $this->getWithNumeric($normalized, ['fiscal administrativo','fiscal administrativo','fiscal_administrativo','fiscal admin']);
                $contrato->suplente = $contrato->suplente ?: $this->getWithNumeric($normalized, ['suplente','substituto']);
                $contrato->observacoes = $contrato->observacoes ?: $this->get($normalized, ['observações','observacoes','obs']);

                if ($contrato->isDirty()) {
                    $contrato->save();
                    $updated++;
                }
            }
        });

        $this->info("Processados: {$count} | Atualizados: {$updated}");
        return Command::SUCCESS;
    }

    private function normalizeKey(string $key): string
    {
        $key = Str::ascii(Str::lower(trim($key)));
        $key = str_replace(['.', ',', ';', ':', '\\', '/', '-', '–', '—', '_'], ' ', $key);
        return preg_replace('/\s+/', ' ', $key);
    }

    private function get(array $norm, array $keys): ?string
    {
        foreach ($keys as $k) {
            $nk = $this->normalizeKey($k);
            if (isset($norm[$nk]) && $norm[$nk] !== '') return is_string($norm[$nk]) ? trim($norm[$nk]) : (string)$norm[$nk];
        }
        return null;
    }

    private function getWithNumeric(array $norm, array $keys): ?string
    {
        // tenta match exato, depois variantes com sufixo numérico (ex.: "fiscal tecnico 1")
        foreach ($keys as $k) {
            $base = $this->normalizeKey($k);
            if (isset($norm[$base]) && $norm[$base] !== '') {
                return is_string($norm[$base]) ? trim($norm[$base]) : (string)$norm[$base];
            }
            foreach ($norm as $nk => $val) {
                if ($val === '' || $val === null) continue;
                if (preg_match('/^'.preg_quote($base, '/').'\s+\d+$/', $nk)) {
                    return is_string($val) ? trim($val) : (string)$val;
                }
            }
        }
        return null;
    }

    private function parseInt(?string $value): ?int
    {
        if ($value === null || $value === '') return null;
        $v = preg_replace('/[^\d]/', '', (string)$value);
        return $v !== '' ? (int)$v : null;
    }

    private function parseDate(?string $value): ?string
    {
        if ($value === null || $value === '') return null;
        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseDecimal($value): ?float
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
}


