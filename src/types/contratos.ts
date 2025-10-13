// Tipos para sistema de gestão de contratos CODEMAR

export interface Fornecedor {
  id: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  endereco: string;
  telefone: string;
  email: string;
  situacao: 'ativo' | 'inativo' | 'suspenso';
}

export interface Orgao {
  id: number;
  codigo: string;
  nome: string;
  sigla?: string;
  situacao: 'ativo' | 'inativo';
}

export interface UnidadeGestora {
  id: number;
  codigo: string;
  nome: string;
  orgao_id: number;
  orgao?: Orgao;
  situacao: 'ativo' | 'inativo';
}

export interface Contrato {
  id: number;
  numero: string;
  objeto: string;
  valor_total: number;
  valor_pago: number;
  valor_restante: number;
  data_inicio: string;
  data_fim: string;
  data_vencimento: string;
  situacao: 'ativo' | 'vencido' | 'suspenso' | 'encerrado';
  fornecedor_id: number;
  fornecedor?: Fornecedor;
  orgao_id: number;
  orgao?: Orgao;
  unidade_gestora_id: number;
  unidade_gestora?: UnidadeGestora;
  categoria_id: number;
  categoria?: CategoriaContrato;
  modalidade: string;
  processo_licitatorio?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriaContrato {
  id: number;
  nome: string;
  descricao?: string;
  cor: string;
  situacao: 'ativo' | 'inativo';
}

export interface CronogramaContrato {
  id: number;
  contrato_id: number;
  mes: number;
  ano: number;
  valor_previsto: number;
  valor_executado: number;
  percentual_execucao: number;
}

export interface DashboardContratos {
  total_contratos: number;
  contratos_ativos: number;
  contratos_vencidos: number;
  valor_total_contratado: number;
  valor_total_pago: number;
  valor_restante: number;
  contratos_vencendo_30_dias: number;
  contratos_vencendo_30_60_dias: number;
  contratos_vencendo_60_90_dias: number;
  contratos_vencendo_90_180_dias: number;
  contratos_vencendo_mais_180_dias: number;
}

export interface FiltrosContratos {
  orgao_id?: number;
  unidade_gestora_id?: number;
  fornecedor_id?: number;
  contrato_id?: number;
  situacao?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_minimo?: number;
  valor_maximo?: number;
  categoria_id?: number;
  diretoria?: string;
  ano?: number;
}

export interface ContratoImportado {
  id: number;
  // Novos campos específicos
  ano_numero?: string;           // ano-nº
  numero_contrato?: string;      // contrato
  ano?: number;                  // ano
  pa?: string;                   // P.A
  diretoria?: string;            // DIRETORIA REQUISITANTE
  modalidade?: string;           // MODALIDADE
  nome_empresa?: string;         // NOME DA EMPRESA
  cnpj_empresa?: string;         // CNPJ DA EMPRESA
  objeto?: string;               // OBJETO
  data_assinatura?: string;      // DATA DA ASSINATURA
  prazo?: number;                // PRAZO
  unidade_prazo?: string;        // UNID. PRAZO
  valor_contrato?: number;       // VALOR DO CONTRATO
  vencimento?: string;           // VENCIMENTO
  gestor_contrato?: string;      // GESTOR DO CONTRATO
  fiscal_tecnico?: string;       // FISCAL TÉCNICO
  fiscal_administrativo?: string; // FISCAL ADMINISTRATIVO
  suplente?: string;             // SUPLENTE
  // Campos legados para compatibilidade
  contratante?: string;
  contratado?: string;
  cnpj_contratado?: string;
  valor?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  tipo_contrato?: string;
  secretaria?: string;
  fonte_recurso?: string;
  observacoes?: string;
  file_import_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ContratoPorAno {
  ano: number;
  total: number;
  count: number;
  vigentes: number;
  encerrados: number;
  suspensos: number;
  rescindidos: number;
}

export interface ContratoPorCategoria {
  categoria: string;
  quantidade: number;
  valor_total: number;
  percentual: number;
  cor: string;
}

export interface MetricasContratos {
  total_contratos: number;
  percentual_ativos: number;
  vencem_30_dias: {
    quantidade: number;
    percentual: number;
  };
  vencem_30_60_dias: {
    quantidade: number;
    percentual: number;
  };
  vencem_60_90_dias: {
    quantidade: number;
    percentual: number;
  };
  vencem_90_180_dias: {
    quantidade: number;
    percentual: number;
  };
  vencem_mais_180_dias: {
    quantidade: number;
    percentual: number;
  };
  valor_contratado: number;
  valor_pago: number;
  valor_restante: number;
}

// Tipos para componentes de filtro
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterComponentProps {
  value?: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
}

// Tipos para gráficos
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

export interface CronogramaChartData {
  mes: string;
  valor: number;
  ano: number;
}

export interface CategoriaChartData {
  categoria: string;
  valor: number;
  quantidade: number;
  cor: string;
}

// Tipos para API
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

// Tipos para formulários
export interface ContratoFormData {
  numero: string;
  objeto: string;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  fornecedor_id: number;
  orgao_id: number;
  unidade_gestora_id: number;
  categoria_id: number;
  modalidade: string;
  processo_licitatorio?: string;
  observacoes?: string;
}

export interface FornecedorFormData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  endereco: string;
  telefone: string;
  email: string;
}

export interface OrgaoFormData {
  codigo: string;
  nome: string;
  sigla?: string;
}

export interface UnidadeGestoraFormData {
  codigo: string;
  nome: string;
  orgao_id: number;
}
