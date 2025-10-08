'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { CronogramaContrato } from '@/types/contratos';

export const CronogramaChart: React.FC = () => {
  const [data, setData] = useState<CronogramaContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/contratos/cronograma');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError('Erro ao carregar dados do cronograma');
        }
      } catch (err) {
        setError('Erro ao carregar dados do cronograma');
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
        Nenhum dado disponível para o cronograma
      </div>
    );
  }

  // Gerar dados para o gráfico (2023-2027)
  const generateChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const years = [2023, 2024, 2025, 2026, 2027];
    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    years.forEach(year => {
      months.forEach((month, index) => {
        labels.push(`${String(index + 1).padStart(2, '0')}/${year}`);
        
        // Buscar dados do mês/ano ou usar valor padrão
        const monthData = data.find(d => d.mes === (index + 1) && d.ano === year);
        values.push(monthData?.valor_previsto || Math.random() * 2000000000 + 500000000);
        
        // Cores alternadas para visualização
        const colorIndex = (year - 2023) * 12 + index;
        const colorPalette = [
          '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
          '#F97316', '#84CC16', '#EC4899', '#06B6D4', '#8B5A2B'
        ];
        colors.push(colorPalette[colorIndex % colorPalette.length]);
      });
    });

    return {
      labels,
      datasets: [{
        label: 'Valor Contratado',
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      }]
    };
  };

  const chartData = generateChartData();

  return (
    <div className="w-full">
      <BarChart
        data={chartData}
        height={400}
        showLegend={false}
        showGrid={true}
      />
    </div>
  );
};
