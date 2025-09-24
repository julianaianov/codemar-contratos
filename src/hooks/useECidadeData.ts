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
    () => ecidadeAPI.getDashboardMetrics(filters),
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
    () => ecidadeAPI.getOrcamento(filters),
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
    () => ecidadeAPI.getReceitasChart(filters),
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
    () => ecidadeAPI.getDespesasChart(filters),
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
    () => ecidadeAPI.getExecucaoOrcamentaria(filters),
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
