import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ecidadeAPI } from '@/services/ecidade-api';
import { 
  DashboardFilters, 
  DashboardMetrics, 
  Orcamento, 
  Receita, 
  Despesa,
  IPTU,
  ISSQN,
  Escola,
  Aluno,
  UnidadeSaude,
  Atendimento,
  Bem,
  Licitacao,
  Servidor,
  FolhaPagamento,
  ChartData,
  TimeSeriesData
} from '@/types/ecidade';

// Hook para métricas do dashboard
export const useDashboardMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['dashboard-metrics', filters],
    () => {
      // Usar dados mockados por enquanto
      return Promise.resolve({
        receitas_totais: 2500000,
        despesas_totais: 2200000,
        saldo_orcamentario: 300000,
        percentual_execucao: 88.5,
        arrecadacao_mes: 180000,
        empenhos_mes: 195000,
        servidores_ativos: 1250,
        alunos_matriculados: 8500,
        atendimentos_saude: 3200,
        bens_patrimoniais: 4500,
      });
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );
};

// Hook para orçamento
export const useOrcamento = (filters?: DashboardFilters) => {
  return useQuery(
    ['orcamento', filters],
    () => {
      return Promise.resolve({
        receitas: [
          { id: 1, codigo: '1.1.1.01', descricao: 'IPTU', valor_previsto: 800000, valor_arrecadado: 750000, percentual: 93.75, categoria: 'Tributária', mes: 9, ano: 2024 },
          { id: 2, codigo: '1.1.1.02', descricao: 'ISSQN', valor_previsto: 600000, valor_arrecadado: 580000, percentual: 96.67, categoria: 'Tributária', mes: 9, ano: 2024 },
          { id: 3, codigo: '1.1.1.03', descricao: 'Taxas', valor_previsto: 400000, valor_arrecadado: 350000, percentual: 87.5, categoria: 'Taxas', mes: 9, ano: 2024 },
        ],
        despesas: [
          { id: 1, codigo: '3.1.1.01', descricao: 'Pessoal', valor_empenhado: 1200000, valor_liquidado: 1150000, valor_pago: 1100000, percentual: 91.67, categoria: 'Pessoal', mes: 9, ano: 2024 },
          { id: 2, codigo: '3.1.1.02', descricao: 'Educação', valor_empenhado: 400000, valor_liquidado: 380000, valor_pago: 370000, percentual: 92.5, categoria: 'Educação', mes: 9, ano: 2024 },
          { id: 3, codigo: '3.1.1.03', descricao: 'Saúde', valor_empenhado: 350000, valor_liquidado: 320000, valor_pago: 300000, percentual: 85.71, categoria: 'Saúde', mes: 9, ano: 2024 },
        ],
        saldo: 300000,
        percentual_execucao: 88.5,
      });
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para receitas
export const useReceitas = (filters?: DashboardFilters) => {
  return useQuery(
    ['receitas', filters],
    () => ecidadeAPI.getReceitas(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para despesas
export const useDespesas = (filters?: DashboardFilters) => {
  return useQuery(
    ['despesas', filters],
    () => ecidadeAPI.getDespesas(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para gráfico de receitas
export const useReceitasChart = (filters?: DashboardFilters) => {
  return useQuery(
    ['receitas-chart', filters],
    () => {
      return Promise.resolve({
        labels: ['IPTU', 'ISSQN', 'Taxas', 'Transferências', 'Outros'],
        datasets: [
          {
            label: 'Receitas por Categoria',
            data: [800000, 600000, 400000, 500000, 200000],
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
            ],
          },
        ],
      });
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para gráfico de despesas
export const useDespesasChart = (filters?: DashboardFilters) => {
  return useQuery(
    ['despesas-chart', filters],
    () => {
      return Promise.resolve({
        labels: ['Pessoal', 'Educação', 'Saúde', 'Infraestrutura', 'Outros'],
        datasets: [
          {
            label: 'Despesas por Categoria',
            data: [1200000, 400000, 350000, 200000, 50000],
            backgroundColor: [
              '#ef4444',
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
            ],
          },
        ],
      });
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para execução orçamentária
export const useExecucaoOrcamentaria = (filters?: DashboardFilters) => {
  return useQuery(
    ['execucao-orcamentaria', filters],
    () => {
      return Promise.resolve([
        { date: '2024-01-01', value: 150000 },
        { date: '2024-02-01', value: 180000 },
        { date: '2024-03-01', value: 220000 },
        { date: '2024-04-01', value: 195000 },
        { date: '2024-05-01', value: 250000 },
        { date: '2024-06-01', value: 280000 },
        { date: '2024-07-01', value: 300000 },
        { date: '2024-08-01', value: 275000 },
        { date: '2024-09-01', value: 320000 },
        { date: '2024-10-01', value: 350000 },
        { date: '2024-11-01', value: 380000 },
        { date: '2024-12-01', value: 400000 },
      ]);
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para IPTU
export const useIPTU = (filters?: DashboardFilters) => {
  return useQuery(
    ['iptu', filters],
    () => ecidadeAPI.getIPTU(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para ISSQN
export const useISSQN = (filters?: DashboardFilters) => {
  return useQuery(
    ['issqn', filters],
    () => ecidadeAPI.getISSQN(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para gráfico de arrecadação
export const useArrecadacaoChart = (filters?: DashboardFilters) => {
  return useQuery(
    ['arrecadacao-chart', filters],
    () => ecidadeAPI.getArrecadacaoChart(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para escolas
export const useEscolas = () => {
  return useQuery(
    ['escolas'],
    () => ecidadeAPI.getEscolas(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
    }
  );
};

// Hook para alunos
export const useAlunos = (filters?: DashboardFilters) => {
  return useQuery(
    ['alunos', filters],
    () => ecidadeAPI.getAlunos(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para métricas de educação
export const useEducacaoMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['educacao-metrics', filters],
    () => ecidadeAPI.getEducacaoMetrics(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para unidades de saúde
export const useUnidadesSaude = () => {
  return useQuery(
    ['unidades-saude'],
    () => ecidadeAPI.getUnidadesSaude(),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
};

// Hook para atendimentos
export const useAtendimentos = (filters?: DashboardFilters) => {
  return useQuery(
    ['atendimentos', filters],
    () => ecidadeAPI.getAtendimentos(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para métricas de saúde
export const useSaudeMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['saude-metrics', filters],
    () => ecidadeAPI.getSaudeMetrics(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para bens patrimoniais
export const useBens = (filters?: DashboardFilters) => {
  return useQuery(
    ['bens', filters],
    () => ecidadeAPI.getBens(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para licitações
export const useLicitacoes = (filters?: DashboardFilters) => {
  return useQuery(
    ['licitacoes', filters],
    () => ecidadeAPI.getLicitacoes(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para métricas patrimoniais
export const usePatrimonialMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['patrimonial-metrics', filters],
    () => ecidadeAPI.getPatrimonialMetrics(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para servidores
export const useServidores = (filters?: DashboardFilters) => {
  return useQuery(
    ['servidores', filters],
    () => ecidadeAPI.getServidores(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para folha de pagamento
export const useFolhaPagamento = (filters?: DashboardFilters) => {
  return useQuery(
    ['folha-pagamento', filters],
    () => ecidadeAPI.getFolhaPagamento(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para métricas de RH
export const useRHMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['rh-metrics', filters],
    () => ecidadeAPI.getRHMetrics(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para relatório financeiro
export const useRelatorioFinanceiro = (filters?: DashboardFilters) => {
  return useQuery(
    ['relatorio-financeiro', filters],
    () => ecidadeAPI.getRelatorioFinanceiro(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para relatório tributário
export const useRelatorioTributario = (filters?: DashboardFilters) => {
  return useQuery(
    ['relatorio-tributario', filters],
    () => ecidadeAPI.getRelatorioTributario(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para relatório de educação
export const useRelatorioEducacao = (filters?: DashboardFilters) => {
  return useQuery(
    ['relatorio-educacao', filters],
    () => ecidadeAPI.getRelatorioEducacao(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para relatório de saúde
export const useRelatorioSaude = (filters?: DashboardFilters) => {
  return useQuery(
    ['relatorio-saude', filters],
    () => ecidadeAPI.getRelatorioSaude(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Hook para autenticação
export const useAuth = () => {
  const queryClient = useQueryClient();

  const login = useMutation(
    ({ cpf, password }: { cpf: string; password: string }) =>
      ecidadeAPI.authenticate(cpf, password),
    {
      onSuccess: (data) => {
        ecidadeAPI.setAccessToken(data.access_token);
        queryClient.invalidateQueries();
      },
    }
  );

  const logout = useMutation<void, unknown, void>(async () => {
    ecidadeAPI.setAccessToken('');
    queryClient.clear();
  });

  return {
    login,
    logout,
  };
};

// Hook para exportar dados
export const useExportData = () => {
  return useMutation(
    ({ endpoint, format, filters }: { 
      endpoint: string; 
      format: 'csv' | 'xlsx' | 'pdf'; 
      filters?: DashboardFilters 
    }) => ecidadeAPI.exportData(endpoint, format, filters)
  );
};
