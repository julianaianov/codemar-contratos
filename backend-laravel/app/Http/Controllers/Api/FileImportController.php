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
            'diretoria' => 'nullable|string|max:255', // Opcional - só obrigatório para PDFs
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
            $diretoria = $request->input('diretoria');
            $userId = auth()->id(); // Se tiver autenticação

            // Determina o tipo de arquivo
            $fileType = $file->getClientOriginalExtension();
            
            // Para arquivos Excel, não exige diretoria (vem do arquivo)
            // Para PDFs, exige diretoria
            if (in_array($fileType, ['pdf']) && empty($diretoria)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Para arquivos PDF, a diretoria é obrigatória',
                    'errors' => ['diretoria' => ['A diretoria é obrigatória para arquivos PDF']],
                ], 422);
            }

            // Faz upload do arquivo
            $fileImport = $this->importService->uploadFile($file, $userId);

            // Processa o arquivo
            $this->importService->processFile($fileImport, $diretoria);

            // Buscar diretorias encontradas nos contratos importados
            $diretoriasEncontradas = $fileImport->contratosImportados()
                ->whereNotNull('diretoria')
                ->select('diretoria', \DB::raw('count(*) as total'))
                ->groupBy('diretoria')
                ->orderByDesc('total')
                ->get();

            $response = [
                'success' => true,
                'message' => 'Arquivo importado com sucesso',
                'data' => $fileImport->fresh(),
                'diretorias_encontradas' => $diretoriasEncontradas->pluck('diretoria')->toArray(),
                'total_diretorias' => $diretoriasEncontradas->count(),
            ];

            // Para compatibilidade, mantém a diretoria mais comum
            if ($diretoriasEncontradas->isNotEmpty()) {
                $response['diretoria_principal'] = $diretoriasEncontradas->first()->diretoria;
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
                        // Novos campos específicos
                        'ano_numero' => $contrato->ano_numero,
                        'numero_contrato' => $contrato->numero_contrato,
                        'ano' => $contrato->ano,
                        'pa' => $contrato->pa,
                        'diretoria' => $contrato->diretoria,
                        'modalidade' => $contrato->modalidade,
                        'nome_empresa' => $contrato->nome_empresa,
                        'cnpj_empresa' => $contrato->cnpj_empresa,
                        'objeto' => $contrato->objeto,
                        'data_assinatura' => $contrato->data_assinatura,
                        'prazo' => $contrato->prazo,
                        'unidade_prazo' => $contrato->unidade_prazo,
                        'valor_contrato' => $contrato->valor_contrato,
                        'vencimento' => $contrato->vencimento,
                        'gestor_contrato' => $contrato->gestor_contrato,
                        'fiscal_tecnico' => $contrato->fiscal_tecnico,
                        'fiscal_administrativo' => $contrato->fiscal_administrativo,
                        'suplente' => $contrato->suplente,
                        // Campos legados para compatibilidade
                        'contratante' => $contrato->contratante,
                        'contratado' => $contrato->contratado,
                        'cnpj_contratado' => $contrato->cnpj_contratado,
                        'valor' => $contrato->valor,
                        'data_inicio' => $contrato->data_inicio,
                        'data_fim' => $contrato->data_fim,
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
