import {
  DashboardMetrics,
  ChartData,
  TimeSeriesData,
  Orcamento,
  Receita,
  Despesa,
  Escola,
  Aluno,
  UnidadeSaude,
  Atendimento,
  Bem,
  Licitacao,
  Servidor,
  FolhaPagamento,
  PaginatedResponse
} from '@/types/ecidade';

export const mockDashboardMetrics: DashboardMetrics = {
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
};

export const mockReceitasChart: ChartData = {
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
};

export const mockDespesasChart: ChartData = {
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
};

export const mockExecucaoData: TimeSeriesData[] = [
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
];

// Financeiro - Orçamento / Receitas / Despesas
export const mockReceitas: Receita[] = [
  { id: 1, codigo: '1.1.1.01', descricao: 'IPTU', valor_previsto: 800000, valor_arrecadado: 750000, percentual: 93.75, categoria: 'Tributária', mes: 9, ano: 2024 },
  { id: 2, codigo: '1.1.1.02', descricao: 'ISSQN', valor_previsto: 600000, valor_arrecadado: 580000, percentual: 96.67, categoria: 'Tributária', mes: 9, ano: 2024 },
  { id: 3, codigo: '1.1.1.03', descricao: 'Taxas', valor_previsto: 400000, valor_arrecadado: 350000, percentual: 87.5, categoria: 'Taxas', mes: 9, ano: 2024 },
];

export const mockDespesas: Despesa[] = [
  { id: 1, codigo: '3.1.1.01', descricao: 'Pessoal', valor_empenhado: 1200000, valor_liquidado: 1150000, valor_pago: 1100000, percentual: 91.67, categoria: 'Pessoal', mes: 9, ano: 2024 },
  { id: 2, codigo: '3.1.1.02', descricao: 'Educação', valor_empenhado: 400000, valor_liquidado: 380000, valor_pago: 370000, percentual: 92.5, categoria: 'Educação', mes: 9, ano: 2024 },
  { id: 3, codigo: '3.1.1.03', descricao: 'Saúde', valor_empenhado: 350000, valor_liquidado: 320000, valor_pago: 300000, percentual: 85.71, categoria: 'Saúde', mes: 9, ano: 2024 },
];

export const mockOrcamento: Orcamento = {
  receitas: mockReceitas,
  despesas: mockDespesas,
  saldo: 300000,
  percentual_execucao: 88.5,
};

// Educação
export const mockEscolas: Escola[] = [
  { id: 1, nome: 'Escola Municipal A', endereco: 'Rua 1, 100', telefone: '(11) 1111-1111', email: 'a@escola.com', diretor: 'Maria Silva', alunos: 500, professores: 40, turmas: 20 },
  { id: 2, nome: 'Escola Municipal B', endereco: 'Rua 2, 200', telefone: '(11) 2222-2222', email: 'b@escola.com', diretor: 'João Souza', alunos: 650, professores: 55, turmas: 25 },
];

export const mockAlunos: PaginatedResponse<Aluno> = {
  data: Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    nome: `Aluno ${i + 1}`,
    cpf: `000.000.000-${String(i).padStart(2, '0')}`,
    data_nascimento: '2010-01-01',
    escola: i % 2 ? 'Escola Municipal A' : 'Escola Municipal B',
    serie: `${(i % 9) + 1}ª`,
    turma: `Turma ${String.fromCharCode(65 + (i % 3))}`,
    situacao: i % 5 ? 'Ativo' : 'Transferido',
  })),
  total: 100,
  page: 1,
  per_page: 20,
  total_pages: 5,
};

export const mockEducacaoMetrics = {
  total_escolas: mockEscolas.length,
  total_alunos: 8500,
  total_professores: 650,
  total_turmas: 320,
};

// Saúde
export const mockUnidadesSaude: UnidadeSaude[] = [
  { id: 1, nome: 'UBS Centro', endereco: 'Av. Central, 100', telefone: '(11) 3333-3333', tipo: 'UBS', medicos: 12, enfermeiros: 18, atendimentos_mes: 1500 },
  { id: 2, nome: 'UPA Norte', endereco: 'Rua das Flores, 50', telefone: '(11) 4444-4444', tipo: 'UPA', medicos: 20, enfermeiros: 25, atendimentos_mes: 2800 },
];

export const mockAtendimentos: PaginatedResponse<Atendimento> = {
  data: Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    paciente: `Paciente ${i + 1}`,
    cpf: `111.111.111-${String(i).padStart(2, '0')}`,
    data_atendimento: '2024-09-01',
    medico: `Dr(a). ${i % 2 ? 'Ana' : 'Carlos'}`,
    especialidade: i % 2 ? 'Clínico' : 'Pediatria',
    diagnostico: 'Avaliação',
    valor: 150,
  })),
  total: 200,
  page: 1,
  per_page: 20,
  total_pages: 10,
};

export const mockSaudeMetrics = {
  total_unidades: mockUnidadesSaude.length,
  total_atendimentos: 3200,
  total_medicos: 180,
  total_enfermeiros: 250,
};

// Patrimonial
export const mockBens: PaginatedResponse<Bem> = {
  data: Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    codigo: `BEM-${1000 + i}`,
    descricao: `Bem patrimonial ${i + 1}`,
    categoria: i % 2 ? 'Informática' : 'Mobiliário',
    valor_aquisicao: 5000 + i * 200,
    valor_atual: 3500 + i * 150,
    localizacao: i % 2 ? 'Almoxarifado' : 'Escola Municipal A',
    responsavel: i % 2 ? 'Setor TI' : 'Direção',
    situacao: i % 3 ? 'Ativo' : 'Em manutenção',
    data_aquisicao: '2020-01-01',
  })),
  total: 1000,
  page: 1,
  per_page: 20,
  total_pages: 50,
};

export const mockLicitacoes: PaginatedResponse<Licitacao> = {
  data: Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    numero: `2024/${100 + i}`,
    objeto: `Aquisição de materiais ${i + 1}`,
    modalidade: i % 2 ? 'Pregão' : 'Concorrência',
    valor_estimado: 100000 + i * 5000,
    valor_contratado: 95000 + i * 4500,
    situacao: i % 3 ? 'Em andamento' : 'Concluída',
    data_abertura: '2024-07-01',
    data_encerramento: '2024-08-01',
  })),
  total: 200,
  page: 1,
  per_page: 20,
  total_pages: 10,
};

export const mockPatrimonialMetrics = {
  total_bens: 4500,
  valor_total_bens: 12500000,
  total_licitacoes: 240,
  valor_total_licitacoes: 9800000,
};

// Recursos Humanos
export const mockServidores: PaginatedResponse<Servidor> = {
  data: Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    nome: `Servidor ${i + 1}`,
    cpf: `222.222.222-${String(i).padStart(2, '0')}`,
    matricula: `MAT${1000 + i}`,
    cargo: i % 2 ? 'Professor' : 'Médico',
    lotacao: i % 2 ? 'Educação' : 'Saúde',
    salario: 3500 + i * 120,
    situacao: i % 4 ? 'Ativo' : 'Afastado',
    data_admissao: '2018-05-10',
  })),
  total: 5000,
  page: 1,
  per_page: 20,
  total_pages: 250,
};

export const mockFolhaPagamento: FolhaPagamento[] = [
  { id: 1, mes: 8, ano: 2024, total_bruto: 1200000, total_descontos: 180000, total_liquido: 1020000, servidores: 1250 },
  { id: 2, mes: 9, ano: 2024, total_bruto: 1215000, total_descontos: 182000, total_liquido: 1033000, servidores: 1250 },
];

export const mockRHMetrics = {
  total_servidores: 1250,
  servidores_ativos: 1195,
  total_folha: 1215000,
  media_salario: 4100,
};

// Relatórios
export const mockRelatorioFinanceiro = {
  receitas: mockReceitasChart,
  despesas: mockDespesasChart,
  execucao: mockExecucaoData,
};

export const mockRelatorioTributario = {
  arrecadacao: mockReceitasChart,
  inadimplencia: mockDespesasChart,
  comparativo: mockExecucaoData,
};

export const mockRelatorioEducacao = {
  matriculas: mockReceitasChart,
  escolas: mockDespesasChart,
  evasao: mockExecucaoData,
};

export const mockRelatorioSaude = {
  atendimentos: mockReceitasChart,
  especialidades: mockDespesasChart,
  demanda: mockExecucaoData,
};


