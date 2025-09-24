import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MetricCard } from './MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardOverviewProps {
  filters?: {
    exercicio?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    instituicao?: number;
  };
}

interface MetricsData {
  total_receitas_previstas: string;
  total_receitas_arrecadadas: string;
  total_despesas_empenhadas: string;
  total_despesas_pagas: string;
}

interface ChartData {
  mes: number;
  total_arrecadado?: number;
  total_empenhado?: number;
  total_liquidado?: number;
  total_pago?: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ filters }) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [receitasChart, setReceitasChart] = useState<ChartData[]>([]);
  const [despesasChart, setDespesasChart] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const year = filters?.exercicio || new Date().getFullYear().toString();
        
        // Buscar métricas
        const metricsResponse = await fetch(`/api/ecidade/database?path=dashboard/metrics&year=${year}`);
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);

        // Buscar gráfico de receitas
        const receitasResponse = await fetch(`/api/ecidade/database?path=receitas-chart&year=${year}`);
        const receitasData = await receitasResponse.json();
        setReceitasChart(receitasData);

        // Buscar gráfico de despesas
        const despesasResponse = await fetch(`/api/ecidade/database?path=despesas-chart&year=${year}`);
        const despesasData = await despesasResponse.json();
        setDespesasChart(despesasData);

      } catch (err) {
        setError('Erro ao carregar dados');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar métricas do dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 2xl:gap-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 dark:bg-secondary-900 dark:border-secondary-800 p-6 shadow-md rounded-lg animate-pulse">
              <div className="text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Receitas Previstas',
      value: parseFloat(metrics?.total_receitas_previstas || '0'),
      change: 5.2,
      changeType: 'positive' as const,
      icon: <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Receitas Arrecadadas',
      value: parseFloat(metrics?.total_receitas_arrecadadas || '0'),
      change: 8.2,
      changeType: 'positive' as const,
      icon: <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Despesas Empenhadas',
      value: parseFloat(metrics?.total_despesas_empenhadas || '0'),
      change: -2.1,
      changeType: 'negative' as const,
      icon: <ChartBarIcon className="w-6 h-6 text-red-600" />,
    },
    {
      title: 'Despesas Pagas',
      value: parseFloat(metrics?.total_despesas_pagas || '0'),
      change: 5.3,
      changeType: 'positive' as const,
      icon: <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 2xl:gap-8">
        {metricCards.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            loading={false}
          />
        ))}
      </div>

      {/* Resumo Financeiro e Indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receitas Arrecadadas</span>
                <span className="font-semibold text-green-600 group-hover:animate-pulse-slow">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(parseFloat(metrics?.total_receitas_arrecadadas || '0'))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Empenhos Realizados</span>
                <span className="font-semibold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(parseFloat(metrics?.total_despesas_empenhadas || '0'))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saldo Disponível</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(parseFloat(metrics?.total_receitas_arrecadadas || '0') - parseFloat(metrics?.total_despesas_pagas || '0'))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Gestão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiência Orçamentária</span>
                <span className="font-semibold text-green-600">
                  {Math.round((parseFloat(metrics?.total_despesas_pagas || '0') / parseFloat(metrics?.total_receitas_previstas || '1')) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custo por Servidor</span>
                <span className="font-semibold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(parseFloat(metrics?.total_despesas_pagas || '0') / 1250)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custo por Aluno</span>
                <span className="font-semibold text-purple-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(parseFloat(metrics?.total_despesas_pagas || '0') / 5000)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {receitasChart && receitasChart.length > 0 ? (
              <BarChart
                data={{
                  labels: receitasChart.map(item => {
                    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    return months[item.mes - 1] || `Mês ${item.mes}`;
                  }),
                  datasets: [
                    {
                      label: 'Receitas Arrecadadas',
                      data: receitasChart.map(item => item.total_arrecadado || 0),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    },
                  ],
                }}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {despesasChart && despesasChart.length > 0 ? (
              <BarChart
                data={{
                  labels: despesasChart.map(item => {
                    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    return months[item.mes - 1] || `Mês ${item.mes}`;
                  }),
                  datasets: [
                    {
                      label: 'Empenhado',
                      data: despesasChart.map(item => item.total_empenhado || 0),
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    },
                    {
                      label: 'Liquidado',
                      data: despesasChart.map(item => item.total_liquidado || 0),
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    },
                    {
                      label: 'Pago',
                      data: despesasChart.map(item => item.total_pago || 0),
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    },
                  ],
                }}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};