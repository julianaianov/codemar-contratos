import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MetricCard } from './MetricCard';
import { useDashboardMetrics } from '@/hooks/useECidadeData';
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
    dateRange: {
      start: string;
      end: string;
    };
    instituicao?: number;
  };
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ filters }) => {
  const { data: metrics, isLoading, error } = useDashboardMetrics(filters);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar métricas do dashboard</p>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Receitas Totais',
      value: metrics?.receitas_totais || 0,
      change: 5.2,
      changeType: 'positive' as const,
      icon: <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Despesas Totais',
      value: metrics?.despesas_totais || 0,
      change: -2.1,
      changeType: 'negative' as const,
      icon: <ArrowTrendingUpIcon className="w-6 h-6 text-red-600" />,
    },
    {
      title: 'Saldo Orçamentário',
      value: metrics?.saldo_orcamentario || 0,
      change: 8.3,
      changeType: 'positive' as const,
      icon: <ChartBarIcon className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Execução Orçamentária',
      value: `${metrics?.percentual_execucao || 0}%`,
      change: 2.5,
      changeType: 'positive' as const,
      icon: <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />,
    },
    {
      title: 'Servidores Ativos',
      value: metrics?.servidores_ativos || 0,
      change: 1.2,
      changeType: 'positive' as const,
      icon: <UsersIcon className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: 'Alunos Matriculados',
      value: metrics?.alunos_matriculados || 0,
      change: 3.7,
      changeType: 'positive' as const,
      icon: <AcademicCapIcon className="w-6 h-6 text-yellow-600" />,
    },
    {
      title: 'Atendimentos Saúde',
      value: metrics?.atendimentos_saude || 0,
      change: -1.8,
      changeType: 'negative' as const,
      icon: <HeartIcon className="w-6 h-6 text-pink-600" />,
    },
    {
      title: 'Bens Patrimoniais',
      value: metrics?.bens_patrimoniais || 0,
      change: 0.5,
      changeType: 'neutral' as const,
      icon: <BuildingOfficeIcon className="w-6 h-6 text-gray-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 2xl:gap-8">
        {metricCards.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            loading={isLoading}
          />
        ))}
      </div>

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
                  }).format(metrics?.arrecadacao_mes || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Empenhos Realizados</span>
                <span className="font-semibold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(metrics?.empenhos_mes || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saldo Disponível</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format((metrics?.receitas_totais || 0) - (metrics?.despesas_totais || 0))}
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
                  {metrics?.percentual_execucao || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custo por Servidor</span>
                <span className="font-semibold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format((metrics?.despesas_totais || 0) / (metrics?.servidores_ativos || 1))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custo por Aluno</span>
                <span className="font-semibold text-purple-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format((metrics?.despesas_totais || 0) / (metrics?.alunos_matriculados || 1))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
