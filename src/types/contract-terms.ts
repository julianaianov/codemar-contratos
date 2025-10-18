// Tipos de termos contratuais
export type TermoTipo = 
  | 'apostilamento'
  | 'aditivo'
  | 'reconhecimento_divida'
  | 'rescisao';

// Tipos de instrumentos contratuais
export type InstrumentoTipo = 
  | 'colaboracao'
  | 'comodato'
  | 'concessao'
  | 'convenio'
  | 'cooperacao'
  | 'fomento'
  | 'parceria'
  | 'patrocinio'
  | 'protocolo_intencoes'
  | 'cessao'
  | 'reconhecimento_divida';

// Status dos termos
export type TermoStatus = 
  | 'pendente'
  | 'aprovado'
  | 'rejeitado'
  | 'em_analise'
  | 'executado';

// Interface para termos contratuais
export interface TermoContratual {
  id: string;
  contrato_id: string;
  tipo: TermoTipo;
  numero: string;
  data_criacao: string;
  data_vigencia: string;
  data_execucao?: string;
  valor_original: number;
  valor_aditivo?: number;
  percentual_aditivo?: number;
  descricao: string;
  justificativa: string;
  status: TermoStatus;
  empenho_id?: string;
  empenho_numero?: string;
  observacoes?: string;
  anexos?: string[];
  criado_por: string;
  criado_em: string;
  atualizado_por?: string;
  atualizado_em?: string;
}

// Interface para instrumentos contratuais
export interface InstrumentoContratual {
  id: string;
  contrato_id: string;
  tipo: InstrumentoTipo;
  numero: string;
  data_inicio: string;
  data_fim: string;
  valor: number;
  descricao: string;
  status: TermoStatus;
  observacoes?: string;
  anexos?: string[];
  criado_por: string;
  criado_em: string;
  atualizado_por?: string;
  atualizado_em?: string;
}

// Interface para empenhos
export interface Empenho {
  id: string;
  numero: string;
  valor: number;
  data_empenho: string;
  data_vencimento: string;
  status: 'ativo' | 'liquidado' | 'cancelado';
  observacoes?: string;
}

// Interface estendida para contratos com termos e instrumentos
export interface ContratoCompleto {
  id: string;
  numero: string;
  objeto: string;
  valor_original: number;
  valor_atual: number;
  data_inicio: string;
  data_fim: string;
  data_vigencia: string;
  data_execucao?: string;
  fornecedor: string;
  diretoria: string;
  status: string;
  tipo: string;
  modalidade: string;
  categoria: string;
  
  // Termos e instrumentos
  termos: TermoContratual[];
  instrumentos: InstrumentoContratual[];
  empenhos: Empenho[];
  
  // Métricas calculadas
  percentual_aditivo_total: number;
  valor_aditivo_total: number;
  quantidade_aditivos: number;
  quantidade_apostilamentos: number;
  quantidade_rescisoes: number;
  
  // Metadados
  criado_por: string;
  criado_em: string;
  atualizado_por?: string;
  atualizado_em?: string;
}

// Interface para criação de termos
export interface CriarTermoRequest {
  contrato_id: string;
  tipo: TermoTipo;
  valor_aditivo?: number;
  descricao: string;
  justificativa: string;
  data_vigencia: string;
  data_execucao?: string;
  empenho_id?: string;
  observacoes?: string;
}

// Interface para criação de instrumentos
export interface CriarInstrumentoRequest {
  contrato_id: string;
  tipo: InstrumentoTipo;
  valor: number;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  observacoes?: string;
}

// Interface para relatórios Power BI
export interface ContratoPowerBI {
  id: string;
  numero: string;
  objeto: string;
  valor_original: number;
  valor_atual: number;
  percentual_aditivo: number;
  valor_aditivo_total: number;
  quantidade_aditivos: number;
  data_inicio: string;
  data_fim: string;
  fornecedor: string;
  diretoria: string;
  status: string;
  tipo: string;
  modalidade: string;
  categoria: string;
  data_vigencia: string;
  data_execucao?: string;
  
  // Novos campos para análise de conformidade
  classificacao_contrato: string;
  limite_legal: number;
  descricao_classificacao: string;
  dentro_limite_legal: boolean;
  percentual_restante: number;
  valor_restante: number;
  status_conformidade: 'CONFORME' | 'ATENCAO' | 'INCONFORME';
}

// Constantes para limites de aditivo conforme Lei 14.133/2021
export const LIMITES_ADITIVO = {
  REFORMA_EQUIPAMENTO: 50, // 50% para reforma de edifício ou equipamento
  OBRAS_SERVICOS_COMPRAS: 25, // 25% para obras, serviços ou compras
  SOCIEDADE_MISTA: 25 // 25% para contratos de sociedade mista
} as const;

// Mapeamento de tipos de contrato para limites conforme Lei 14.133/2021
export const TIPOS_REFORMA_EQUIPAMENTO = [
  'reforma',
  'reformas',
  'equipamento',
  'equipamentos',
  'edifício',
  'edifícios',
  'instalação',
  'instalações',
  'manutenção',
  'manutenções'
] as const;

export const TIPOS_OBRAS_SERVICOS = [
  'obra',
  'obras',
  'construção',
  'construções',
  'ampliação',
  'ampliações',
  'restauração',
  'restaurações',
  'demolição',
  'demolições',
  'serviço',
  'serviços',
  'compra',
  'compras',
  'fornecimento',
  'fornecimentos'
] as const;

// Função para determinar limite de aditivo conforme Lei 14.133/2021
export function getLimiteAditivo(tipoContrato: string, objetoContrato?: string): number {
  const tipoLower = tipoContrato.toLowerCase();
  const objetoLower = (objetoContrato || '').toLowerCase();
  
  // Verificar se é reforma de edifício ou equipamento (50%)
  if (TIPOS_REFORMA_EQUIPAMENTO.some(tipo => 
    tipoLower.includes(tipo) || objetoLower.includes(tipo)
  )) {
    return LIMITES_ADITIVO.REFORMA_EQUIPAMENTO;
  }
  
  // Verificar se é obra, serviço ou compra (25%)
  if (TIPOS_OBRAS_SERVICOS.some(tipo => 
    tipoLower.includes(tipo) || objetoLower.includes(tipo)
  )) {
    return LIMITES_ADITIVO.OBRAS_SERVICOS_COMPRAS;
  }
  
  // Contratos de sociedade mista (25%)
  if (tipoLower.includes('sociedade') || tipoLower.includes('mista')) {
    return LIMITES_ADITIVO.SOCIEDADE_MISTA;
  }
  
  // Default: 25% para demais contratos
  return LIMITES_ADITIVO.OBRAS_SERVICOS_COMPRAS;
}

// Função para verificar se aditivo está dentro do limite
export function isAditivoDentroLimite(
  valorOriginal: number, 
  valorAditivo: number, 
  tipoContrato: string,
  objetoContrato?: string
): boolean {
  const limite = getLimiteAditivo(tipoContrato, objetoContrato);
  const percentual = (valorAditivo / valorOriginal) * 100;
  return percentual <= limite;
}

// Função para obter classificação do contrato
export function getClassificacaoContrato(tipoContrato: string, objetoContrato?: string): {
  categoria: string;
  limite: number;
  descricao: string;
} {
  const tipoLower = tipoContrato.toLowerCase();
  const objetoLower = (objetoContrato || '').toLowerCase();
  
  // Reforma de edifício ou equipamento
  if (TIPOS_REFORMA_EQUIPAMENTO.some(tipo => 
    tipoLower.includes(tipo) || objetoLower.includes(tipo)
  )) {
    return {
      categoria: 'REFORMA_EQUIPAMENTO',
      limite: LIMITES_ADITIVO.REFORMA_EQUIPAMENTO,
      descricao: 'Reforma de Edifício ou Equipamento'
    };
  }
  
  // Obra, serviço ou compra
  if (TIPOS_OBRAS_SERVICOS.some(tipo => 
    tipoLower.includes(tipo) || objetoLower.includes(tipo)
  )) {
    return {
      categoria: 'OBRAS_SERVICOS_COMPRAS',
      limite: LIMITES_ADITIVO.OBRAS_SERVICOS_COMPRAS,
      descricao: 'Obras, Serviços ou Compras'
    };
  }
  
  // Sociedade mista
  if (tipoLower.includes('sociedade') || tipoLower.includes('mista')) {
    return {
      categoria: 'SOCIEDADE_MISTA',
      limite: LIMITES_ADITIVO.SOCIEDADE_MISTA,
      descricao: 'Sociedade Mista'
    };
  }
  
  // Default
  return {
    categoria: 'DEFAULT',
    limite: LIMITES_ADITIVO.OBRAS_SERVICOS_COMPRAS,
    descricao: 'Demais Contratos'
  };
}
