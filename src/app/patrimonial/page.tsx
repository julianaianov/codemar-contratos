'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { usePatrimonialMetrics, useBens, useLicitacoes } from '@/hooks/useECidadeData';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';
import type { ChartData, TimeSeriesData } from '@/types/ecidade';

export default function PatrimonialPage() {
  const { data: metrics } = usePatrimonialMetrics();
  const { data: bens } = useBens();
  const { data: licitacoes } = useLicitacoes();
  const { neon, gradient, getColorsForChart } = useChartStyle();
  const bensColors = getColorsForChart('patrimonial-bens-pie');
  const licitacoesColors = getColorsForChart('patrimonial-licitacoes-bar');

  // Pie: distribuição de bens por categoria
  const distBensCategoria: ChartData = React.useMemo(() => {
    const counts = new Map<string, number>();
    (bens?.data || []).forEach((b) => counts.set(b.categoria, (counts.get(b.categoria) || 0) + 1));
    const labels = Array.from(counts.keys());
    const data = labels.map((l) => counts.get(l) || 0);
    return {
      labels,
      datasets: [{ label: 'Bens por Categoria', data, backgroundColor: bensColors }],
    };
  }, [bens, bensColors]);

  // Bar: licitações por modalidade
  const distLicitacoesModalidade: ChartData = React.useMemo(() => {
    const counts = new Map<string, number>();
    (licitacoes?.data || []).forEach((l) => counts.set(l.modalidade, (counts.get(l.modalidade) || 0) + 1));
    const labels = Array.from(counts.keys());
    const data = labels.map((l) => counts.get(l) || 0);
    return {
      labels,
      datasets: [{ label: 'Licitacoes por Modalidade', data, backgroundColor: licitacoesColors }],
    };
  }, [licitacoes, licitacoesColors]);

  // Line: evolução do valor contratado (mock simples por data)
  const licitacoesSeries: TimeSeriesData[] = React.useMemo(() => {
    const items = (licitacoes?.data || []).slice(0, 12);
    return items.map((l, i) => ({ date: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`, value: l.valor_contratado }));
  }, [licitacoes]);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patrimonial</h1>
        <p className="mt-2 text-gray-600">Bens, licitações e valores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card><CardContent><div className="text-sm text-gray-500">Bens</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_bens ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Valor Total</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.valor_total_bens ?? 0)}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Licitações</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_licitacoes ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Valor Licitações</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.valor_total_licitacoes ?? 0)}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <Card>
          <CardHeader><CardTitle>Bens por Categoria</CardTitle></CardHeader>
          <CardContent>
            <PieChart chartKey="patrimonial-bens-pie" data={distBensCategoria} height={300} donut colors={getColorsForChart('patrimonial-bens-pie')} neon={neon} />
            <ChartColorPicker chartKey="patrimonial-bens-pie" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Licitacões por Modalidade</CardTitle></CardHeader>
          <CardContent>
            <BarChart chartKey="patrimonial-licitacoes-bar" data={distLicitacoesModalidade} height={300} showGrid colors={getColorsForChart('patrimonial-licitacoes-bar')} neon={neon} gradient={gradient} />
            <ChartColorPicker chartKey="patrimonial-licitacoes-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Evolução Valor Contratado</CardTitle></CardHeader>
          <CardContent>
            <LineChart chartKey="patrimonial-valor-line" data={licitacoesSeries} height={300} title="Valor Contratado por Mês" colors={getColorsForChart('patrimonial-valor-line')} neon={neon} gradient={gradient} />
            <ChartColorPicker chartKey="patrimonial-valor-line" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}


