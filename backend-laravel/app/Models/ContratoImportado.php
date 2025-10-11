<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    /**
     * Relacionamento com FileImport
     */
    public function fileImport(): BelongsTo
    {
        return $this->belongsTo(FileImport::class);
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
}
