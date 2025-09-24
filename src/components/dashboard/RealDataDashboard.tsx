import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { MetricCard } from './MetricCard';
import { 
  useDashboardMetrics,
  useReceitas,
  useDespesas,
  useReceitasChart,
  useDespesasChart,
  useExecucaoOrcamentaria,
  useDadosFinanceiros
} from '@/hooks/useECidadeDatabaseData';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const RealDataDashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: receitas, isLoading: receitasLoading } = useReceitas();
  const { data: despesas, isLoading: despesasLoading } = useDespesas();
  const { data: receitasChart, isLoading: receitasChartLoading } = useReceitasChart();
  const { data: despesasChart, isLoading: despesasChartLoading } = useDespesasChart();
  const { data: execucaoData, isLoading: execucaoLoading } = useExecucaoOrcamentaria();
  const { data: dadosFinanceiros, isLoading: dadosLoading } = useDadosFinanceiros();

  if (metricsLoading || receitasLoading || despesasLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar dados: {metricsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receitas Previstas"
          value={metrics?.total_receitas_previstas ? `R$ ${metrics.total_receitas_previstas.toLocaleString('pt-BR')}` : 'R$ 0'}
          change={12.5}
          changeType="positive"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <MetricCard
          title="Receitas Arrecadadas"
          value={metrics?.total_receitas_arrecadadas ? `R$ ${metrics.total_receitas_arrecadadas.toLocaleString('pt-BR')}` : 'R$ 0'}
          change={8.2}
          changeType="positive"
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
        />
        <MetricCard
          title="Despesas Empenhadas"
          value={metrics?.total_despesas_empenhadas ? `R$ ${metrics.total_despesas_empenhadas.toLocaleString('pt-BR')}` : 'R$ 0'}
          change={-2.1}
          changeType="negative"
          icon={<ArrowTrendingDownIcon className="w-6 h-6" />}
        />
        <MetricCard
          title="Despesas Pagas"
          value={metrics?.total_despesas_pagas ? `R$ ${metrics.total_despesas_pagas.toLocaleString('pt-BR')}` : 'R$ 0'}
          change={5.3}
          changeType="positive"
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
      </div>

      {/* Gráficos de Receitas e Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {receitasChartLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <LineChart
                data={receitasChart || []}
                xKey="mes"
                yKey="total_arrecadado"
                height={300}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {despesasChartLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <BarChart
                data={despesasChart || []}
                xKey="mes"
                yKey="total_empenhado"
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Execução Orçamentária */}
      <Card>
        <CardHeader>
          <CardTitle>Execução Orçamentária</CardTitle>
        </CardHeader>
        <CardContent>
          {execucaoLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <LineChart
              data={execucaoData || []}
              xKey="mes"
              yKey="empenhado"
              height={400}
              multipleYKeys={['empenhado', 'pago']}
            />
          )}
        </CardContent>
      </Card>

      {/* Tabelas de Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            {receitasLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {receitas?.data?.slice(0, 5).map((receita: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{receita.descricao}</p>
                      <p className="text-sm text-gray-600">{receita.estrutural}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {receita.arrecadado?.toLocaleString('pt-BR') || '0'}</p>
                      <p className="text-sm text-gray-600">Prev: R$ {receita.previsaoinicial?.toLocaleString('pt-BR') || '0'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {despesasLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {despesas?.data?.slice(0, 5).map((despesa: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{despesa.numero_empenho}</p>
                      <p className="text-sm text-gray-600">{despesa.data_emissao}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {despesa.valor?.toLocaleString('pt-BR') || '0'}</p>
                      <p className="text-sm text-gray-600">Pago: R$ {despesa.valor_pago?.toLocaleString('pt-BR') || '0'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dados Financeiros Detalhados */}
      {dadosFinanceiros && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Receitas Previstas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {dadosFinanceiros.receitas_previstas?.toLocaleString('pt-BR') || '0'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Receitas Arrecadadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {dadosFinanceiros.receitas_arrecadadas?.toLocaleString('pt-BR') || '0'}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Despesas Empenhadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {dadosFinanceiros.despesas_empenhadas?.toLocaleString('pt-BR') || '0'}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Despesas Pagas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {dadosFinanceiros.despesas_pagas?.toLocaleString('pt-BR') || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
