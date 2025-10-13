'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FilterPanel } from './FilterPanel';
import { MetricCard } from './MetricCard';
import { CronogramaChart } from './CronogramaChart';
import { CategoriaChart } from './CategoriaChart';
import { ContratosPorAnoChart } from './ContratosPorAnoChart';
import { ControleFinanceiroChart } from './ControleFinanceiroChart';
import { ComparacaoPeriodosChart } from './ComparacaoPeriodosChart';
import { CronogramaPagamentosChart } from './CronogramaPagamentosChart';
import { FiltrosContratos, DashboardContratos, MetricasContratos } from '@/types/contratos';
import { useTheme } from '@/components/layout/ThemeProvider';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface ContratosDashboardProps {
  initialFilter?: FiltrosContratos;
}

export const ContratosDashboard: React.FC<ContratosDashboardProps> = ({ initialFilter = {} }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [filters, setFilters] = useState<FiltrosContratos>(initialFilter);
  const [dashboardData, setDashboardData] = useState<DashboardContratos | null>(null);
  const [metricas, setMetricas] = useState<MetricasContratos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para controle de ano/período
  const [anoSelecionadoDashboard, setAnoSelecionadoDashboard] = useState<number | 'geral'>('geral');
  const [anoSelecionadoFinanceiro, setAnoSelecionadoFinanceiro] = useState<number>(new Date().getFullYear());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([2023, 2024, 2025]);
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    empenhado: 0,
    liquidado: 0,
    pago: 0,
    saldo: 0,
  });
  // Total calculado a partir da agregação por diretoria (fallback confiável)
  const [valorTotalDiretoria, setValorTotalDiretoria] = useState<number>(0);
  
  // Estados para comparação de períodos
  const [comparacaoPeriodos, setComparacaoPeriodos] = useState({
    periodos: ['2023', '2024', '2025'],
    empenhado: [0, 0, 0],
    liquidado: [0, 0, 0],
    pago: [0, 0, 0],
  });
  
  // Estados para cronograma de pagamentos
  const [cronogramaPagamentos, setCronogramaPagamentos] = useState({
    meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    previsto: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    realizado: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  // Carregar dados do dashboard
  useEffect(() => {
    // Persistir filtros iniciais (inclui diretoria quando vindo pela rota da diretoria)
    try {
      const current = sessionStorage.getItem('contratos:filters');
      const desired = JSON.stringify(initialFilter);
      if (current !== desired) {
        sessionStorage.setItem('contratos:filters', desired);
      }
    } catch {}

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Adiciona o ano selecionado aos filtros se não for 'geral'
        const filtrosComAno = anoSelecionadoDashboard !== 'geral' 
          ? { ...filters, ano: anoSelecionadoDashboard }
          : filters;

        // Buscar dados do dashboard
        const dashboardResponse = await fetch('/api/contratos/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtrosComAno)
        });
        const dashboardData = await dashboardResponse.json();

        if (dashboardData.success) {
          setDashboardData(dashboardData.data);
        }

        // Buscar métricas detalhadas
        const metricasResponse = await fetch('/api/contratos/metricas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtrosComAno)
        });
        const metricasData = await metricasResponse.json();

        if (metricasData.success) {
          setMetricas(metricasData.data);
        }

      } catch (err) {
        // Não bloquear o dashboard: manter dados zerados
        setDashboardData(null);
        setMetricas(null);
        setError(null);
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters, anoSelecionadoDashboard]);

  // Buscar total por diretoria a partir da rota agregada (reflete filtro "Todas" ou uma diretoria específica)
  useEffect(() => {
    const fetchTotais = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.diretoria && String(filters.diretoria).toLowerCase() !== 'todas') {
          params.append('diretoria', String(filters.diretoria));
        }
        const resp = await fetch(`/api/contratos/diretorias?${params.toString()}`);
        const json = await resp.json();
        if (json?.success && Array.isArray(json.data)) {
          const total = json.data.reduce((s: number, d: any) => s + Number(d?.valor_total || 0), 0);
          setValorTotalDiretoria(total);
        } else {
          setValorTotalDiretoria(0);
        }
      } catch {
        setValorTotalDiretoria(0);
      }
    };
    fetchTotais();
  }, [filters?.diretoria]);

  const handleFiltersChange = (newFilters: FiltrosContratos) => {
    setFilters(newFilters);
    // Persistir filtros para os gráficos filhos (categoria, por ano, cronograma)
    try {
      sessionStorage.setItem('contratos:filters', JSON.stringify(newFilters));
    } catch {}
  };

  const handleFilter = () => {
    // Os dados já são recarregados automaticamente quando os filtros mudam
  };

  // Funções de navegação para cada card
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'total':
        router.push('/consulta/contratos');
        break;
      case 'vencendo-30':
        router.push('/consulta/contratos?filter=vencendo-30');
        break;
      case 'vencendo-30-90':
        router.push('/consulta/contratos?filter=vencendo-30-90');
        break;
      default:
        break;
    }
  };

  // Nunca abortar a renderização por erro; manter cards e gráficos zerados

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
    <div className="space-y-6 pt-4">
      {/* Título com SVG */}
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-3xl">
          <img
            src={theme === 'dark' ? '/logo-contratos-light.svg' : '/logo-contratos-dark.svg'}
            alt="CODEMAR Contratos"
            className="w-full h-auto max-h-20 object-contain"
          />
        </div>
      </div>

      {/* Seletor de Período do Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-1">Portal de Transparência</h2>
            <p className="text-blue-100 text-sm">Selecione o período para visualizar os dados dos contratos</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setAnoSelecionadoDashboard('geral')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                anoSelecionadoDashboard === 'geral'
                  ? 'bg-white text-blue-700 shadow-xl scale-105'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
            >
              📊 Geral (Todos)
            </button>
            {anosDisponiveis.map((ano) => (
              <button
                key={ano}
                onClick={() => setAnoSelecionadoDashboard(ano)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  anoSelecionadoDashboard === ano
                    ? 'bg-white text-blue-700 shadow-xl scale-105'
                    : 'bg-blue-500 hover:bg-blue-400 text-white'
                }`}
              >
                📅 {ano}
              </button>
            ))}
          </div>
        </div>
        
        {/* Indicador do período selecionado */}
        {anoSelecionadoDashboard !== 'geral' && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-white text-sm text-center">
              ℹ️ Visualizando dados mensais de <strong>{anoSelecionadoDashboard}</strong> 
              {' '}- Os gráficos mostram a evolução ao longo dos 12 meses
            </p>
          </div>
        )}
      </div>

      {/* Painel de Filtros */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onFilter={handleFilter}
        loading={loading}
      />

      {/* Cards de Métricas (somente vencimentos: -30 e 30-90) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Total de Contratos */}
        <MetricCard
          title="TOTAL CONTRATOS"
          value={dashboardData?.total_contratos || 0}
          description={`${dashboardData?.contratos_ativos || 0}% Contratos ativos`}
          icon={<DocumentTextIcon className="w-6 h-6 text-green-600" />}
          color="green"
          loading={loading}
          clickable={true}
          onClick={() => handleCardClick('total')}
        />

        {/* Vencem em -30 dias */}
        <MetricCard
          title="VENCEM (- 30 DIAS)"
          value={dashboardData?.contratos_vencendo_30_dias || 0}
          description={`${Math.round(((dashboardData?.contratos_vencendo_30_dias || 0) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (- 30 Dias)`}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          color="red"
          loading={loading}
          clickable={true}
          onClick={() => handleCardClick('vencendo-30')}
        />

        {/* Vencem em 30-90 dias (30-60 + 60-90) */}
        <MetricCard
          title="VENCEM (30 A 90 DIAS)"
          value={(dashboardData?.contratos_vencendo_30_60_dias || 0) + (dashboardData?.contratos_vencendo_60_90_dias || 0)}
          description={`${Math.round((((dashboardData?.contratos_vencendo_30_60_dias || 0) + (dashboardData?.contratos_vencendo_60_90_dias || 0)) / (dashboardData?.total_contratos || 1)) * 100)}% à vencer (30 a 90 Dias)`}
          icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
          color="yellow"
          loading={loading}
          clickable={true}
          onClick={() => handleCardClick('vencendo-30-90')}
        />
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Valor Contratado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Valor Contratado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format((valorTotalDiretoria && valorTotalDiretoria > 0) ? valorTotalDiretoria : (dashboardData?.valor_total_contratado || 0))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-200 mt-2">
              Valor total dos contratos ativos
            </p>
          </CardContent>
        </Card>

        {/* Categoria Contratos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <ChartPieIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Categoria Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriaChart filters={filters} />
          </CardContent>
        </Card>

        {/* Por Ano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Por Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContratosPorAnoChart filters={filters} />
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Cronograma */}
      <Card className="mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 dark:text-gray-100">
            {anoSelecionadoDashboard === 'geral' 
              ? 'Cronograma mensal - (2023 - 2027)' 
              : `Cronograma mensal - ${anoSelecionadoDashboard} (Jan - Dez)`
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CronogramaChart anoSelecionado={anoSelecionadoDashboard} filters={filters} />
        </CardContent>
      </Card>

      {/* NOVA SEÇÃO: Controle Financeiro */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Controle Financeiro de Contratos</h2>
          <p className="text-blue-100">Acompanhe empenhos, liquidações, pagamentos e saldos por período</p>
        </div>

        {/* Seletor de Ano */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Selecione o Período
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Escolha o ano para visualizar os dados financeiros
              </p>
            </div>
            <div className="flex gap-2">
              {anosDisponiveis.map((ano) => (
                <button
                  key={ano}
                  onClick={() => setAnoSelecionadoFinanceiro(ano)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    anoSelecionadoFinanceiro === ano
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {ano}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards de Métricas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="EMPENHADO"
            value={dadosFinanceiros.empenhado}
            description="Valor total empenhado"
            icon={<BanknotesIcon className="w-6 h-6 text-blue-600" />}
            color="blue"
            loading={false}
          />

          <MetricCard
            title="LIQUIDADO"
            value={dadosFinanceiros.liquidado}
            description={`${Number.isFinite((dadosFinanceiros.liquidado / (dadosFinanceiros.empenhado || 1)) * 100) ? Math.round((dadosFinanceiros.liquidado / (dadosFinanceiros.empenhado || 1)) * 100) : 0}% do empenhado`}
            icon={<ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />}
            color="green"
            loading={false}
          />

          <MetricCard
            title="PAGO"
            value={dadosFinanceiros.pago}
            description={`${Number.isFinite((dadosFinanceiros.pago / (dadosFinanceiros.liquidado || 1)) * 100) ? Math.round((dadosFinanceiros.pago / (dadosFinanceiros.liquidado || 1)) * 100) : 0}% do liquidado`}
            icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />}
            color="emerald"
            loading={false}
          />

          <MetricCard
            title="SALDO"
            value={dadosFinanceiros.saldo}
            description="Saldo disponível"
            icon={<BanknotesIcon className="w-6 h-6 text-orange-600" />}
            color="orange"
            loading={false}
          />
        </div>

        {/* Gráficos Financeiros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Controle Financeiro - Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Controle Financeiro {anoSelecionadoFinanceiro}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ControleFinanceiroChart data={dadosFinanceiros} loading={loading} />
            </CardContent>
          </Card>

          {/* Cronograma de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <ChartBarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                Cronograma de Pagamentos {anoSelecionadoFinanceiro}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CronogramaPagamentosChart
                meses={cronogramaPagamentos.meses}
                previsto={cronogramaPagamentos.previsto}
                realizado={cronogramaPagamentos.realizado}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Comparação entre Períodos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Comparação entre Períodos (2023-2025)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparacaoPeriodosChart
              periodos={comparacaoPeriodos.periodos}
              empenhado={comparacaoPeriodos.empenhado}
              liquidado={comparacaoPeriodos.liquidado}
              pago={comparacaoPeriodos.pago}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
