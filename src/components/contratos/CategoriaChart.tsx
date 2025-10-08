'use client';

import React, { useState, useEffect } from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { ContratoPorCategoria } from '@/types/contratos';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

export const CategoriaChart: React.FC = () => {
  const { getColorsForChart } = useChartStyle();
  const [data, setData] = useState<ContratoPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/contratos/categorias');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError('Erro ao carregar dados das categorias');
        }
      } catch (err) {
        setError('Erro ao carregar dados das categorias');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível para as categorias
      </div>
    );
  }

  const chartColors = getColorsForChart('categorias');
  const pieColors = data.map((_, index) => chartColors[index % chartColors.length]);
  
  const chartData = {
    labels: data.map(item => item.categoria),
    datasets: [{
      label: 'Contratos por Categoria',
      data: data.map(item => item.quantidade),
      backgroundColor: pieColors,
      borderColor: pieColors,
      borderWidth: 2,
    }]
  };

  return (
    <div className="w-full">
      <PieChart
        data={chartData}
        height={300}
        showLegend={true}
      />
    </div>
  );
};
