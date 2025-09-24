'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useServidores, useFolhaPagamento, useRHMetrics } from '@/hooks/useECidadeData';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';
import type { ChartData, TimeSeriesData } from '@/types/ecidade';

export default function RHPage() {
  const { data: metrics } = useRHMetrics();
  const { data: servidores } = useServidores();
  const { data: folha } = useFolhaPagamento();
  const { neon, gradient, getColorsForChart } = useChartStyle();
  const cargoColors = getColorsForChart('rh-cargo-pie');
  const lotacaoColors = getColorsForChart('rh-lotacao-bar');

  // Pie: distribuição por cargo
  const distPorCargo: ChartData = React.useMemo(() => {
    const counts = new Map<string, number>();
    (servidores?.data || []).forEach((s) => counts.set(s.cargo, (counts.get(s.cargo) || 0) + 1));
    const labels = Array.from(counts.keys());
    const data = labels.map((l) => counts.get(l) || 0);
    return {
      labels,
      datasets: [{ label: 'Servidores por Cargo', data, backgroundColor: cargoColors }],
    };
  }, [servidores, cargoColors]);

  // Bar: distribuição por lotação
  const distPorLotacao: ChartData = React.useMemo(() => {
    const counts = new Map<string, number>();
    (servidores?.data || []).forEach((s) => counts.set(s.lotacao, (counts.get(s.lotacao) || 0) + 1));
    const labels = Array.from(counts.keys());
    const data = labels.map((l) => counts.get(l) || 0);
    return {
      labels,
      datasets: [{ label: 'Servidores por Lotação', data, backgroundColor: lotacaoColors }],
    };
  }, [servidores, lotacaoColors]);

  // Line: evolução da folha (valor líquido por mês)
  const folhaSeries: TimeSeriesData[] = React.useMemo(() => {
    const items = (folha || []).slice().sort((a, b) => a.ano - b.ano || a.mes - b.mes);
    return items.map((f) => ({ date: `${f.ano}-${String(f.mes).padStart(2, '0')}-01`, value: f.total_liquido }));
  }, [folha]);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recursos Humanos</h1>
        <p className="mt-2 text-gray-600">Servidores, folha e indicadores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card><CardContent><div className="text-sm text-gray-500">Servidores</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_servidores ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Ativos</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.servidores_ativos ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Total da Folha</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.total_folha ?? 0)}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Média Salarial</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.media_salario ?? 0)}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <Card>
          <CardHeader><CardTitle>Evolução da Folha (Líquido)</CardTitle></CardHeader>
          <CardContent>
            <LineChart chartKey="rh-folha-line" data={folhaSeries} height={300} title="Folha por Mês" colors={getColorsForChart('rh-folha-line')} neon={neon} gradient={gradient} />
            <ChartColorPicker chartKey="rh-folha-line" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Servidores por Lotação</CardTitle></CardHeader>
          <CardContent>
            <BarChart chartKey="rh-lotacao-bar" data={distPorLotacao} height={300} showGrid colors={getColorsForChart('rh-lotacao-bar')} neon={neon} gradient={gradient} />
            <ChartColorPicker chartKey="rh-lotacao-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribuição por Cargo</CardTitle></CardHeader>
          <CardContent>
            <PieChart chartKey="rh-cargo-pie" data={distPorCargo} height={300} donut colors={getColorsForChart('rh-cargo-pie')} neon={neon} />
            <ChartColorPicker chartKey="rh-cargo-pie" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}


