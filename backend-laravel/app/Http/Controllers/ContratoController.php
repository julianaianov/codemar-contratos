<?php

namespace App\Http\Controllers;

use App\Models\ContratoImportado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContratoController extends Controller
{
    /**
     * Lista todos os contratos
     */
    public function index(Request $request)
    {
        $query = ContratoImportado::query();

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('numero_contrato')) {
            $query->where('numero_contrato', 'like', '%' . $request->numero_contrato . '%');
        }

        if ($request->filled('contratado')) {
            $query->where('contratado', 'like', '%' . $request->contratado . '%');
        }

        $diretoria = trim((string) $request->get('diretoria', ''));
        if ($diretoria !== '' && strtolower($diretoria) !== 'todas') {
            $query->where(function($q) use ($diretoria) {
                $q->where('diretoria', $diretoria)
                  ->orWhere('secretaria', $diretoria);
            });
        }

        if ($request->filled('data_inicio')) {
            $query->whereDate('data_inicio', '>=', $request->data_inicio);
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data_fim', '<=', $request->data_fim);
        }

        // Ordenação
        $orderBy = $request->get('order_by', 'created_at');
        $orderDirection = $request->get('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $contratos = $query->paginate($perPage);

        return response()->json($contratos);
    }

    /**
     * Exibe um contrato específico
     */
    public function show($id)
    {
        $contrato = ContratoImportado::findOrFail($id);

        $data = $contrato->toArray();
        $orig = $contrato->dados_originais ?? [];
        if (is_array($orig) && !empty($orig)) {
            $normalized = [];
            foreach ($orig as $k => $v) {
                $nk = $this->normalizeKey($k);
                $normalized[$nk] = $v;
            }
            $fallback = function(array $keys) use ($normalized) {
                foreach ($keys as $k) {
                    $base = $this->normalizeKey($k);
                    // match exato
                    if (isset($normalized[$base]) && $normalized[$base] !== '') {
                        return is_string($normalized[$base]) ? trim($normalized[$base]) : $normalized[$base];
                    }
                    // procurar variantes com sufixo numérico e com parênteses (ex.: "fiscal tecnico 1", "fiscal tecnico (titular)")
                    foreach ($normalized as $nk => $val) {
                        if ($val === '' || $val === null) continue;
                        if (preg_match('/^'.preg_quote($base, '/').'(\n+                            s+|_)\d+$/', $nk) || preg_match('/^'.preg_quote($base, '/').'\s*\(/', $nk)) {
                            return is_string($val) ? trim($val) : $val;
                        }
                    }
                }
                return null;
            };

            // Fallbacks adicionais para campos que podem aparecer com variações
            $data['numero_contrato'] = $data['numero_contrato'] ?? $fallback(['contrato','numero','numero_contrato','nº contrato','numero contrato']);
            $data['ano_numero'] = $data['ano_numero'] ?? $fallback(['ano-nº','ano_numero','ano numero','ano-numero']);
            $data['ano'] = $data['ano'] ?? $fallback(['ano','ano contrato','ano_contrato']);
            $data['status'] = $data['status'] ?? $fallback(['status','situacao','situação']);
            $data['diretoria'] = $data['diretoria'] ?? $fallback(['diretoria requisitante','diretoria','secretaria','unidade']);
            $data['gestor_contrato'] = $data['gestor_contrato'] ?? $fallback(['gestor do contrato','gestor_contrato','gestor','responsavel','responsável']);
            $data['fiscal_tecnico'] = $data['fiscal_tecnico'] ?? $fallback(['fiscal tecnico','fiscal tecnico','fiscal_tecnico','fiscal técnico']);
            $data['fiscal_administrativo'] = $data['fiscal_administrativo'] ?? $fallback(['fiscal administrativo','fiscal administrativo','fiscal_administrativo','fiscal admin']);
            $data['suplente'] = $data['suplente'] ?? $fallback(['suplente','substituto']);
            $data['valor_contrato'] = $data['valor_contrato'] ?? $fallback(['valor do contrato','valor_contrato','valor_total','valor total','valor']);
            $data['data_assinatura'] = $data['data_assinatura'] ?? $fallback(['data da assinatura','data_assinatura','assinatura','data contrato','data_contrato']);
            $data['prazo'] = $data['prazo'] ?? $fallback(['prazo','prazo contrato','duracao','duração']);
            $data['unidade_prazo'] = $data['unidade_prazo'] ?? $fallback(['unid. prazo','unidade_prazo','unid_prazo','unidade','periodo','período']);
            $data['vencimento'] = $data['vencimento'] ?? $fallback(['vencimento','data_vencimento','data fim','data_fim','vigencia_fim']);
        }

        return response()->json($data);
    }

    /**
     * Cria um novo contrato
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'numero_contrato' => 'required|string|max:255',
            'objeto' => 'required|string',
            'contratante' => 'required|string|max:255',
            'contratado' => 'required|string|max:255',
            'cnpj_contratado' => 'nullable|string|max:18',
            'valor' => 'required|numeric|min:0',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after:data_inicio',
            'modalidade' => 'nullable|string|max:255',
            'status' => 'required|in:vigente,encerrado,suspenso,rescindido',
            'tipo_contrato' => 'nullable|string|max:255',
            'secretaria' => 'nullable|string|max:255',
            'fonte_recurso' => 'nullable|string|max:255',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $contrato = ContratoImportado::create([
            'numero_contrato' => $request->numero_contrato,
            'objeto' => $request->objeto,
            'contratante' => $request->contratante,
            'contratado' => $request->contratado,
            'cnpj_contratado' => $request->cnpj_contratado,
            'valor' => $request->valor,
            'data_inicio' => $request->data_inicio,
            'data_fim' => $request->data_fim,
            'modalidade' => $request->modalidade,
            'status' => $request->status,
            'tipo_contrato' => $request->tipo_contrato,
            'secretaria' => $request->secretaria,
            'fonte_recurso' => $request->fonte_recurso,
            'observacoes' => $request->observacoes,
            'processado' => true, // Contratos manuais são considerados processados
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contrato cadastrado com sucesso!',
            'data' => $contrato
        ], 201);
    }

    /**
     * Atualiza um contrato existente
     */
    public function update(Request $request, $id)
    {
        $contrato = ContratoImportado::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'numero_contrato' => 'sometimes|required|string|max:255',
            'objeto' => 'sometimes|required|string',
            'contratante' => 'sometimes|required|string|max:255',
            'contratado' => 'sometimes|required|string|max:255',
            'cnpj_contratado' => 'nullable|string|max:18',
            'valor' => 'sometimes|required|numeric|min:0',
            'data_inicio' => 'sometimes|required|date',
            'data_fim' => 'sometimes|required|date',
            'modalidade' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:vigente,encerrado,suspenso,rescindido',
            'tipo_contrato' => 'nullable|string|max:255',
            'secretaria' => 'nullable|string|max:255',
            'fonte_recurso' => 'nullable|string|max:255',
            'observacoes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $contrato->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Contrato atualizado com sucesso!',
            'data' => $contrato
        ]);
    }

    /**
     * Remove um contrato
     */
    public function destroy($id)
    {
        $contrato = ContratoImportado::findOrFail($id);
        $contrato->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contrato removido com sucesso!'
        ]);
    }

    /**
     * Estatísticas dos contratos
     */
    public function stats(Request $request)
    {
        $query = ContratoImportado::query();
        
        // Filtrar por diretoria se fornecido
        if ($request->has('diretoria')) {
            $query->where('secretaria', $request->diretoria);
        }

        $total = $query->count();
        $vigentes = (clone $query)->where('status', 'vigente')->count();
        $encerrados = (clone $query)->where('status', 'encerrado')->count();
        $valorTotal = (clone $query)->sum('valor');
        $valorVigentes = (clone $query)->where('status', 'vigente')->sum('valor');

        return response()->json([
            'total' => $total,
            'vigentes' => $vigentes,
            'encerrados' => $encerrados,
            'suspensos' => (clone $query)->where('status', 'suspenso')->count(),
            'rescindidos' => (clone $query)->where('status', 'rescindido')->count(),
            'valor_total' => $valorTotal,
            'valor_vigentes' => $valorVigentes,
        ]);
    }

    /**
     * Lista todas as diretorias disponíveis
     */
    public function diretorias()
    {
        $diretorias = [
            'Presidência',
            'Diretoria de Administração',
            'Diretoria Jurídica',
            'Diretoria de Assuntos Imobiliários',
            'Diretoria de Operações',
            'Diretoria de Tecnologia da Informação e Inovação',
            'Diretoria de Governança em Licitações e Contratações'
        ];

        return response()->json([
            'success' => true,
            'data' => $diretorias,
        ]);
    }
    
    private function normalizeKey(string $key): string
    {
        $key = \Illuminate\Support\Str::ascii(\Illuminate\Support\Str::lower(trim($key)));
        $key = str_replace(['.', ',', ';', ':', '\\', '/', '-', '–', '—', '_', '(', ')', '[', ']', '{', '}'], ' ', $key);
        return preg_replace('/\s+/', ' ', $key);
    }
}

