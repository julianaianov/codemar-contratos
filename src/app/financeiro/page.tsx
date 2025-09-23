'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { useOrcamento, useReceitasChart, useDespesasChart, useExecucaoOrcamentaria } from '@/hooks/useECidadeData';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function FinanceiroPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const { data: orcamento, isLoading: orcamentoLoading } = useOrcamento(filters);
  const { data: receitasChart, isLoading: receitasLoading } = useReceitasChart(filters);
  const { data: despesasChart, isLoading: despesasLoading } = useDespesasChart(filters);
  const { data: execucaoData, isLoading: execucaoLoading } = useExecucaoOrcamentaria(filters);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <div className="lg:pl-64">
          <Header onMenuClick={toggleSidebar} />
          
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestão Financeira
                </h1>
                <p className="mt-2 text-gray-600">
                  Controle orçamentário e execução financeira
                </p>
              </div>

              {/* Resumo Orçamentário */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas Previstas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(orcamento?.receitas.reduce((sum, r) => sum + r.valor_previsto, 0) || 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {orcamento?.receitas.length || 0} categorias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Despesas Empenhadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(orcamento?.despesas.reduce((sum, d) => sum + d.valor_empenhado, 0) || 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {orcamento?.despesas.length || 0} categorias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Saldo Orçamentário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(orcamento?.saldo || 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {orcamento?.percentual_execucao || 0}% executado
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução das Receitas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={execucaoData || []}
                      height={300}
                      title="Receitas por Mês"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evolução das Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={execucaoData || []}
                      height={300}
                      title="Despesas por Mês"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição das Receitas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={receitasChart || { labels: [], datasets: [] }}
                      height={300}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição das Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={despesasChart || { labels: [], datasets: [] }}
                      height={300}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

