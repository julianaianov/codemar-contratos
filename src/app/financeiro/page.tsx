'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { useOrcamento, useReceitasChart, useDespesasChart, useExecucaoOrcamentaria } from '@/hooks/useECidadeData';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

export default function FinanceiroPage() {
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

  const { neon, gradient, colors: chartColors } = useChartStyle();

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão Financeira</h1>
        <p className="mt-2 text-gray-600">Controle orçamentário e execução financeira</p>
      </div>

      {/* Estilo global vem do header; mantemos a área limpa na página */}

      {/* Resumo Orçamentário */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Receitas Previstas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
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
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
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
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Evolução das Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={execucaoData || []} height={300} title="Receitas por Mês" colors={chartColors} neon={neon} gradient={gradient} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução das Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={execucaoData || []} height={300} title="Despesas por Mês" colors={chartColors} neon={neon} gradient={gradient} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição das Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={receitasChart || { labels: [], datasets: [] }} height={300} colors={chartColors} donut neon={neon} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição das Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={despesasChart || { labels: [], datasets: [] }} height={300} colors={chartColors} donut neon={neon} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

