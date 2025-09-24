import { useQuery, useMutation, useQueryClient } from 'react-query';
// Modo mock: sem chamadas reais à API
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
import {
  mockDashboardMetrics,
  mockOrcamento,
  mockReceitasChart,
  mockDespesasChart,
  mockExecucaoData,
  mockEscolas,
  mockAlunos,
  mockUnidadesSaude,
  mockAtendimentos,
  mockSaudeMetrics,
  mockBens,
  mockLicitacoes,
  mockPatrimonialMetrics,
  mockServidores,
  mockFolhaPagamento,
  mockRHMetrics,
  mockRelatorioFinanceiro,
  mockRelatorioTributario,
  mockRelatorioEducacao,
  mockRelatorioSaude,
} from '@/data/mockData';

// Hook para métricas do dashboard
export const useDashboardMetrics = (filters?: DashboardFilters) => {
  return useQuery(
    ['dashboard-metrics', filters],
    () => Promise.resolve(mockDashboardMetrics as DashboardMetrics),
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
    () => Promise.resolve(mockOrcamento as Orcamento),
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
    () => Promise.resolve({ data: mockOrcamento.receitas, total: 3, page: 1, per_page: 50, total_pages: 1 } as import('@/types/ecidade').PaginatedResponse<Receita>),
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
    () => Promise.resolve({ data: mockOrcamento.despesas, total: 3, page: 1, per_page: 50, total_pages: 1 } as import('@/types/ecidade').PaginatedResponse<Despesa>),
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
    () => Promise.resolve(mockReceitasChart as ChartData),
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
    () => Promise.resolve(mockDespesasChart as ChartData),
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
    () => Promise.resolve(mockExecucaoData as TimeSeriesData[]),
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
    () => Promise.resolve({ data: [], total: 0, page: 1, per_page: 50, total_pages: 0 } as import('@/types/ecidade').PaginatedResponse<IPTU>),
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
    () => Promise.resolve({ data: [], total: 0, page: 1, per_page: 50, total_pages: 0 } as import('@/types/ecidade').PaginatedResponse<ISSQN>),
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
    () => Promise.resolve(mockReceitasChart as ChartData),
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
    () => Promise.resolve(mockEscolas as Escola[]),
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
    () => Promise.resolve(mockAlunos),
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
    () => Promise.resolve({ ...{ total_escolas: 0, total_alunos: 0, total_professores: 0, total_turmas: 0 }, ... ( { total_escolas: (mockEscolas?.length || 0), total_alunos: 8500, total_professores: 650, total_turmas: 320 } ) }),
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
    () => Promise.resolve(mockUnidadesSaude as UnidadeSaude[]),
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
    () => Promise.resolve(mockAtendimentos),
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
    () => Promise.resolve(mockSaudeMetrics),
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
    () => Promise.resolve(mockBens),
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
    () => Promise.resolve(mockLicitacoes),
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
    () => Promise.resolve(mockPatrimonialMetrics),
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
    () => Promise.resolve(mockServidores),
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
    () => Promise.resolve(mockFolhaPagamento),
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
    () => Promise.resolve(mockRHMetrics),
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
    () => Promise.resolve(mockRelatorioFinanceiro),
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
    () => Promise.resolve(mockRelatorioTributario),
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
    () => Promise.resolve(mockRelatorioEducacao),
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
    () => Promise.resolve(mockRelatorioSaude),
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
    async ({ cpf, password }: { cpf: string; password: string }) => {
      // Mock de autenticação: retorna um token fake e payload mínimo
      const token = 'mock-token-123';
      return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          nome: 'Usuário Mock',
          cpf: cpf || '00000000000',
          email: 'mock@ecidade.local',
          perfil: 'admin',
          instituicao: 1,
        },
      } as any;
    },
    {
      onSuccess: (data) => {
        // no-op em modo mock; poderíamos guardar em memória/localStorage se necessário
        queryClient.invalidateQueries();
      },
    }
  );

  const logout = useMutation<void, unknown, void>(async () => {
    // no-op em modo mock
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
    async ({ endpoint, format, filters }: { 
      endpoint: string; 
      format: 'csv' | 'xlsx' | 'pdf'; 
      filters?: DashboardFilters 
    }) => {
      const content = `mock export for ${endpoint} (${format})`;
      return new Blob([content], { type: 'text/plain' });
    }
  );
};
