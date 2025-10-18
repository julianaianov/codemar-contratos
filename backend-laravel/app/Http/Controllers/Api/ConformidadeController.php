<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContratoImportado;
use App\Models\TermoContratual;
use App\Models\InstrumentoContratual;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConformidadeController extends Controller
{
    /**
     * Análise de conformidade de um contrato específico
     */
    public function contrato(Request $request, $contratoId): JsonResponse
    {
        $contrato = ContratoImportado::with(['termos', 'instrumentos'])->findOrFail($contratoId);

        // Buscar termos aprovados do contrato
        $termosAprovados = $contrato->termosAprovados()->get();

        // Classificar contrato conforme Lei 14.133/2021
        $classificacao = $contrato->getClassificacao();

        // Calcular conformidade
        $percentualAditivo = $contrato->getPercentualTotalAditivos();
        $dentroLimite = $contrato->isDentroLimiteLegal();
        $percentualRestante = $contrato->getPercentualRestante();
        $valorRestante = $contrato->getValorRestante();

        // Determinar status de conformidade
        $statusConformidade = $contrato->getStatusConformidade();

        // Análise detalhada dos termos
        $analiseTermos = $termosAprovados->map(function ($termo) {
            return [
                'id' => $termo->id,
                'tipo' => $termo->tipo,
                'numero' => $termo->numero,
                'data_criacao' => $termo->data_criacao,
                'valor_aditivo' => $termo->valor_aditivo ?? 0,
                'percentual_aditivo' => $termo->percentual_aditivo ?? 0,
                'descricao' => $termo->descricao,
                'justificativa' => $termo->justificativa,
                'status' => $termo->status,
            ];
        });

        // Recomendações
        $recomendacoes = [];

        if ($statusConformidade === 'INCONFORME') {
            $recomendacoes[] = [
                'tipo' => 'CRITICO',
                'titulo' => 'Contrato Inconforme',
                'descricao' => "O contrato ultrapassou o limite legal de {$classificacao['limite']}% para {$classificacao['descricao']}.",
                'acao' => 'Revisar termos aprovados e considerar rescisão ou renegociação.'
            ];
        } elseif ($statusConformidade === 'ATENCAO') {
            $recomendacoes[] = [
                'tipo' => 'ATENCAO',
                'titulo' => 'Próximo do Limite',
                'descricao' => "O contrato está próximo do limite legal de {$classificacao['limite']}%.",
                'acao' => 'Monitorar novos aditivos e evitar ultrapassar o limite.'
            ];
        }

        if ($percentualRestante < 5 && $percentualRestante > 0) {
            $recomendacoes[] = [
                'tipo' => 'INFO',
                'titulo' => 'Limite Restante Baixo',
                'descricao' => "Restam apenas " . number_format($percentualRestante, 1) . "% para novos aditivos.",
                'acao' => 'Planejar cuidadosamente novos aditivos.'
            ];
        }

        // Histórico de conformidade
        $historicoConformidade = $termosAprovados->map(function ($termo) use ($classificacao) {
            $percentualAcumulado = $termo->percentual_aditivo ?? 0;
            $statusHistorico = $percentualAcumulado > $classificacao['limite'] ? 'INCONFORME' :
                ($percentualAcumulado > $classificacao['limite'] * 0.8 ? 'ATENCAO' : 'CONFORME');

            return [
                'data' => $termo->data_criacao,
                'termo' => $termo->numero,
                'tipo' => $termo->tipo,
                'percentual_acumulado' => $percentualAcumulado,
                'status' => $statusHistorico
            ];
        });

        $resultado = [
            'contrato' => [
                'id' => $contrato->id,
                'numero' => $contrato->numero_contrato,
                'objeto' => $contrato->objeto,
                'valor_original' => $contrato->getValorOriginal(),
                'valor_atual' => $contrato->getValorAtual(),
                'tipo' => $contrato->tipo_contrato,
                'modalidade' => $contrato->modalidade,
                'categoria' => $contrato->categoria ?? '',
                'diretoria' => $contrato->diretoria ?? '',
                'status' => $contrato->status,
            ],

            'classificacao' => [
                'categoria' => $classificacao['categoria'],
                'limite_legal' => $classificacao['limite'],
                'descricao' => $classificacao['descricao'],
                'base_legal' => 'Lei 14.133/2021'
            ],

            'conformidade' => [
                'percentual_aditivo' => $percentualAditivo,
                'valor_aditivo_total' => $contrato->getValorTotalAditivos(),
                'dentro_limite_legal' => $dentroLimite,
                'percentual_restante' => $percentualRestante,
                'valor_restante' => $valorRestante,
                'status' => $statusConformidade,
                'margem_seguranca' => $classificacao['limite'] * 0.8
            ],

            'termos' => [
                'total' => $termosAprovados->count(),
                'analise' => $analiseTermos
            ],

            'recomendacoes' => $recomendacoes,
            'historico_conformidade' => $historicoConformidade,

            'estatisticas' => [
                'quantidade_aditivos' => $contrato->quantidade_aditivos ?? 0,
                'quantidade_apostilamentos' => $contrato->quantidade_apostilamentos ?? 0,
                'quantidade_rescisoes' => $contrato->quantidade_rescisoes ?? 0,
                'ultimo_termo' => $termosAprovados->first()?->data_criacao
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $resultado
        ]);
    }

    /**
     * Estatísticas gerais de conformidade
     */
    public function estatisticas(Request $request): JsonResponse
    {
        $contratos = ContratoImportado::all();

        $estatisticas = [
            'total_contratos' => $contratos->count(),
            'contratos_conformes' => 0,
            'contratos_atencao' => 0,
            'contratos_inconformes' => 0,
            'percentual_conformidade' => 0,

            // Por classificação
            'contratos_reforma_equipamento' => 0,
            'contratos_obras_servicos' => 0,
            'contratos_sociedade_mista' => 0,

            // Valores por classificação
            'valor_reforma_equipamento' => 0,
            'valor_obras_servicos' => 0,
            'valor_sociedade_mista' => 0,

            // Valores totais
            'valor_total_original' => 0,
            'valor_total_atual' => 0,
            'valor_total_aditivos' => 0,
            'percentual_medio_aditivo' => 0,
        ];

        $totalPercentualAditivo = 0;

        foreach ($contratos as $contrato) {
            $classificacao = $contrato->getClassificacao();
            $statusConformidade = $contrato->getStatusConformidade();
            $valorOriginal = $contrato->getValorOriginal();

            // Contar por status de conformidade
            switch ($statusConformidade) {
                case 'CONFORME':
                    $estatisticas['contratos_conformes']++;
                    break;
                case 'ATENCAO':
                    $estatisticas['contratos_atencao']++;
                    break;
                case 'INCONFORME':
                    $estatisticas['contratos_inconformes']++;
                    break;
            }

            // Contar por classificação
            switch ($classificacao['categoria']) {
                case 'REFORMA_EQUIPAMENTO':
                    $estatisticas['contratos_reforma_equipamento']++;
                    $estatisticas['valor_reforma_equipamento'] += $valorOriginal;
                    break;
                case 'OBRAS_SERVICOS_COMPRAS':
                    $estatisticas['contratos_obras_servicos']++;
                    $estatisticas['valor_obras_servicos'] += $valorOriginal;
                    break;
                case 'SOCIEDADE_MISTA':
                    $estatisticas['contratos_sociedade_mista']++;
                    $estatisticas['valor_sociedade_mista'] += $valorOriginal;
                    break;
            }

            // Valores totais
            $estatisticas['valor_total_original'] += $valorOriginal;
            $estatisticas['valor_total_atual'] += $contrato->getValorAtual();
            $estatisticas['valor_total_aditivos'] += $contrato->getValorTotalAditivos();
            $totalPercentualAditivo += $contrato->getPercentualTotalAditivos();
        }

        // Calcular percentual de conformidade
        if ($estatisticas['total_contratos'] > 0) {
            $estatisticas['percentual_conformidade'] = round(
                ($estatisticas['contratos_conformes'] / $estatisticas['total_contratos']) * 100,
                2
            );
            $estatisticas['percentual_medio_aditivo'] = round(
                $totalPercentualAditivo / $estatisticas['total_contratos'],
                2
            );
        }

        return response()->json([
            'success' => true,
            'data' => $estatisticas
        ]);
    }

    /**
     * Listar contratos por status de conformidade
     */
    public function porStatus(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:CONFORME,ATENCAO,INCONFORME',
            'limit' => 'nullable|integer|min:1|max:1000',
            'offset' => 'nullable|integer|min:0',
        ]);

        $limit = $request->limit ?? 50;
        $offset = $request->offset ?? 0;
        $status = $request->status;

        $contratos = ContratoImportado::all()->filter(function ($contrato) use ($status) {
            return $contrato->getStatusConformidade() === $status;
        })->slice($offset, $limit)->values();

        $contratosComConformidade = $contratos->map(function ($contrato) {
            $classificacao = $contrato->getClassificacao();
            return [
                'id' => $contrato->id,
                'numero' => $contrato->numero_contrato,
                'objeto' => $contrato->objeto,
                'valor_original' => $contrato->getValorOriginal(),
                'valor_atual' => $contrato->getValorAtual(),
                'percentual_aditivo' => $contrato->getPercentualTotalAditivos(),
                'valor_aditivo_total' => $contrato->getValorTotalAditivos(),
                'quantidade_aditivos' => $contrato->quantidade_aditivos ?? 0,
                'tipo_contrato' => $contrato->tipo_contrato,
                'modalidade' => $contrato->modalidade,
                'categoria' => $contrato->categoria ?? '',
                'diretoria' => $contrato->diretoria ?? '',
                'status' => $contrato->status,
                'data_inicio' => $contrato->data_inicio,
                'data_fim' => $contrato->data_fim,
                'data_vigencia' => $contrato->data_vigencia,
                'data_execucao' => $contrato->data_execucao,

                // Análise de conformidade
                'classificacao_contrato' => $classificacao['categoria'],
                'limite_legal' => $classificacao['limite'],
                'descricao_classificacao' => $classificacao['descricao'],
                'dentro_limite_legal' => $contrato->isDentroLimiteLegal(),
                'percentual_restante' => $contrato->getPercentualRestante(),
                'valor_restante' => $contrato->getValorRestante(),
                'status_conformidade' => $contrato->getStatusConformidade(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $contratosComConformidade,
            'total' => $contratosComConformidade->count(),
            'status' => $status,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * Listar contratos por classificação
     */
    public function porClassificacao(Request $request): JsonResponse
    {
        $request->validate([
            'categoria' => 'required|in:REFORMA_EQUIPAMENTO,OBRAS_SERVICOS_COMPRAS,SOCIEDADE_MISTA,DEFAULT',
            'limit' => 'nullable|integer|min:1|max:1000',
            'offset' => 'nullable|integer|min:0',
        ]);

        $limit = $request->limit ?? 50;
        $offset = $request->offset ?? 0;
        $categoria = $request->categoria;

        $contratos = ContratoImportado::all()->filter(function ($contrato) use ($categoria) {
            return $contrato->getClassificacao()['categoria'] === $categoria;
        })->slice($offset, $limit)->values();

        $contratosComConformidade = $contratos->map(function ($contrato) {
            $classificacao = $contrato->getClassificacao();
            return [
                'id' => $contrato->id,
                'numero' => $contrato->numero_contrato,
                'objeto' => $contrato->objeto,
                'valor_original' => $contrato->getValorOriginal(),
                'valor_atual' => $contrato->getValorAtual(),
                'percentual_aditivo' => $contrato->getPercentualTotalAditivos(),
                'valor_aditivo_total' => $contrato->getValorTotalAditivos(),
                'quantidade_aditivos' => $contrato->quantidade_aditivos ?? 0,
                'tipo_contrato' => $contrato->tipo_contrato,
                'modalidade' => $contrato->modalidade,
                'categoria' => $contrato->categoria ?? '',
                'diretoria' => $contrato->diretoria ?? '',
                'status' => $contrato->status,
                'data_inicio' => $contrato->data_inicio,
                'data_fim' => $contrato->data_fim,
                'data_vigencia' => $contrato->data_vigencia,
                'data_execucao' => $contrato->data_execucao,

                // Análise de conformidade
                'classificacao_contrato' => $classificacao['categoria'],
                'limite_legal' => $classificacao['limite'],
                'descricao_classificacao' => $classificacao['descricao'],
                'dentro_limite_legal' => $contrato->isDentroLimiteLegal(),
                'percentual_restante' => $contrato->getPercentualRestante(),
                'valor_restante' => $contrato->getValorRestante(),
                'status_conformidade' => $contrato->getStatusConformidade(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $contratosComConformidade,
            'total' => $contratosComConformidade->count(),
            'categoria' => $categoria,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * Verificar conformidade de um aditivo específico
     */
    public function verificarAditivo(Request $request): JsonResponse
    {
        $request->validate([
            'contrato_id' => 'required|exists:contratos_importados,id',
            'valor_aditivo' => 'required|numeric|min:0.01',
        ]);

        $contrato = ContratoImportado::findOrFail($request->contrato_id);
        $valorAditivo = $request->valor_aditivo;

        // Classificar contrato
        $classificacao = $contrato->getClassificacao();

        // Calcular percentual
        $percentual = ($valorAditivo / $contrato->valor_contrato) * 100;

        // Verificar se está dentro do limite
        $dentroLimite = $percentual <= $classificacao['limite'];

        // Determinar status
        if ($percentual > $classificacao['limite']) {
            $statusConformidade = 'INCONFORME';
        } elseif ($percentual > $classificacao['limite'] * 0.8) {
            $statusConformidade = 'ATENCAO';
        } else {
            $statusConformidade = 'CONFORME';
        }

        $resultado = [
            'classificacao' => $classificacao,
            'percentual_aditivo' => $percentual,
            'dentro_limite_legal' => $dentroLimite,
            'status_conformidade' => $statusConformidade,
            'percentual_restante' => max(0, $classificacao['limite'] - $percentual),
            'valor_restante' => ($contrato->valor_contrato * max(0, $classificacao['limite'] - $percentual)) / 100,
            'valor_original_contrato' => $contrato->valor_contrato,
            'valor_aditivo_solicitado' => $valorAditivo,
        ];

        return response()->json([
            'success' => true,
            'data' => $resultado
        ]);
    }

    /**
     * Dados para Power BI (equivalente ao endpoint Supabase)
     */
    public function powerBI(Request $request): JsonResponse
    {
        $request->validate([
            'diretoria' => 'nullable|string',
            'ano' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);

        $query = ContratoImportado::query();

        // Aplicar filtros
        if ($request->has('diretoria')) {
            $query->where('diretoria', $request->diretoria);
        }

        if ($request->has('ano')) {
            $query->where('ano', $request->ano);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $contratos = $query->orderBy('numero_contrato', 'asc')->get();

        // Transformar dados para formato Power BI com análise de conformidade
        $dadosPowerBI = $contratos->map(function ($contrato) {
            $valorOriginal = $contrato->valor_contrato ?? 0;
            $valorAtual = $contrato->getValorAtual();
            $percentualAditivo = $contrato->getPercentualTotalAditivos();
            $valorAditivoTotal = $contrato->getValorTotalAditivos();
            
            // Classificar contrato conforme Lei 14.133/2021
            $classificacao = $contrato->getClassificacao();
            
            // Calcular conformidade
            $dentroLimite = $contrato->isDentroLimiteLegal();
            $percentualRestante = $contrato->getPercentualRestante();
            $valorRestante = $contrato->getValorRestante();
            
            // Determinar status de conformidade
            $statusConformidade = $contrato->getStatusConformidade();
            
            return [
                'id' => $contrato->id,
                'numero' => $contrato->numero_contrato ?? '',
                'objeto' => $contrato->objeto ?? '',
                'valor_original' => $valorOriginal,
                'valor_atual' => $valorAtual,
                'percentual_aditivo' => $percentualAditivo,
                'valor_aditivo_total' => $valorAditivoTotal,
                'quantidade_aditivos' => $contrato->quantidade_aditivos ?? 0,
                'data_inicio' => $contrato->data_inicio?->format('Y-m-d') ?? '',
                'data_fim' => $contrato->data_fim?->format('Y-m-d') ?? '',
                'fornecedor' => $contrato->contratado ?? '',
                'diretoria' => $contrato->diretoria ?? '',
                'status' => $contrato->status ?? '',
                'tipo' => $contrato->tipo_contrato ?? '',
                'modalidade' => $contrato->modalidade ?? '',
                'categoria' => $contrato->categoria ?? '',
                'data_vigencia' => $contrato->data_vigencia?->format('Y-m-d') ?? '',
                'data_execucao' => $contrato->data_execucao?->format('Y-m-d'),
                
                // Campos de análise de conformidade
                'classificacao_contrato' => $classificacao['categoria'],
                'limite_legal' => $classificacao['limite'],
                'descricao_classificacao' => $classificacao['descricao'],
                'dentro_limite_legal' => $dentroLimite,
                'percentual_restante' => $percentualRestante,
                'valor_restante' => $valorRestante,
                'status_conformidade' => $statusConformidade
            ];
        });

        // Calcular estatísticas gerais
        $estatisticas = [
            'total_contratos' => $dadosPowerBI->count(),
            'valor_total_original' => $dadosPowerBI->sum('valor_original'),
            'valor_total_atual' => $dadosPowerBI->sum('valor_atual'),
            'valor_total_aditivos' => $dadosPowerBI->sum('valor_aditivo_total'),
            'percentual_medio_aditivo' => $dadosPowerBI->count() > 0 
                ? $dadosPowerBI->avg('percentual_aditivo') 
                : 0,
            'contratos_com_aditivo' => $dadosPowerBI->where('quantidade_aditivos', '>', 0)->count(),
            'contratos_sem_aditivo' => $dadosPowerBI->where('quantidade_aditivos', 0)->count(),
            'maior_aditivo' => $dadosPowerBI->max('percentual_aditivo') ?? 0,
            'menor_aditivo' => $dadosPowerBI->min('percentual_aditivo') ?? 0,
            
            // Estatísticas de conformidade
            'contratos_conformes' => $dadosPowerBI->where('status_conformidade', 'CONFORME')->count(),
            'contratos_atencao' => $dadosPowerBI->where('status_conformidade', 'ATENCAO')->count(),
            'contratos_inconformes' => $dadosPowerBI->where('status_conformidade', 'INCONFORME')->count(),
            'percentual_conformidade' => $dadosPowerBI->count() > 0 
                ? ($dadosPowerBI->where('status_conformidade', 'CONFORME')->count() / $dadosPowerBI->count()) * 100 
                : 0,
            
            // Estatísticas por classificação
            'contratos_reforma_equipamento' => $dadosPowerBI->where('classificacao_contrato', 'REFORMA_EQUIPAMENTO')->count(),
            'contratos_obras_servicos' => $dadosPowerBI->where('classificacao_contrato', 'OBRAS_SERVICOS_COMPRAS')->count(),
            'contratos_sociedade_mista' => $dadosPowerBI->where('classificacao_contrato', 'SOCIEDADE_MISTA')->count(),
            
            // Valores por classificação
            'valor_reforma_equipamento' => $dadosPowerBI
                ->where('classificacao_contrato', 'REFORMA_EQUIPAMENTO')
                ->sum('valor_original'),
            'valor_obras_servicos' => $dadosPowerBI
                ->where('classificacao_contrato', 'OBRAS_SERVICOS_COMPRAS')
                ->sum('valor_original'),
            'valor_sociedade_mista' => $dadosPowerBI
                ->where('classificacao_contrato', 'SOCIEDADE_MISTA')
                ->sum('valor_original')
        ];

        return response()->json([
            'success' => true,
            'data' => $dadosPowerBI,
            'estatisticas' => $estatisticas,
            'filtros_aplicados' => [
                'diretoria' => $request->diretoria,
                'ano' => $request->ano,
                'status' => $request->status
            ],
            'total_registros' => $dadosPowerBI->count()
        ]);
    }
}