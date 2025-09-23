import { DashboardMetrics, ChartData, TimeSeriesData } from '@/types/ecidade';

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

