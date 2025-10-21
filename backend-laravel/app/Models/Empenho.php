<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empenho extends Model
{
    use HasFactory;

    protected $table = 'empenhos';

    protected $fillable = [
        'numero',
        'valor',
        'data_empenho',
        'data_vencimento',
        'status',
        'observacoes',
        'criado_por',
        'criado_em',
        'atualizado_por',
        'atualizado_em',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_empenho' => 'date',
        'data_vencimento' => 'date',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Constantes para status
    const STATUS = [
        'ativo' => 'Ativo',
        'liquidado' => 'Liquidado',
        'cancelado' => 'Cancelado',
    ];

    /**
     * Scope para empenhos ativos
     */
    public function scopeAtivos($query)
    {
        return $query->where('status', 'ativo');
    }

    /**
     * Scope para empenhos liquidados
     */
    public function scopeLiquidados($query)
    {
        return $query->where('status', 'liquidado');
    }

    /**
     * Scope para empenhos cancelados
     */
    public function scopeCancelados($query)
    {
        return $query->where('status', 'cancelado');
    }

    /**
     * Scope para empenhos por status
     */
    public function scopePorStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para empenhos vencidos
     */
    public function scopeVencidos($query)
    {
        return $query->where('data_vencimento', '<', now()->toDateString());
    }

    /**
     * Scope para empenhos próximos do vencimento
     */
    public function scopeProximosVencimento($query, $dias = 30)
    {
        $dataLimite = now()->addDays($dias)->toDateString();
        return $query->where('data_vencimento', '<=', $dataLimite)
                    ->where('data_vencimento', '>=', now()->toDateString());
    }

    /**
     * Verifica se o empenho está ativo
     */
    public function isAtivo(): bool
    {
        return $this->status === 'ativo';
    }

    /**
     * Verifica se o empenho está liquidado
     */
    public function isLiquidado(): bool
    {
        return $this->status === 'liquidado';
    }

    /**
     * Verifica se o empenho está cancelado
     */
    public function isCancelado(): bool
    {
        return $this->status === 'cancelado';
    }

    /**
     * Verifica se o empenho está vencido
     */
    public function isVencido(): bool
    {
        return $this->data_vencimento < now()->toDateString();
    }

    /**
     * Verifica se o empenho está próximo do vencimento
     */
    public function isProximoVencimento(int $dias = 30): bool
    {
        $dataLimite = now()->addDays($dias)->toDateString();
        return $this->data_vencimento <= $dataLimite && $this->data_vencimento >= now()->toDateString();
    }

    /**
     * Calcula os dias restantes até o vencimento
     */
    public function calcularDiasRestantes(): int
    {
        if ($this->isVencido()) {
            return 0;
        }
        return now()->diffInDays($this->data_vencimento);
    }

    /**
     * Calcula a duração do empenho em dias
     */
    public function calcularDuracao(): int
    {
        return $this->data_empenho->diffInDays($this->data_vencimento);
    }

    /**
     * Obtém o nome do status formatado
     */
    public function getStatusFormatadoAttribute(): string
    {
        return self::STATUS[$this->status] ?? $this->status;
    }

    /**
     * Obtém o status de vencimento
     */
    public function getStatusVencimentoAttribute(): string
    {
        if ($this->isVencido()) {
            return 'Vencido';
        }
        if ($this->isProximoVencimento()) {
            return 'Próximo do Vencimento';
        }
        return 'Vigente';
    }

    /**
     * Obtém a cor do status de vencimento
     */
    public function getCorStatusVencimentoAttribute(): string
    {
        return match ($this->status_vencimento) {
            'Vigente' => 'green',
            'Próximo do Vencimento' => 'yellow',
            'Vencido' => 'red',
            default => 'gray',
        };
    }

    /**
     * Obtém o valor formatado
     */
    public function getValorFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->valor, 2, ',', '.');
    }

    /**
     * Obtém a data de empenho formatada
     */
    public function getDataEmpenhoFormatadaAttribute(): string
    {
        return $this->data_empenho->format('d/m/Y');
    }

    /**
     * Obtém a data de vencimento formatada
     */
    public function getDataVencimentoFormatadaAttribute(): string
    {
        return $this->data_vencimento->format('d/m/Y');
    }
}