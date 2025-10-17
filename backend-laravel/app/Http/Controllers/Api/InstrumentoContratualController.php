<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstrumentoContratual;
use App\Models\ContratoImportado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class InstrumentoContratualController extends Controller
{
    /**
     * Listar instrumentos de um contrato
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'required|exists:contratos_importados,id',
        ]);

        $instrumentos = InstrumentoContratual::where('contrato_id', $request->contrato_id)
            ->orderBy('data_inicio', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instrumentos,
            'total' => $instrumentos->count()
        ]);
    }

    /**
     * Criar novo instrumento contratual
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'required|exists:contratos_importados,id',
            'tipo' => ['required', Rule::in(array_keys(InstrumentoContratual::TIPOS))],
            'numero' => 'required|string|max:20',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'valor' => 'required|numeric|min:0.01',
            'descricao' => 'required|string',
            'status' => ['nullable', Rule::in(array_keys(InstrumentoContratual::STATUS))],
            'observacoes' => 'nullable|string',
            'anexos' => 'nullable|array',
            'anexos.*' => 'string|url',
            'criado_por' => 'required|string|max:100',
        ]);

        // Verificar se já existe instrumento com o mesmo número para o contrato
        $instrumentoExistente = InstrumentoContratual::where('contrato_id', $request->contrato_id)
            ->where('numero', $request->numero)
            ->first();

        if ($instrumentoExistente) {
            return response()->json([
                'success' => false,
                'error' => 'Já existe um instrumento com este número para este contrato'
            ], 422);
        }

        $instrumento = InstrumentoContratual::create([
            'contrato_id' => $request->contrato_id,
            'tipo' => $request->tipo,
            'numero' => $request->numero,
            'data_inicio' => $request->data_inicio,
            'data_fim' => $request->data_fim,
            'valor' => $request->valor,
            'descricao' => $request->descricao,
            'status' => $request->status ?? 'ativo',
            'observacoes' => $request->observacoes,
            'anexos' => $request->anexos,
            'criado_por' => $request->criado_por,
        ]);

        return response()->json([
            'success' => true,
            'data' => $instrumento,
            'message' => 'Instrumento contratual criado com sucesso'
        ], 201);
    }

    /**
     * Exibir instrumento específico
     */
    public function show(InstrumentoContratual $instrumentoContratual): JsonResponse
    {
        $instrumentoContratual->load('contrato');

        return response()->json([
            'success' => true,
            'data' => $instrumentoContratual
        ]);
    }

    /**
     * Atualizar instrumento contratual
     */
    public function update(Request $request, InstrumentoContratual $instrumentoContratual): JsonResponse
    {
        $request->validate([
            'tipo' => ['nullable', Rule::in(array_keys(InstrumentoContratual::TIPOS))],
            'numero' => 'nullable|string|max:20',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
            'valor' => 'nullable|numeric|min:0.01',
            'descricao' => 'nullable|string',
            'status' => ['nullable', Rule::in(array_keys(InstrumentoContratual::STATUS))],
            'observacoes' => 'nullable|string',
            'anexos' => 'nullable|array',
            'anexos.*' => 'string|url',
            'atualizado_por' => 'required|string|max:100',
        ]);

        // Verificar se já existe instrumento com o mesmo número para o contrato (se número foi alterado)
        if ($request->has('numero') && $request->numero !== $instrumentoContratual->numero) {
            $instrumentoExistente = InstrumentoContratual::where('contrato_id', $instrumentoContratual->contrato_id)
                ->where('numero', $request->numero)
                ->where('id', '!=', $instrumentoContratual->id)
                ->first();

            if ($instrumentoExistente) {
                return response()->json([
                    'success' => false,
                    'error' => 'Já existe um instrumento com este número para este contrato'
                ], 422);
            }
        }

        $instrumentoContratual->update(array_merge(
            $request->only([
                'tipo', 'numero', 'data_inicio', 'data_fim',
                'valor', 'descricao', 'status', 'observacoes', 'anexos'
            ]),
            [
                'atualizado_por' => $request->atualizado_por,
                'atualizado_em' => now(),
            ]
        ));

        return response()->json([
            'success' => true,
            'data' => $instrumentoContratual->fresh(),
            'message' => 'Instrumento contratual atualizado com sucesso'
        ]);
    }

    /**
     * Excluir instrumento contratual
     */
    public function destroy(InstrumentoContratual $instrumentoContratual): JsonResponse
    {
        $instrumentoContratual->delete();

        return response()->json([
            'success' => true,
            'message' => 'Instrumento contratual excluído com sucesso'
        ]);
    }

    /**
     * Atualizar status do instrumento
     */
    public function updateStatus(Request $request, InstrumentoContratual $instrumentoContratual): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(array_keys(InstrumentoContratual::STATUS))],
            'atualizado_por' => 'required|string|max:100',
        ]);

        $instrumentoContratual->update([
            'status' => $request->status,
            'atualizado_por' => $request->atualizado_por,
            'atualizado_em' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $instrumentoContratual->fresh(),
            'message' => 'Status do instrumento atualizado com sucesso'
        ]);
    }

    /**
     * Listar instrumentos por tipo
     */
    public function porTipo(Request $request): JsonResponse
    {
        $request->validate([
            'tipo' => ['required', Rule::in(array_keys(InstrumentoContratual::TIPOS))],
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $query = InstrumentoContratual::where('tipo', $request->tipo);

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $instrumentos = $query->with('contrato')
            ->orderBy('data_inicio', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instrumentos,
            'total' => $instrumentos->count()
        ]);
    }

    /**
     * Listar instrumentos ativos
     */
    public function ativos(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $query = InstrumentoContratual::where('status', 'ativo');

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $instrumentos = $query->with('contrato')
            ->orderBy('data_inicio', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instrumentos,
            'total' => $instrumentos->count()
        ]);
    }

    /**
     * Listar instrumentos vigentes
     */
    public function vigentes(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $hoje = now()->toDateString();
        $query = InstrumentoContratual::where('data_inicio', '<=', $hoje)
            ->where('data_fim', '>=', $hoje);

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $instrumentos = $query->with('contrato')
            ->orderBy('data_inicio', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instrumentos,
            'total' => $instrumentos->count()
        ]);
    }

    /**
     * Listar instrumentos vencidos
     */
    public function vencidos(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $hoje = now()->toDateString();
        $query = InstrumentoContratual::where('data_fim', '<', $hoje);

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $instrumentos = $query->with('contrato')
            ->orderBy('data_fim', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instrumentos,
            'total' => $instrumentos->count()
        ]);
    }

    /**
     * Listar instrumentos próximos do vencimento
     */
    public function proximosVencimento(Request $request): JsonResponse
    {
        $request->validate([
            'dias' => 'nullable|integer|min:1|max:365',
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $dias = $request->dias ?? 30;
        $dataLimite = now()->addDays($dias)->toDateString();
        $hoje = now()->toDateString();

        $query = InstrumentoContratual::where('data_fim', '<=', $dataLimite)
            ->where('data_fim', '>=', $hoje);

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $instrumentos = $query->with('contrato')
            ->orderBy('data_fim', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instrumentos,
            'total' => $instrumentos->count(),
            'dias_verificacao' => $dias
        ]);
    }
}