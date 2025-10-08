// Tipos para dados do e-Cidade

export interface ECidadeUser {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil: string;
  instituicao: number;
}

export interface ECidadeAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: ECidadeUser;
}

// Financeiro
export interface Receita {
  id: number;
  codigo: string;
  descricao: string;
  valor_previsto: number;
  valor_arrecadado: number;
  percentual: number;
  categoria: string;
  mes: number;
  ano: number;
}

export interface Despesa {
  id: number;
  codigo: string;
  descricao: string;
  valor_empenhado: number;
  valor_liquidado: number;
  valor_pago: number;
  percentual: number;
  categoria: string;
  mes: number;
  ano: number;
}

export interface Orcamento {
  receitas: Receita[];
  despesas: Despesa[];
  saldo: number;
  percentual_execucao: number;
}

// Tributário
export interface IPTU {
  id: number;
  inscricao: string;
  endereco: string;
  proprietario: string;
  valor_venal: number;
  valor_imposto: number;
  situacao: string;
  vencimento: string;
  pagamento: string | null;
}

export interface ISSQN {
  id: number;
  cnpj: string;
  razao_social: string;
  atividade: string;
  valor_servico: number;
  valor_imposto: number;
  situacao: string;
  vencimento: string;
  pagamento: string | null;
}

// Educação
export interface Escola {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  diretor: string;
  alunos: number;
  professores: number;
  turmas: number;
}

export interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  escola: string;
  serie: string;
  turma: string;
  situacao: string;
}

// Saúde
export interface UnidadeSaude {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  tipo: string;
  medicos: number;
  enfermeiros: number;
  atendimentos_mes: number;
}

export interface Atendimento {
  id: number;
  paciente: string;
  cpf: string;
  data_atendimento: string;
  medico: string;
  especialidade: string;
  diagnostico: string;
  valor: number;
}

// Patrimonial
export interface Bem {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string;
  valor_aquisicao: number;
  valor_atual: number;
  localizacao: string;
  responsavel: string;
  situacao: string;
  data_aquisicao: string;
}

export interface Licitacao {
  id: number;
  numero: string;
  objeto: string;
  modalidade: string;
  valor_estimado: number;
  valor_contratado: number;
  situacao: string;
  data_abertura: string;
  data_encerramento: string;
}

// Recursos Humanos
export interface Servidor {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  lotacao: string;
  salario: number;
  situacao: string;
  data_admissao: string;
}

export interface FolhaPagamento {
  id: number;
  mes: number;
  ano: number;
  total_bruto: number;
  total_descontos: number;
  total_liquido: number;
  servidores: number;
}

// Dashboard
export interface DashboardMetrics {
  receitas_totais: number;
  despesas_totais: number;
  saldo_orcamentario: number;
  percentual_execucao: number;
  arrecadacao_mes: number;
  empenhos_mes: number;
  servidores_ativos: number;
  alunos_matriculados: number;
  atendimentos_saude: number;
  bens_patrimoniais: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Filtros
export interface DateRange {
  start: string;
  end: string;
}

export interface DashboardFilters {
  dateRange: DateRange;
  instituicao?: number;
  categoria?: string;
  situacao?: string;
}




