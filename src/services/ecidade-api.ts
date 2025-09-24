import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthService } from '@/utils/auth';
import { 
  ECidadeAuthResponse, 
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
  APIResponse,
  PaginatedResponse
} from '@/types/ecidade';

class ECidadeAPI {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      // Usaremos caminhos absolutos para atingir rotas internas do Next (`/api/*`).
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      // Prioriza token salvo no AuthService (persistido) caso exista.
      const tokenFromStorage = AuthService.getToken();
      const token = this.accessToken || tokenFromStorage;
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
          // Token expirado: tenta renovar pelo endpoint interno e atualiza o header
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            this.accessToken = newToken;
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return this.api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticação
  async authenticate(cpf: string, password: string): Promise<ECidadeAuthResponse> {
    try {
      // Chama rota interna server-side que injeta client_id/secret pelo servidor
      const response = await this.api.post('/api/auth/login', {
        cpf,
        password,
      });

      this.accessToken = response.data.access_token;
      if (response.data.access_token) {
        AuthService.setToken(response.data.access_token);
      }
      if (response.data.refresh_token) {
        AuthService.setRefreshToken(response.data.refresh_token);
      }
      return response.data;
    } catch (error) {
      throw new Error('Falha na autenticação');
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const refreshToken = AuthService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token ausente');
      }
      const response = await this.api.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });

      this.accessToken = response.data.access_token;
      if (response.data.access_token) {
        AuthService.setToken(response.data.access_token);
      }
      if (response.data.refresh_token) {
        AuthService.setRefreshToken(response.data.refresh_token);
      }
    } catch (error) {
      // Redireciona para login em caso de erro
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Dashboard - Métricas Gerais
  async getDashboardMetrics(filters?: DashboardFilters): Promise<DashboardMetrics> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'dashboard/metrics' },
    });
    return response.data;
  }

  // Financeiro
  async getOrcamento(filters?: DashboardFilters): Promise<Orcamento> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'financeiro/orcamento' },
    });
    return response.data;
  }

  async getReceitas(filters?: DashboardFilters): Promise<PaginatedResponse<Receita>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'financeiro/receitas' },
    });
    return response.data;
  }

  async getDespesas(filters?: DashboardFilters): Promise<PaginatedResponse<Despesa>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'financeiro/despesas' },
    });
    return response.data;
  }

  async getReceitasChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'financeiro/receitas/chart' },
    });
    return response.data;
  }

  async getDespesasChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'financeiro/despesas/chart' },
    });
    return response.data;
  }

  async getExecucaoOrcamentaria(filters?: DashboardFilters): Promise<TimeSeriesData[]> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'financeiro/execucao-orcamentaria' },
    });
    return response.data;
  }

  // Tributário
  async getIPTU(filters?: DashboardFilters): Promise<PaginatedResponse<IPTU>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'tributario/iptu' },
    });
    return response.data;
  }

  async getISSQN(filters?: DashboardFilters): Promise<PaginatedResponse<ISSQN>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'tributario/issqn' },
    });
    return response.data;
  }

  async getArrecadacaoChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'tributario/arrecadacao/chart' },
    });
    return response.data;
  }

  // Educação
  async getEscolas(): Promise<Escola[]> {
    const response = await this.api.get('/api/ecidade', {
      params: { path: 'educacao/escolas' },
    });
    return response.data;
  }

  async getAlunos(filters?: DashboardFilters): Promise<PaginatedResponse<Aluno>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'educacao/alunos' },
    });
    return response.data;
  }

  async getEducacaoMetrics(filters?: DashboardFilters): Promise<{
    total_escolas: number;
    total_alunos: number;
    total_professores: number;
    total_turmas: number;
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'educacao/metrics' },
    });
    return response.data;
  }

  // Saúde
  async getUnidadesSaude(): Promise<UnidadeSaude[]> {
    const response = await this.api.get('/api/ecidade', {
      params: { path: 'saude/unidades' },
    });
    return response.data;
  }

  async getAtendimentos(filters?: DashboardFilters): Promise<PaginatedResponse<Atendimento>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'saude/atendimentos' },
    });
    return response.data;
  }

  async getSaudeMetrics(filters?: DashboardFilters): Promise<{
    total_unidades: number;
    total_atendimentos: number;
    total_medicos: number;
    total_enfermeiros: number;
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'saude/metrics' },
    });
    return response.data;
  }

  // Patrimonial
  async getBens(filters?: DashboardFilters): Promise<PaginatedResponse<Bem>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'patrimonial/bens' },
    });
    return response.data;
  }

  async getLicitacoes(filters?: DashboardFilters): Promise<PaginatedResponse<Licitacao>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'patrimonial/licitacoes' },
    });
    return response.data;
  }

  async getPatrimonialMetrics(filters?: DashboardFilters): Promise<{
    total_bens: number;
    valor_total_bens: number;
    total_licitacoes: number;
    valor_total_licitacoes: number;
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'patrimonial/metrics' },
    });
    return response.data;
  }

  // Recursos Humanos
  async getServidores(filters?: DashboardFilters): Promise<PaginatedResponse<Servidor>> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'recursos-humanos/servidores' },
    });
    return response.data;
  }

  async getFolhaPagamento(filters?: DashboardFilters): Promise<FolhaPagamento[]> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'recursos-humanos/folha-pagamento' },
    });
    return response.data;
  }

  async getRHMetrics(filters?: DashboardFilters): Promise<{
    total_servidores: number;
    servidores_ativos: number;
    total_folha: number;
    media_salario: number;
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'recursos-humanos/metrics' },
    });
    return response.data;
  }

  // Relatórios
  async getRelatorioFinanceiro(filters?: DashboardFilters): Promise<{
    receitas: ChartData;
    despesas: ChartData;
    execucao: TimeSeriesData[];
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'relatorios/financeiro' },
    });
    return response.data;
  }

  async getRelatorioTributario(filters?: DashboardFilters): Promise<{
    arrecadacao: ChartData;
    inadimplencia: ChartData;
    comparativo: TimeSeriesData[];
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'relatorios/tributario' },
    });
    return response.data;
  }

  async getRelatorioEducacao(filters?: DashboardFilters): Promise<{
    matriculas: ChartData;
    escolas: ChartData;
    evasao: TimeSeriesData[];
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'relatorios/educacao' },
    });
    return response.data;
  }

  async getRelatorioSaude(filters?: DashboardFilters): Promise<{
    atendimentos: ChartData;
    especialidades: ChartData;
    demanda: TimeSeriesData[];
  }> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: 'relatorios/saude' },
    });
    return response.data;
  }

  // Exportar dados
  async exportData(endpoint: string, format: 'csv' | 'xlsx' | 'pdf', filters?: DashboardFilters): Promise<Blob> {
    const response = await this.api.get('/api/ecidade', {
      params: { ...(filters || {}), path: `export/${endpoint}`, format },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const ecidadeAPI = new ECidadeAPI();

