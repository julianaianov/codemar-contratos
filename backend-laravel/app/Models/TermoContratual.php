<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TermoContratual extends Model
{
    use HasFactory;

    protected $table = 'termos_contratuais';

    protected $fillable = [
        'contrato_id',
        'tipo',
        'numero',
        'data_criacao',
        'data_vigencia',
        'data_execucao',
        'valor_original',
        'valor_aditivo',
        'percentual_aditivo',
        'descricao',
        'justificativa',
        'status',
        'empenho_id',
        'empenho_numero',
        'observacoes',
        'anexos',
        'criado_por',
        'criado_em',
        'atualizado_por',
        'atualizado_em',
    ];

    protected $casts = [
        'data_criacao' => 'datetime',
        'data_vigencia' => 'date',
        'data_execucao' => 'date',
        'valor_original' => 'decimal:2',
        'valor_aditivo' => 'decimal:2',
        'percentual_aditivo' => 'decimal:2',
        'anexos' => 'array',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Constantes para tipos de termos
    const TIPOS = [
        'apostilamento' => 'Apostilamento',
        'aditivo' => 'Aditivo',
        'reconhecimento_divida' => 'Reconhecimento de Dívida',
        'rescisao' => 'Rescisão',
    ];

    // Constantes para status
    const STATUS = [
        'pendente' => 'Pendente',
        'aprovado' => 'Aprovado',
        'rejeitado' => 'Rejeitado',
        'em_analise' => 'Em Análise',
        'executado' => 'Executado',
    ];

    /**
     * Relacionamento com ContratoImportado
     */
    public function contrato(): BelongsTo
    {
        return $this->belongsTo(ContratoImportado::class, 'contrato_id');
    }

    /**
     * Scope para termos aprovados
     */
    public function scopeAprovados($query)
    {
        return $query->where('status', 'aprovado');
    }

    /**
     * Scope para termos por tipo
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para termos por contrato
     */
    public function scopePorContrato($query, $contratoId)
    {
        return $query->where('contrato_id', $contratoId);
    }

    /**
     * Verifica se o termo é um aditivo
     */
    public function isAditivo(): bool
    {
        return $this->tipo === 'aditivo';
    }

    /**
     * Verifica se o termo é um apostilamento
     */
    public function isApostilamento(): bool
    {
        return $this->tipo === 'apostilamento';
    }

    /**
     * Verifica se o termo é uma rescisão
     */
    public function isRescisao(): bool
    {
        return $this->tipo === 'rescisao';
    }

    /**
     * Verifica se o termo está aprovado
     */
    public function isAprovado(): bool
    {
        return $this->status === 'aprovado';
    }

    /**
     * Calcula o percentual de aditivo em relação ao valor original
     */
    public function calcularPercentualAditivo(): float
    {
        if (!$this->valor_original || $this->valor_original <= 0) {
            return 0;
        }

        return ($this->valor_aditivo / $this->valor_original) * 100;
    }

    /**
     * Obtém o nome do tipo formatado
     */
    public function getTipoFormatadoAttribute(): string
    {
        return self::TIPOS[$this->tipo] ?? $this->tipo;
    }

    /**
     * Obtém o nome do status formatado
     */
    public function getStatusFormatadoAttribute(): string
    {
        return self::STATUS[$this->status] ?? $this->status;
    }

    /**
     * Boot do modelo para eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Atualizar métricas do contrato quando um termo é criado/atualizado/deletado
        static::created(function ($termo) {
            $termo->atualizarMetricasContrato();
        });

        static::updated(function ($termo) {
            $termo->atualizarMetricasContrato();
        });

        static::deleted(function ($termo) {
            $termo->atualizarMetricasContrato();
        });
    }

    /**
     * Atualiza as métricas do contrato relacionado
     */
    public function atualizarMetricasContrato(): void
    {
        $contrato = $this->contrato;
        if (!$contrato) {
            return;
        }

        // Buscar todos os termos aprovados do contrato
        $termosAprovados = self::where('contrato_id', $contrato->id)
            ->where('status', 'aprovado')
            ->get();

        // Calcular totais
        $totalAditivos = $termosAprovados->where('tipo', 'aditivo')->sum('valor_aditivo');
        $totalApostilamentos = $termosAprovados->where('tipo', 'apostilamento')->count();
        $totalRescisoes = $termosAprovados->where('tipo', 'rescisao')->count();
        $quantidadeAditivos = $termosAprovados->where('tipo', 'aditivo')->count();

        // Calcular percentual total
        $valorOriginal = $contrato->valor_contrato ?? 0;
        $percentualTotal = $valorOriginal > 0 ? ($totalAditivos / $valorOriginal) * 100 : 0;

        // Atualizar métricas no contrato
        $contrato->update([
            'valor_original' => $valorOriginal,
            'valor_atual' => $valorOriginal + $totalAditivos,
            'percentual_aditivo_total' => $percentualTotal,
            'valor_aditivo_total' => $totalAditivos,
            'quantidade_aditivos' => $quantidadeAditivos,
            'quantidade_apostilamentos' => $totalApostilamentos,
            'quantidade_rescisoes' => $totalRescisoes,
            'data_vigencia' => $contrato->data_vigencia ?? $contrato->data_inicio,
            'data_execucao' => $contrato->data_execucao ?? $contrato->data_fim,
        ]);
    }
}