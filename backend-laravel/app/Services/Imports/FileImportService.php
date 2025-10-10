<?php

namespace App\Services\Imports;

use App\Models\FileImport;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileImportService
{
    /**
     * Faz upload e cria registro de importação
     */
    public function uploadFile(UploadedFile $file, ?int $userId = null): FileImport
    {
        // Determina o tipo de arquivo
        $fileType = $this->determineFileType($file);
        
        // Gera nome único para o arquivo
        $storedFilename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Faz upload do arquivo
        $filePath = $file->storeAs('imports', $storedFilename, 'local');
        
        // Cria registro no banco
        return FileImport::create([
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename' => $storedFilename,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'user_id' => $userId,
            'status' => 'pending',
        ]);
    }

    /**
     * Processa o arquivo importado
     */
    public function processFile(FileImport $fileImport, ?string $diretoria = null): void
    {
        try {
            $fileImport->markAsStarted();

            $processor = $this->getProcessor($fileImport->file_type);
            
            // Se for PDF e tiver diretoria, passa para o processador
            if ($fileImport->file_type === 'pdf' && $diretoria && method_exists($processor, 'setDiretoria')) {
                $processor->setDiretoria($diretoria);
            }
            
            $processor->process($fileImport);

            $fileImport->markAsCompleted();
        } catch (\Exception $e) {
            $fileImport->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Determina o tipo do arquivo baseado na extensão
     */
    private function determineFileType(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        return match ($extension) {
            'xml' => 'xml',
            'xlsx', 'xls' => 'excel',
            'csv' => 'csv',
            'pdf' => 'pdf',
            default => throw new \InvalidArgumentException('Tipo de arquivo não suportado: ' . $extension),
        };
    }

    /**
     * Retorna o processador apropriado para o tipo de arquivo
     */
    private function getProcessor(string $fileType): ProcessorInterface
    {
        return match ($fileType) {
            'xml' => new XmlProcessor(),
            'excel' => new ExcelProcessor(),
            'csv' => new CsvProcessor(),
            'pdf' => new PdfProcessor(),
            default => throw new \InvalidArgumentException('Processador não encontrado para: ' . $fileType),
        };
    }

    /**
     * Lista todas as importações
     */
    public function listImports(array $filters = [])
    {
        $query = FileImport::with('user')->latest();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['file_type'])) {
            $query->where('file_type', $filters['file_type']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Obtém detalhes de uma importação
     */
    public function getImportDetails(int $importId): FileImport
    {
        return FileImport::with(['user', 'contratos'])->findOrFail($importId);
    }

    /**
     * Deleta uma importação e seus dados
     */
    public function deleteImport(int $importId): void
    {
        $import = FileImport::findOrFail($importId);
        
        // Delete o arquivo físico
        if (Storage::exists($import->file_path)) {
            Storage::delete($import->file_path);
        }
        
        // Delete o registro (cascata deletará os contratos)
        $import->delete();
    }
}

