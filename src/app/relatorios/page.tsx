'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { useRelatorioFinanceiro, useRelatorioTributario, useRelatorioEducacao, useRelatorioSaude } from '@/hooks/useECidadeData';

export default function RelatoriosPage() {
  const [filters, setFilters] = useState<any>();
  const { data: fin } = useRelatorioFinanceiro(filters);
  const { data: trib } = useRelatorioTributario(filters);
  const { data: edu } = useRelatorioEducacao(filters);
  const { data: sau } = useRelatorioSaude(filters);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-2 text-gray-600">Visões consolidadas por área</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={fin?.receitas || { labels: [], datasets: [] }} height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tributário</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={trib?.arrecadacao || { labels: [], datasets: [] }} height={280} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle>Educação</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={edu?.escolas || { labels: [], datasets: [] }} height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saúde</CardTitle></CardHeader>
          <CardContent>
            <LineChart data={sau?.demanda || []} height={280} title="Demanda" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}


