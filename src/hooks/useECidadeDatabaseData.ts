import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ecidadeDatabaseAPI } from '@/services/ecidade-database-api';
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

// Hook para métricas do dashboard (conectando com banco real)
export const useDashboardMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['dashboard-metrics', filters],
    () => ecidadeDatabaseAPI.getDashboardMetrics(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para receitas (dados reais do banco)
export const useReceitas = (filters?: DashboardFilters) => {
  return useQuery(
    ['receitas', filters],
    () => ecidadeDatabaseAPI.getReceitas(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para despesas (dados reais do banco)
export const useDespesas = (filters?: DashboardFilters) => {
  return useQuery(
    ['despesas', filters],
    () => ecidadeDatabaseAPI.getDespesas(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para contratos (dados reais do banco)
export const useContratos = (filters?: DashboardFilters) => {
  return useQuery(
    ['contratos', filters],
    () => ecidadeDatabaseAPI.getContratos(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para empenhos (dados reais do banco)
export const useEmpenhos = (filters?: DashboardFilters) => {
  return useQuery(
    ['empenhos', filters],
    () => ecidadeDatabaseAPI.getEmpenhos(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para folha de pagamento (dados reais do banco)
export const useFolhaPagamento = (filters?: DashboardFilters) => {
  return useQuery(
    ['folha-pagamento', filters],
    () => ecidadeDatabaseAPI.getFolhaPagamento(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para dados financeiros gerais
export const useDadosFinanceiros = (filters?: DashboardFilters) => {
  return useQuery(
    ['dados-financeiros', filters],
    () => ecidadeDatabaseAPI.getDadosFinanceiros(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para gráfico de receitas (dados reais)
export const useReceitasChart = (filters?: DashboardFilters) => {
  return useQuery(
    ['receitas-chart', filters],
    () => ecidadeDatabaseAPI.getReceitasChart(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para gráfico de despesas (dados reais)
export const useDespesasChart = (filters?: DashboardFilters) => {
  return useQuery(
    ['despesas-chart', filters],
    () => ecidadeDatabaseAPI.getDespesasChart(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para execução orçamentária (dados reais)
export const useExecucaoOrcamentaria = (filters?: DashboardFilters) => {
  return useQuery(
    ['execucao-orcamentaria', filters],
    () => ecidadeDatabaseAPI.getExecucaoOrcamentaria(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para IPTU (dados reais)
export const useIPTU = (filters?: DashboardFilters) => {
  return useQuery(
    ['iptu', filters],
    () => ecidadeDatabaseAPI.getIPTU(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para ISSQN (dados reais)
export const useISSQN = (filters?: DashboardFilters) => {
  return useQuery(
    ['issqn', filters],
    () => ecidadeDatabaseAPI.getISSQN(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para escolas (dados reais)
export const useEscolas = () => {
  return useQuery(
    ['escolas'],
    () => ecidadeDatabaseAPI.getEscolas(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para alunos (dados reais)
export const useAlunos = (filters?: DashboardFilters) => {
  return useQuery(
    ['alunos', filters],
    () => ecidadeDatabaseAPI.getAlunos(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para unidades de saúde (dados reais)
export const useUnidadesSaude = () => {
  return useQuery(
    ['unidades-saude'],
    () => ecidadeDatabaseAPI.getUnidadesSaude(),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para atendimentos (dados reais)
export const useAtendimentos = (filters?: DashboardFilters) => {
  return useQuery(
    ['atendimentos', filters],
    () => ecidadeDatabaseAPI.getAtendimentos(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para bens patrimoniais (dados reais)
export const useBens = (filters?: DashboardFilters) => {
  return useQuery(
    ['bens', filters],
    () => ecidadeDatabaseAPI.getBens(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para licitações (dados reais)
export const useLicitacoes = (filters?: DashboardFilters) => {
  return useQuery(
    ['licitacoes', filters],
    () => ecidadeDatabaseAPI.getLicitacoes(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para servidores (dados reais)
export const useServidores = (filters?: DashboardFilters) => {
  return useQuery(
    ['servidores', filters],
    () => ecidadeDatabaseAPI.getServidores(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 1000,
    }
  );
};

// Hook para busca geral
export const useSearch = () => {
  return useMutation(
    async ({ query, filters }: { query: string; filters?: any }) => {
      return ecidadeDatabaseAPI.search(query, filters);
    }
  );
};

// Hook para exportar dados
export const useExportData = () => {
  return useMutation(
    async ({ endpoint, format, filters }: { 
      endpoint: string; 
      format: 'csv' | 'xlsx' | 'pdf'; 
      filters?: DashboardFilters 
    }) => {
      return ecidadeDatabaseAPI.exportData(endpoint, format, filters);
    }
  );
};
