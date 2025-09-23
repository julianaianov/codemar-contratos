import axios, { AxiosInstance, AxiosResponse } from 'axios';
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
      baseURL: process.env.NEXT_PUBLIC_ECIDADE_API_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado, tentar renovar
          await this.refreshToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticação
  async authenticate(cpf: string, password: string): Promise<ECidadeAuthResponse> {
    try {
      const response = await this.api.post('/auth/login', {
        cpf,
        password,
        client_id: process.env.NEXT_PUBLIC_ECIDADE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_ECIDADE_CLIENT_SECRET,
      });

      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      throw new Error('Falha na autenticação');
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const response = await this.api.post('/auth/refresh', {
        client_id: process.env.NEXT_PUBLIC_ECIDADE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_ECIDADE_CLIENT_SECRET,
      });

      this.accessToken = response.data.access_token;
    } catch (error) {
      // Redirecionar para login
      window.location.href = '/login';
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Dashboard - Métricas Gerais
  async getDashboardMetrics(filters?: DashboardFilters): Promise<DashboardMetrics> {
    const response = await this.api.get('/dashboard/metrics', {
      params: filters,
    });
    return response.data;
  }

  // Financeiro
  async getOrcamento(filters?: DashboardFilters): Promise<Orcamento> {
    const response = await this.api.get('/financeiro/orcamento', {
      params: filters,
    });
    return response.data;
  }

  async getReceitas(filters?: DashboardFilters): Promise<PaginatedResponse<Receita>> {
    const response = await this.api.get('/financeiro/receitas', {
      params: filters,
    });
    return response.data;
  }

  async getDespesas(filters?: DashboardFilters): Promise<PaginatedResponse<Despesa>> {
    const response = await this.api.get('/financeiro/despesas', {
      params: filters,
    });
    return response.data;
  }

  async getReceitasChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/financeiro/receitas/chart', {
      params: filters,
    });
    return response.data;
  }

  async getDespesasChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/financeiro/despesas/chart', {
      params: filters,
    });
    return response.data;
  }

  async getExecucaoOrcamentaria(filters?: DashboardFilters): Promise<TimeSeriesData[]> {
    const response = await this.api.get('/financeiro/execucao-orcamentaria', {
      params: filters,
    });
    return response.data;
  }

  // Tributário
  async getIPTU(filters?: DashboardFilters): Promise<PaginatedResponse<IPTU>> {
    const response = await this.api.get('/tributario/iptu', {
      params: filters,
    });
    return response.data;
  }

  async getISSQN(filters?: DashboardFilters): Promise<PaginatedResponse<ISSQN>> {
    const response = await this.api.get('/tributario/issqn', {
      params: filters,
    });
    return response.data;
  }

  async getArrecadacaoChart(filters?: DashboardFilters): Promise<ChartData> {
    const response = await this.api.get('/tributario/arrecadacao/chart', {
      params: filters,
    });
    return response.data;
  }

  // Educação
  async getEscolas(): Promise<Escola[]> {
    const response = await this.api.get('/educacao/escolas');
    return response.data;
  }

  async getAlunos(filters?: DashboardFilters): Promise<PaginatedResponse<Aluno>> {
    const response = await this.api.get('/educacao/alunos', {
      params: filters,
    });
    return response.data;
  }

  async getEducacaoMetrics(filters?: DashboardFilters): Promise<{
    total_escolas: number;
    total_alunos: number;
    total_professores: number;
    total_turmas: number;
  }> {
    const response = await this.api.get('/educacao/metrics', {
      params: filters,
    });
    return response.data;
  }

  // Saúde
  async getUnidadesSaude(): Promise<UnidadeSaude[]> {
    const response = await this.api.get('/saude/unidades');
    return response.data;
  }

  async getAtendimentos(filters?: DashboardFilters): Promise<PaginatedResponse<Atendimento>> {
    const response = await this.api.get('/saude/atendimentos', {
      params: filters,
    });
    return response.data;
  }

  async getSaudeMetrics(filters?: DashboardFilters): Promise<{
    total_unidades: number;
    total_atendimentos: number;
    total_medicos: number;
    total_enfermeiros: number;
  }> {
    const response = await this.api.get('/saude/metrics', {
      params: filters,
    });
    return response.data;
  }

  // Patrimonial
  async getBens(filters?: DashboardFilters): Promise<PaginatedResponse<Bem>> {
    const response = await this.api.get('/patrimonial/bens', {
      params: filters,
    });
    return response.data;
  }

  async getLicitacoes(filters?: DashboardFilters): Promise<PaginatedResponse<Licitacao>> {
    const response = await this.api.get('/patrimonial/licitacoes', {
      params: filters,
    });
    return response.data;
  }

  async getPatrimonialMetrics(filters?: DashboardFilters): Promise<{
    total_bens: number;
    valor_total_bens: number;
    total_licitacoes: number;
    valor_total_licitacoes: number;
  }> {
    const response = await this.api.get('/patrimonial/metrics', {
      params: filters,
    });
    return response.data;
  }

  // Recursos Humanos
  async getServidores(filters?: DashboardFilters): Promise<PaginatedResponse<Servidor>> {
    const response = await this.api.get('/recursos-humanos/servidores', {
      params: filters,
    });
    return response.data;
  }

  async getFolhaPagamento(filters?: DashboardFilters): Promise<FolhaPagamento[]> {
    const response = await this.api.get('/recursos-humanos/folha-pagamento', {
      params: filters,
    });
    return response.data;
  }

  async getRHMetrics(filters?: DashboardFilters): Promise<{
    total_servidores: number;
    servidores_ativos: number;
    total_folha: number;
    media_salario: number;
  }> {
    const response = await this.api.get('/recursos-humanos/metrics', {
      params: filters,
    });
    return response.data;
  }

  // Relatórios
  async getRelatorioFinanceiro(filters?: DashboardFilters): Promise<{
    receitas: ChartData;
    despesas: ChartData;
    execucao: TimeSeriesData[];
  }> {
    const response = await this.api.get('/relatorios/financeiro', {
      params: filters,
    });
    return response.data;
  }

  async getRelatorioTributario(filters?: DashboardFilters): Promise<{
    arrecadacao: ChartData;
    inadimplencia: ChartData;
    comparativo: TimeSeriesData[];
  }> {
    const response = await this.api.get('/relatorios/tributario', {
      params: filters,
    });
    return response.data;
  }

  async getRelatorioEducacao(filters?: DashboardFilters): Promise<{
    matriculas: ChartData;
    escolas: ChartData;
    evasao: TimeSeriesData[];
  }> {
    const response = await this.api.get('/relatorios/educacao', {
      params: filters,
    });
    return response.data;
  }

  async getRelatorioSaude(filters?: DashboardFilters): Promise<{
    atendimentos: ChartData;
    especialidades: ChartData;
    demanda: TimeSeriesData[];
  }> {
    const response = await this.api.get('/relatorios/saude', {
      params: filters,
    });
    return response.data;
  }

  // Exportar dados
  async exportData(endpoint: string, format: 'csv' | 'xlsx' | 'pdf', filters?: DashboardFilters): Promise<Blob> {
    const response = await this.api.get(`/export/${endpoint}`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const ecidadeAPI = new ECidadeAPI();

