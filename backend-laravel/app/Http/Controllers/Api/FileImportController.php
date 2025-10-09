<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Imports\FileImportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FileImportController extends Controller
{
    protected FileImportService $importService;

    public function __construct(FileImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Lista todas as importações
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'file_type', 'per_page']);
        $imports = $this->importService->listImports($filters);

        return response()->json([
            'success' => true,
            'data' => $imports,
        ]);
    }

    /**
     * Faz upload e processa arquivo
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xml,xlsx,xls,csv,pdf|max:20480', // Max 20MB (PDFs podem ser maiores)
            'diretoria' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validação falhou',
                'errors' => $validator->errors(),
            ], 422);
        }


        try {
            $file = $request->file('file');
            $userId = auth()->id(); // Se tiver autenticação

            // Faz upload do arquivo
            $fileImport = $this->importService->uploadFile($file, $userId);

            // Processa o arquivo de forma assíncrona (ou síncrona para teste)
            // Para produção, usar jobs: ProcessFileImportJob::dispatch($fileImport);
            $this->importService->processFile($fileImport);

            // Buscar diretoria mais comum nos contratos importados
            $diretoriaMaisComum = $fileImport->contratosImportados()
                ->whereNotNull('secretaria')
                ->select('secretaria', \DB::raw('count(*) as total'))
                ->groupBy('secretaria')
                ->orderByDesc('total')
                ->first();

            $response = [
                'success' => true,
                'message' => 'Arquivo importado com sucesso',
                'data' => $fileImport->fresh(),
            ];

            if ($diretoriaMaisComum) {
                $response['diretoria'] = $diretoriaMaisComum->secretaria;
            }

            return response()->json($response, 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar arquivo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retorna detalhes de uma importação
     */
    public function show(int $id): JsonResponse
    {
        try {
            $import = $this->importService->getImportDetails($id);

            return response()->json([
                'success' => true,
                'data' => $import,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Importação não encontrada',
            ], 404);
        }
    }

    /**
     * Deleta uma importação
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->importService->deleteImport($id);

            return response()->json([
                'success' => true,
                'message' => 'Importação deletada com sucesso',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar importação',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retorna contratos de uma importação
     */
    public function contratos(int $id): JsonResponse
    {
        try {
            $import = $this->importService->getImportDetails($id);

            return response()->json([
                'success' => true,
                'data' => $import->contratos()->paginate(50),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Importação não encontrada',
            ], 404);
        }
    }

    /**
     * Retorna TODOS os contratos importados (incluindo dados vazios)
     */
    public function todosContratos(): JsonResponse
    {
        try {
            $contratos = \App\Models\ContratoImportado::with('fileImport')
                ->latest()
                ->get()
                ->map(function ($contrato) {
                    return [
                        'id' => $contrato->id,
                        'file_import_id' => $contrato->file_import_id,
                        'arquivo_original' => $contrato->fileImport ? $contrato->fileImport->original_filename : 'N/A',
                        'tipo_arquivo' => $contrato->fileImport ? $contrato->fileImport->file_type : 'N/A',
                        'numero_contrato' => $contrato->numero_contrato,
                        'objeto' => $contrato->objeto,
                        'contratante' => $contrato->contratante,
                        'contratado' => $contrato->contratado,
                        'cnpj_contratado' => $contrato->cnpj_contratado,
                        'valor' => $contrato->valor,
                        'data_inicio' => $contrato->data_inicio,
                        'data_fim' => $contrato->data_fim,
                        'modalidade' => $contrato->modalidade,
                        'status' => $contrato->status,
                        'tipo_contrato' => $contrato->tipo_contrato,
                        'secretaria' => $contrato->secretaria,
                        'fonte_recurso' => $contrato->fonte_recurso,
                        'pdf_path' => $contrato->pdf_path,
                        'texto_extraido' => $contrato->dados_originais['texto_extraido_ocr'] ?? $contrato->dados_originais['texto_extraido'] ?? null,
                        'metodo' => $contrato->dados_originais['metodo'] ?? 'texto',
                        'created_at' => $contrato->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $contratos,
                'total' => $contratos->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar contratos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retorna estatísticas das importações
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_imports' => \App\Models\FileImport::count(),
            'pending' => \App\Models\FileImport::where('status', 'pending')->count(),
            'processing' => \App\Models\FileImport::where('status', 'processing')->count(),
            'completed' => \App\Models\FileImport::where('status', 'completed')->count(),
            'failed' => \App\Models\FileImport::where('status', 'failed')->count(),
            'total_contratos' => \App\Models\ContratoImportado::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Download do arquivo PDF original
     */
    public function downloadPdf(int $importId): mixed
    {
        try {
            $import = \App\Models\FileImport::findOrFail($importId);
            
            if ($import->file_type !== 'pdf') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este arquivo não é um PDF',
                ], 400);
            }

            $filePath = storage_path('app/' . $import->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Arquivo não encontrado',
                ], 404);
            }

            return response()->download($filePath, $import->original_filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao baixar arquivo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Visualização do PDF no navegador
     */
    public function viewPdf(int $importId): mixed
    {
        try {
            $import = \App\Models\FileImport::findOrFail($importId);
            
            if ($import->file_type !== 'pdf') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este arquivo não é um PDF',
                ], 400);
            }

            $filePath = storage_path('app/' . $import->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Arquivo não encontrado',
                ], 404);
            }

            return response()->file($filePath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $import->original_filename . '"'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao visualizar arquivo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
