'use client';

import React from 'react';
import { BarChart } from '@/components/charts/BarChart';

interface ControleFinanceiroChartProps {
  data?: {
    empenhado: number;
    liquidado: number;
    pago: number;
    saldo: number;
  };
  loading?: boolean;
}

export const ControleFinanceiroChart: React.FC<ControleFinanceiroChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  const chartData = {
    labels: ['Empenhado', 'Liquidado', 'Pago', 'Saldo'],
    datasets: [
      {
        label: 'Valor (R$)',
        data: [
          data?.empenhado || 0,
          data?.liquidado || 0,
          data?.pago || 0,
          data?.saldo || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Azul - Empenhado
          'rgba(16, 185, 129, 0.8)', // Verde - Liquidado
          'rgba(34, 197, 94, 0.8)',  // Verde claro - Pago
          'rgba(249, 115, 22, 0.8)', // Laranja - Saldo
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <BarChart data={chartData} />
    </div>
  );
};


