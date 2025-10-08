import axios, { AxiosInstance } from 'axios';
import { AuthService } from '@/utils/auth';
import { 
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
  TimeSeriesData,
  DashboardFilters,
  PaginatedResponse
} from '@/types/ecidade';

class ECidadeDatabaseAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return this.api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Dashboard - Métricas Gerais (conectando diretamente com PostgreSQL)
  async getDashboardMetrics(filters?: DashboardFilters): Promise<DashboardMetrics> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'dashboard/metrics',
        connection: 'portal' // Conexão com o banco do e-cidade
      },
    });
    return response.data;
  }

  // Receitas - baseado na estrutura do nova-transparencia
  async getReceitas(filters?: DashboardFilters): Promise<PaginatedResponse<Receita>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'receitas',
        connection: 'portal',
        mode: 'padrao'
      },
    });
    return response.data;
  }

  // Despesas
  async getDespesas(filters?: DashboardFilters): Promise<PaginatedResponse<Despesa>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'despesas',
        connection: 'portal',
        mode: 'padrao'
      },
    });
    return response.data;
  }

  // Contratos
  async getContratos(filters?: DashboardFilters): Promise<PaginatedResponse<any>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'contratos',
        connection: 'portal',
        mode: 'padrao'
      },
    });
    return response.data;
  }

  // Empenhos
  async getEmpenhos(filters?: DashboardFilters): Promise<PaginatedResponse<any>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'empenhos',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Folha de Pagamento
  async getFolhaPagamento(filters?: DashboardFilters): Promise<FolhaPagamento[]> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'folha-pagamento',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Dados financeiros gerais
  async getDadosFinanceiros(filters?: DashboardFilters): Promise<any> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'dados-financeiros',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Gráficos de receitas
  async getReceitasChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'receitas/chart',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Gráficos de despesas
  async getDespesasChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'despesas/chart',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Execução orçamentária
  async getExecucaoOrcamentaria(filters?: DashboardFilters): Promise<TimeSeriesData[]> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'execucao-orcamentaria',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // IPTU
  async getIPTU(filters?: DashboardFilters): Promise<PaginatedResponse<IPTU>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'iptu',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // ISSQN
  async getISSQN(filters?: DashboardFilters): Promise<PaginatedResponse<ISSQN>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'issqn',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Educação
  async getEscolas(): Promise<Escola[]> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        path: 'educacao/escolas',
        connection: 'portal'
      },
    });
    return response.data;
  }

  async getAlunos(filters?: DashboardFilters): Promise<PaginatedResponse<Aluno>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'educacao/alunos',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Saúde
  async getUnidadesSaude(): Promise<UnidadeSaude[]> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        path: 'saude/unidades',
        connection: 'portal'
      },
    });
    return response.data;
  }

  async getAtendimentos(filters?: DashboardFilters): Promise<PaginatedResponse<Atendimento>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'saude/atendimentos',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Patrimonial
  async getBens(filters?: DashboardFilters): Promise<PaginatedResponse<Bem>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'patrimonial/bens',
        connection: 'portal'
      },
    });
    return response.data;
  }

  async getLicitacoes(filters?: DashboardFilters): Promise<PaginatedResponse<Licitacao>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'patrimonial/licitacoes',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Recursos Humanos
  async getServidores(filters?: DashboardFilters): Promise<PaginatedResponse<Servidor>> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: 'recursos-humanos/servidores',
        connection: 'portal'
      },
    });
    return response.data;
  }

  // Busca geral
  async search(query: string, filters?: any): Promise<any> {
    const response = await this.api.post('/api/ecidade/database/search', {
      query,
      filters,
      connection: 'portal'
    });
    return response.data;
  }

  // Exportar dados
  async exportData(endpoint: string, format: 'csv' | 'xlsx' | 'pdf', filters?: DashboardFilters): Promise<Blob> {
    const response = await this.api.get('/api/ecidade/database', {
      params: { 
        ...(filters || {}), 
        path: `export/${endpoint}`, 
        format,
        connection: 'portal'
      },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const ecidadeDatabaseAPI = new ECidadeDatabaseAPI();



