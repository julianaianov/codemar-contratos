'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FilterPanel } from './FilterPanel';
import { MetricCard } from './MetricCard';
import { CronogramaChart } from './CronogramaChart';
import { CategoriaChart } from './CategoriaChart';
import { ContratosPorAnoChart } from './ContratosPorAnoChart';
import { FiltrosContratos, DashboardContratos, MetricasContratos } from '@/types/contratos';
import { useTheme } from '@/components/layout/ThemeProvider';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const ContratosDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FiltrosContratos>({});
  const [dashboardData, setDashboardData] = useState<DashboardContratos | null>(null);
  const [metricas, setMetricas] = useState<MetricasContratos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados do dashboard
        const dashboardResponse = await fetch('/api/contratos/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        });
        const dashboardData = await dashboardResponse.json();

        if (dashboardData.success) {
          setDashboardData(dashboardData.data);
        }

        // Buscar métricas detalhadas
        const metricasResponse = await fetch('/api/contratos/metricas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        });
        const metricasData = await metricasResponse.json();

        if (metricasData.success) {
          setMetricas(metricasData.data);
        }

      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  const handleFiltersChange = (newFilters: FiltrosContratos) => {
    setFilters(newFilters);
  };

  const handleFilter = () => {
    // Os dados já são recarregados automaticamente quando os filtros mudam
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar dados do dashboard de contratos</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 2xl:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 dark:bg-secondary-900 dark:border-secondary-800 p-6 shadow-md rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título com SVG */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <img
            src={theme === 'dark' ? '/logo-contratos-light.svg' : '/logo-contratos-dark.svg'}
            alt="CODEMAR Contratos"
            className="w-full h-auto max-h-32 object-contain"
          />
        </div>
      </div>

      {/* Painel de Filtros */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onFilter={handleFilter}
        loading={loading}
      />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 2xl:gap-8">
        {/* Total de Contratos */}
        <MetricCard
          title="TOTAL CONTRATOS"
          value={dashboardData?.total_contratos || 0}
          description={`${dashboardData?.contratos_ativos || 0}% Contratos ativos`}
          icon={<DocumentTextIcon className="w-6 h-6 text-green-600" />}
          color="green"
          loading={loading}
        />

        {/* Vencem em -30 dias */}
        <MetricCard
          title="VENCEM (- 30 DIAS)"
          value={dashboardData?.contratos_vencendo_30_dias || 0}
          description={`${Math.round(((dashboardData?.contratos_vencendo_30_dias || 0) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (- 30 Dias)`}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          color="red"
          loading={loading}
        />

        {/* Vencem em 30-60 dias */}
        <MetricCard
          title="VENCEM (30 A 60 DIAS)"
          value={dashboardData?.contratos_vencendo_30_60_dias || 0}
          description={`${Math.round(((dashboardData?.contratos_vencendo_30_60_dias || 0) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (30 a 60 Dias)`}
          icon={<ClockIcon className="w-6 h-6 text-orange-600" />}
          color="orange"
          loading={loading}
        />

        {/* Vencem em 60-90 dias */}
        <MetricCard
          title="VENCEM (60 A 90 DIAS)"
          value={dashboardData?.contratos_vencendo_60_90_dias || 0}
          description={`${Math.round(((dashboardData?.contratos_vencendo_60_90_dias || 0) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (60 a 90 Dias)`}
          icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
          color="yellow"
          loading={loading}
        />

        {/* Vencem em 90-180 dias */}
        <MetricCard
          title="VENCEM (90 A 180 DIAS)"
          value={dashboardData?.contratos_vencendo_90_180_dias || 0}
          description={`${Math.round(((dashboardData?.contratos_vencendo_90_180_dias || 0) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (90 a 180 Dias)`}
          icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
          color="blue"
          loading={loading}
        />

        {/* Vencem em +180 dias */}
        <MetricCard
          title="VENCEM (+ 180 DIAS)"
          value={dashboardData?.contratos_vencendo_mais_180_dias || 0}
          description={`${Math.round(((dashboardData?.contratos_vencendo_mais_180_dias || 0) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (+ 180 Dias)`}
          icon={<ClockIcon className="w-6 h-6 text-indigo-600" />}
          color="indigo"
          loading={loading}
        />
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Valor Contratado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              Valor Contratado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(dashboardData?.valor_total_contratado || 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Valor total dos contratos ativos
            </p>
          </CardContent>
        </Card>

        {/* Categoria Contratos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-blue-600" />
              Categoria Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriaChart />
          </CardContent>
        </Card>

        {/* Por Ano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              Por Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContratosPorAnoChart />
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Cronograma */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma mensal - (2023 - 2027)</CardTitle>
        </CardHeader>
        <CardContent>
          <CronogramaChart />
        </CardContent>
      </Card>
    </div>
  );
};
