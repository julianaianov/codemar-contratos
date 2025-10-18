<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TermoContratual;
use App\Models\ContratoImportado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class TermoContratualController extends Controller
{
    /**
     * Listar termos de um contrato
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'required|exists:contratos_importados,id',
        ]);

        $termos = TermoContratual::where('contrato_id', $request->contrato_id)
            ->orderBy('data_criacao', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $termos,
            'total' => $termos->count()
        ]);
    }

    /**
     * Criar novo termo contratual
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'required|exists:contratos_importados,id',
            'tipo' => ['required', Rule::in(array_keys(TermoContratual::TIPOS))],
            'numero' => 'required|string|max:20',
            'data_vigencia' => 'required|date',
            'data_execucao' => 'nullable|date|after_or_equal:data_vigencia',
            'valor_original' => 'nullable|numeric|min:0',
            'valor_aditivo' => 'nullable|numeric|min:0',
            'percentual_aditivo' => 'nullable|numeric|min:0|max:100',
            'descricao' => 'required|string',
            'justificativa' => 'required|string',
            'status' => ['nullable', Rule::in(array_keys(TermoContratual::STATUS))],
            'empenho_id' => 'nullable|string|max:50',
            'empenho_numero' => 'nullable|string|max:50',
            'observacoes' => 'nullable|string',
            'anexos' => 'nullable|array',
            'anexos.*' => 'string|url',
            'criado_por' => 'required|string|max:100',
        ]);

        // Buscar dados do contrato para validações
        $contrato = ContratoImportado::findOrFail($request->contrato_id);

        // Verificar se já existe termo com o mesmo número para o contrato
        $termoExistente = TermoContratual::where('contrato_id', $request->contrato_id)
            ->where('numero', $request->numero)
            ->first();

        if ($termoExistente) {
            return response()->json([
                'success' => false,
                'error' => 'Já existe um termo com este número para este contrato'
            ], 422);
        }

        // Validação específica para aditivos
        if ($request->tipo === 'aditivo') {
            if (!$request->valor_aditivo || $request->valor_aditivo <= 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Valor do aditivo é obrigatório'
                ], 422);
            }

            // Verificar limite de aditivo conforme Lei 14.133/2021
            $classificacao = $contrato->getClassificacao();
            $limite = $classificacao['limite'];
            $percentual = ($request->valor_aditivo / $contrato->valor_contrato) * 100;

            if ($percentual > $limite) {
                return response()->json([
                    'success' => false,
                    'error' => "Aditivo acima do limite legal ({$limite}%) para {$classificacao['descricao']}"
                ], 422);
            }
        }

        $termo = TermoContratual::create([
            'contrato_id' => $request->contrato_id,
            'tipo' => $request->tipo,
            'numero' => $request->numero,
            'data_vigencia' => $request->data_vigencia,
            'data_execucao' => $request->data_execucao,
            'valor_original' => $request->valor_original ?? 0,
            'valor_aditivo' => $request->valor_aditivo,
            'percentual_aditivo' => $request->percentual_aditivo,
            'descricao' => $request->descricao,
            'justificativa' => $request->justificativa,
            'status' => $request->status ?? 'pendente',
            'empenho_id' => $request->empenho_id,
            'empenho_numero' => $request->empenho_numero,
            'observacoes' => $request->observacoes,
            'anexos' => $request->anexos,
            'criado_por' => $request->criado_por,
        ]);

        return response()->json([
            'success' => true,
            'data' => $termo,
            'message' => 'Termo contratual criado com sucesso'
        ], 201);
    }

    /**
     * Exibir termo específico
     */
    public function show(TermoContratual $termoContratual): JsonResponse
    {
        $termoContratual->load('contrato');

        return response()->json([
            'success' => true,
            'data' => $termoContratual
        ]);
    }

    /**
     * Atualizar termo contratual
     */
    public function update(Request $request, TermoContratual $termoContratual): JsonResponse
    {
        $request->validate([
            'tipo' => ['nullable', Rule::in(array_keys(TermoContratual::TIPOS))],
            'numero' => 'nullable|string|max:20',
            'data_vigencia' => 'nullable|date',
            'data_execucao' => 'nullable|date|after_or_equal:data_vigencia',
            'valor_original' => 'nullable|numeric|min:0',
            'valor_aditivo' => 'nullable|numeric|min:0',
            'percentual_aditivo' => 'nullable|numeric|min:0|max:100',
            'descricao' => 'nullable|string',
            'justificativa' => 'nullable|string',
            'status' => ['nullable', Rule::in(array_keys(TermoContratual::STATUS))],
            'empenho_id' => 'nullable|string|max:50',
            'empenho_numero' => 'nullable|string|max:50',
            'observacoes' => 'nullable|string',
            'anexos' => 'nullable|array',
            'anexos.*' => 'string|url',
            'atualizado_por' => 'required|string|max:100',
        ]);

        // Verificar se já existe termo com o mesmo número para o contrato (se número foi alterado)
        if ($request->has('numero') && $request->numero !== $termoContratual->numero) {
            $termoExistente = TermoContratual::where('contrato_id', $termoContratual->contrato_id)
                ->where('numero', $request->numero)
                ->where('id', '!=', $termoContratual->id)
                ->first();

            if ($termoExistente) {
                return response()->json([
                    'success' => false,
                    'error' => 'Já existe um termo com este número para este contrato'
                ], 422);
            }
        }

        // Validação específica para aditivos
        if (($request->tipo ?? $termoContratual->tipo) === 'aditivo') {
            $valorAditivo = $request->valor_aditivo ?? $termoContratual->valor_aditivo;
            
            if (!$valorAditivo || $valorAditivo <= 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Valor do aditivo é obrigatório'
                ], 422);
            }

            // Verificar limite de aditivo conforme Lei 14.133/2021
            $contrato = $termoContratual->contrato;
            $classificacao = $contrato->getClassificacao();
            $limite = $classificacao['limite'];
            $percentual = ($valorAditivo / $contrato->valor_contrato) * 100;

            if ($percentual > $limite) {
                return response()->json([
                    'success' => false,
                    'error' => "Aditivo acima do limite legal ({$limite}%) para {$classificacao['descricao']}"
                ], 422);
            }
        }

        $termoContratual->update(array_merge(
            $request->only([
                'tipo', 'numero', 'data_vigencia', 'data_execucao',
                'valor_original', 'valor_aditivo', 'percentual_aditivo',
                'descricao', 'justificativa', 'status',
                'empenho_id', 'empenho_numero', 'observacoes', 'anexos'
            ]),
            [
                'atualizado_por' => $request->atualizado_por,
                'atualizado_em' => now(),
            ]
        ));

        return response()->json([
            'success' => true,
            'data' => $termoContratual->fresh(),
            'message' => 'Termo contratual atualizado com sucesso'
        ]);
    }

    /**
     * Excluir termo contratual
     */
    public function destroy(TermoContratual $termoContratual): JsonResponse
    {
        $termoContratual->delete();

        return response()->json([
            'success' => true,
            'message' => 'Termo contratual excluído com sucesso'
        ]);
    }

    /**
     * Atualizar status do termo
     */
    public function updateStatus(Request $request, TermoContratual $termoContratual): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(array_keys(TermoContratual::STATUS))],
            'atualizado_por' => 'required|string|max:100',
        ]);

        $termoContratual->update([
            'status' => $request->status,
            'atualizado_por' => $request->atualizado_por,
            'atualizado_em' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $termoContratual->fresh(),
            'message' => 'Status do termo atualizado com sucesso'
        ]);
    }

    /**
     * Listar termos por tipo
     */
    public function porTipo(Request $request): JsonResponse
    {
        $request->validate([
            'tipo' => ['required', Rule::in(array_keys(TermoContratual::TIPOS))],
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $query = TermoContratual::where('tipo', $request->tipo);

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $termos = $query->with('contrato')
            ->orderBy('data_criacao', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $termos,
            'total' => $termos->count()
        ]);
    }

    /**
     * Listar termos aprovados
     */
    public function aprovados(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'nullable|exists:contratos_importados,id',
        ]);

        $query = TermoContratual::where('status', 'aprovado');

        if ($request->has('contrato_id')) {
            $query->where('contrato_id', $request->contrato_id);
        }

        $termos = $query->with('contrato')
            ->orderBy('data_criacao', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $termos,
            'total' => $termos->count()
        ]);
    }
}