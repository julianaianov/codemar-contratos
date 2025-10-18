<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstrumentoContratual extends Model
{
    use HasFactory;

    protected $table = 'instrumentos_contratuais';

    protected $fillable = [
        'contrato_id',
        'tipo',
        'numero',
        'data_inicio',
        'data_fim',
        'valor',
        'descricao',
        'status',
        'observacoes',
        'anexos',
        'criado_por',
        'criado_em',
        'atualizado_por',
        'atualizado_em',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'valor' => 'decimal:2',
        'anexos' => 'array',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Constantes para tipos de instrumentos
    const TIPOS = [
        'colaboracao' => 'Colaboração',
        'comodato' => 'Comodato',
        'concessao' => 'Concessão',
        'convenio' => 'Convênio',
        'cooperacao' => 'Cooperação',
        'fomento' => 'Fomento',
        'parceria' => 'Parceria',
        'patrocinio' => 'Patrocínio',
        'protocolo_intencoes' => 'Protocolo de Intenções',
        'cessao' => 'Cessão',
        'reconhecimento_divida' => 'Reconhecimento de Dívida',
    ];

    // Constantes para status
    const STATUS = [
        'ativo' => 'Ativo',
        'suspenso' => 'Suspenso',
        'encerrado' => 'Encerrado',
        'cancelado' => 'Cancelado',
    ];

    /**
     * Relacionamento com ContratoImportado
     */
    public function contrato(): BelongsTo
    {
        return $this->belongsTo(ContratoImportado::class, 'contrato_id');
    }

    /**
     * Scope para instrumentos ativos
     */
    public function scopeAtivos($query)
    {
        return $query->where('status', 'ativo');
    }

    /**
     * Scope para instrumentos por tipo
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para instrumentos por contrato
     */
    public function scopePorContrato($query, $contratoId)
    {
        return $query->where('contrato_id', $contratoId);
    }

    /**
     * Scope para instrumentos vigentes
     */
    public function scopeVigentes($query)
    {
        $hoje = now()->toDateString();
        return $query->where('data_inicio', '<=', $hoje)
                    ->where('data_fim', '>=', $hoje);
    }

    /**
     * Verifica se o instrumento está ativo
     */
    public function isAtivo(): bool
    {
        return $this->status === 'ativo';
    }

    /**
     * Verifica se o instrumento está vigente
     */
    public function isVigente(): bool
    {
        $hoje = now()->toDateString();
        return $this->data_inicio <= $hoje && $this->data_fim >= $hoje;
    }

    /**
     * Verifica se o instrumento está vencido
     */
    public function isVencido(): bool
    {
        return $this->data_fim < now()->toDateString();
    }

    /**
     * Calcula a duração do instrumento em dias
     */
    public function calcularDuracao(): int
    {
        return $this->data_inicio->diffInDays($this->data_fim);
    }

    /**
     * Calcula os dias restantes até o vencimento
     */
    public function calcularDiasRestantes(): int
    {
        $hoje = now()->toDateString();
        if ($this->data_fim < $hoje) {
            return 0; // Já vencido
        }
        return now()->diffInDays($this->data_fim);
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
     * Obtém o status de vigência
     */
    public function getStatusVigenciaAttribute(): string
    {
        if ($this->isVencido()) {
            return 'Vencido';
        }
        if ($this->isVigente()) {
            return 'Vigente';
        }
        return 'Futuro';
    }

    /**
     * Obtém a cor do status de vigência
     */
    public function getCorStatusVigenciaAttribute(): string
    {
        return match ($this->status_vigencia) {
            'Vigente' => 'green',
            'Vencido' => 'red',
            'Futuro' => 'blue',
            default => 'gray',
        };
    }
}