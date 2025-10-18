<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContratoImportado extends Model
{
    use HasFactory;

    protected $table = 'contratos_importados';

    protected $fillable = [
        'file_import_id',
        'ano_numero',           // ano-nº
        'numero_contrato',      // contrato
        'ano',                  // ano
        'pa',                   // P.A
        'diretoria',            // DIRETORIA REQUISITANTE
        'modalidade',           // MODALIDADE
        'nome_empresa',         // NOME DA EMPRESA
        'cnpj_empresa',         // CNPJ DA EMPRESA
        'objeto',               // OBJETO
        'data_assinatura',      // DATA DA ASSINATURA
        'prazo',                // PRAZO
        'unidade_prazo',        // UNID. PRAZO
        'valor_contrato',       // VALOR DO CONTRATO
        'vencimento',           // VENCIMENTO
        'gestor_contrato',      // GESTOR DO CONTRATO
        'fiscal_tecnico',       // FISCAL TÉCNICO
        'fiscal_administrativo', // FISCAL ADMINISTRATIVO
        'suplente',             // SUPLENTE
        // Campos legados para compatibilidade
        'contratante',
        'contratado',
        'cnpj_contratado',
        'valor',
        'data_inicio',
        'data_fim',
        'status',
        'tipo_contrato',
        'secretaria',
        'fonte_recurso',
        'observacoes',
        'dados_originais',
        'pdf_path',
        'processado',
        'erro_processamento',
        // Campos de conformidade
        'data_vigencia',
        'data_execucao',
        'valor_original',
        'valor_atual',
        'percentual_aditivo_total',
        'valor_aditivo_total',
        'quantidade_aditivos',
        'quantidade_apostilamentos',
        'quantidade_rescisoes',
    ];

    protected $casts = [
        'dados_originais' => 'array',
        'valor' => 'decimal:2',
        'valor_contrato' => 'decimal:2',
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'data_assinatura' => 'date',
        'vencimento' => 'date',
        'processado' => 'boolean',
        'prazo' => 'integer',
        'ano' => 'integer',
        // Campos de conformidade
        'data_vigencia' => 'date',
        'data_execucao' => 'date',
        'valor_original' => 'decimal:2',
        'valor_atual' => 'decimal:2',
        'percentual_aditivo_total' => 'decimal:2',
        'valor_aditivo_total' => 'decimal:2',
        'quantidade_aditivos' => 'integer',
        'quantidade_apostilamentos' => 'integer',
        'quantidade_rescisoes' => 'integer',
    ];

    /**
     * Relacionamento com FileImport
     */
    public function fileImport(): BelongsTo
    {
        return $this->belongsTo(FileImport::class);
    }

    /**
     * Relacionamento com TermosContratuais
     */
    public function termos(): HasMany
    {
        return $this->hasMany(TermoContratual::class, 'contrato_id');
    }

    /**
     * Relacionamento com InstrumentosContratuais
     */
    public function instrumentos(): HasMany
    {
        return $this->hasMany(InstrumentoContratual::class, 'contrato_id');
    }

    /**
     * Relacionamento com TermosContratuais aprovados
     */
    public function termosAprovados(): HasMany
    {
        return $this->hasMany(TermoContratual::class, 'contrato_id')->where('status', 'aprovado');
    }

    /**
     * Marca como processado
     */
    public function markAsProcessed(): void
    {
        $this->update(['processado' => true]);
    }

    /**
     * Marca como falho no processamento
     */
    public function markAsFailedProcessing(string $error): void
    {
        $this->update([
            'processado' => false,
            'erro_processamento' => $error,
        ]);
    }

    /**
     * Verifica se o contrato tem aditivos
     */
    public function hasAditivos(): bool
    {
        return $this->quantidade_aditivos > 0;
    }

    /**
     * Verifica se o contrato tem apostilamentos
     */
    public function hasApostilamentos(): bool
    {
        return $this->quantidade_apostilamentos > 0;
    }

    /**
     * Verifica se o contrato tem rescisões
     */
    public function hasRescisoes(): bool
    {
        return $this->quantidade_rescisoes > 0;
    }

    /**
     * Obtém o valor total de aditivos
     */
    public function getValorTotalAditivos(): float
    {
        return $this->valor_aditivo_total ?? 0;
    }

    /**
     * Obtém o percentual total de aditivos
     */
    public function getPercentualTotalAditivos(): float
    {
        return $this->percentual_aditivo_total ?? 0;
    }

    /**
     * Obtém o valor atual do contrato (original + aditivos)
     */
    public function getValorAtual(): float
    {
        return $this->valor_atual ?? $this->valor_contrato ?? 0;
    }

    /**
     * Obtém o valor original do contrato
     */
    public function getValorOriginal(): float
    {
        return $this->valor_original ?? $this->valor_contrato ?? 0;
    }

    /**
     * Obtém a quantidade total de termos
     */
    public function getQuantidadeTotalTermos(): int
    {
        return $this->quantidade_aditivos + $this->quantidade_apostilamentos + $this->quantidade_rescisoes;
    }

    /**
     * Verifica se o contrato está dentro dos limites legais
     */
    public function isDentroLimiteLegal(): bool
    {
        $limite = $this->getLimiteLegal();
        return $this->getPercentualTotalAditivos() <= $limite;
    }

    /**
     * Obtém o limite legal de aditivo conforme Lei 14.133/2021
     */
    public function getLimiteLegal(): int
    {
        $tipoLower = strtolower($this->tipo_contrato ?? '');
        $objetoLower = strtolower($this->objeto ?? '');
        
        // Reforma de edifício ou equipamento (50%)
        if (preg_match('/(reforma|reformas|equipamento|equipamentos|edifício|edifícios|instalação|instalações|manutenção|manutenções)/', $tipoLower) ||
            preg_match('/(reforma|reformas|equipamento|equipamentos|edifício|edifícios|instalação|instalações|manutenção|manutenções)/', $objetoLower)) {
            return 50;
        }
        
        // Obra, serviço ou compra (25%)
        if (preg_match('/(obra|obras|construção|construções|ampliação|ampliações|restauração|restaurações|demolição|demolições|serviço|serviços|compra|compras|fornecimento|fornecimentos)/', $tipoLower) ||
            preg_match('/(obra|obras|construção|construções|ampliação|ampliações|restauração|restaurações|demolição|demolições|serviço|serviços|compra|compras|fornecimento|fornecimentos)/', $objetoLower)) {
            return 25;
        }
        
        // Sociedade mista (25%)
        if (preg_match('/(sociedade|mista)/', $tipoLower)) {
            return 25;
        }
        
        // Default (25%)
        return 25;
    }

    /**
     * Obtém a classificação do contrato
     */
    public function getClassificacao(): array
    {
        $tipoLower = strtolower($this->tipo_contrato ?? '');
        $objetoLower = strtolower($this->objeto ?? '');
        
        // Reforma de edifício ou equipamento (50%)
        if (preg_match('/(reforma|reformas|equipamento|equipamentos|edifício|edifícios|instalação|instalações|manutenção|manutenções)/', $tipoLower) ||
            preg_match('/(reforma|reformas|equipamento|equipamentos|edifício|edifícios|instalação|instalações|manutenção|manutenções)/', $objetoLower)) {
            return [
                'categoria' => 'REFORMA_EQUIPAMENTO',
                'limite' => 50,
                'descricao' => 'Reforma de Edifício ou Equipamento'
            ];
        }
        
        // Obra, serviço ou compra (25%)
        if (preg_match('/(obra|obras|construção|construções|ampliação|ampliações|restauração|restaurações|demolição|demolições|serviço|serviços|compra|compras|fornecimento|fornecimentos)/', $tipoLower) ||
            preg_match('/(obra|obras|construção|construções|ampliação|ampliações|restauração|restaurações|demolição|demolições|serviço|serviços|compra|compras|fornecimento|fornecimentos)/', $objetoLower)) {
            return [
                'categoria' => 'OBRAS_SERVICOS_COMPRAS',
                'limite' => 25,
                'descricao' => 'Obras, Serviços ou Compras'
            ];
        }
        
        // Sociedade mista (25%)
        if (preg_match('/(sociedade|mista)/', $tipoLower)) {
            return [
                'categoria' => 'SOCIEDADE_MISTA',
                'limite' => 25,
                'descricao' => 'Sociedade Mista'
            ];
        }
        
        // Default (25%)
        return [
            'categoria' => 'DEFAULT',
            'limite' => 25,
            'descricao' => 'Demais Contratos'
        ];
    }

    /**
     * Obtém o status de conformidade
     */
    public function getStatusConformidade(): string
    {
        $percentual = $this->getPercentualTotalAditivos();
        $limite = $this->getLimiteLegal();
        
        if ($percentual > $limite) {
            return 'INCONFORME';
        } elseif ($percentual > $limite * 0.8) {
            return 'ATENCAO';
        } else {
            return 'CONFORME';
        }
    }

    /**
     * Obtém o percentual restante disponível para aditivos
     */
    public function getPercentualRestante(): float
    {
        $limite = $this->getLimiteLegal();
        $atual = $this->getPercentualTotalAditivos();
        return max(0, $limite - $atual);
    }

    /**
     * Obtém o valor restante disponível para aditivos
     */
    public function getValorRestante(): float
    {
        $percentualRestante = $this->getPercentualRestante();
        $valorOriginal = $this->getValorOriginal();
        return ($valorOriginal * $percentualRestante) / 100;
    }
}
