'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';
import { useEscolas, useAlunos, useEducacaoMetrics, useRelatorioEducacao } from '@/hooks/useECidadeData';

export default function EducacaoPage() {
  const { data: metrics } = useEducacaoMetrics();
  const { data: relatorio } = useRelatorioEducacao();
  const { neon, gradient, getColorsForChart } = useChartStyle();

  const chart = relatorio?.matriculas || { labels: [], datasets: [] };
  const escolasChart = relatorio?.escolas || { labels: [], datasets: [] };
  const evasaoSerie = relatorio?.evasao || [];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Educação</h1>
        <p className="mt-2 text-gray-600">Matrículas, evasão e indicadores educacionais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card><CardContent><div className="text-sm text-gray-500">Escolas</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_escolas ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Alunos</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_alunos ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Professores</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_professores ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Turmas</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_turmas ?? '-'}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle>Matrículas por Ano</CardTitle></CardHeader>
          <CardContent>
            <BarChart chartKey="educacao-matriculas-bar" data={chart} height={320} colors={getColorsForChart('educacao-matriculas-bar')} neon={neon} gradient={gradient} />
            <ChartColorPicker chartKey="educacao-matriculas-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Escolas por Categoria</CardTitle></CardHeader>
          <CardContent>
            <PieChart chartKey="educacao-escolas-pie" data={escolasChart} height={320} colors={getColorsForChart('educacao-escolas-pie')} donut neon={neon} />
            <ChartColorPicker chartKey="educacao-escolas-pie" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Evasão ao Longo do Tempo</CardTitle></CardHeader>
          <CardContent>
            <LineChart chartKey="educacao-evasao-line" data={evasaoSerie} height={320} title="Evasão" colors={getColorsForChart('educacao-evasao-line')} neon={neon} gradient={gradient} />
            <ChartColorPicker chartKey="educacao-evasao-line" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}


