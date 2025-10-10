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
        'numero_contrato',
        'objeto',
        'contratante',
        'contratado',
        'cnpj_contratado',
        'valor',
        'data_inicio',
        'data_fim',
        'modalidade',
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
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'processado' => 'boolean',
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
