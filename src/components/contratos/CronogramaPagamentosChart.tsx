'use client';

import React from 'react';
import { BarChart } from '@/components/charts/BarChart';

interface CronogramaPagamentosChartProps {
  meses?: string[];
  previsto?: number[];
  realizado?: number[];
  loading?: boolean;
}

export const CronogramaPagamentosChart: React.FC<CronogramaPagamentosChartProps> = ({
  meses = [],
  previsto = [],
  realizado = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Previsto',
        data: previsto,
        backgroundColor: 'rgba(148, 163, 184, 0.7)',
        borderColor: 'rgb(148, 163, 184)',
        borderWidth: 2,
      },
      {
        label: 'Realizado',
        data: realizado,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full h-full" style={{ height: '300px' }}>
      <BarChart data={chartData} height={300} />
    </div>
  );
};


