'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { CronogramaContrato } from '@/types/contratos';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

export const CronogramaChart: React.FC = () => {
  const { getColorsForChart, gradient, neon } = useChartStyle();
  const [data, setData] = useState<CronogramaContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartHeight, setChartHeight] = useState(500);

  // Função para calcular altura responsiva
  const calculateChartHeight = () => {
    const width = window.innerWidth;
    if (width >= 1920) return 800; // Telas muito grandes
    if (width >= 1536) return 700; // xl
    if (width >= 1280) return 600; // lg
    if (width >= 1024) return 500; // md
    return 400; // sm e menores
  };

  useEffect(() => {
    const handleResize = () => {
      setChartHeight(calculateChartHeight());
    };

    // Definir altura inicial
    setChartHeight(calculateChartHeight());

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const chartColors = getColorsForChart('cronograma');

    years.forEach(year => {
      months.forEach((month, index) => {
        labels.push(`${String(index + 1).padStart(2, '0')}/${year}`);
        
        // Buscar dados do mês/ano ou usar valor padrão
        const monthData = data.find(d => d.mes === (index + 1) && d.ano === year);
        values.push(monthData?.valor_previsto || Math.random() * 2000000000 + 500000000);
      });
    });

    return {
      labels,
      datasets: [{
        label: 'Valor Contratado',
        data: values,
        backgroundColor: chartColors,
        borderColor: chartColors,
        borderWidth: 1,
      }]
    };
  };

  const chartData = generateChartData();

  return (
    <div className="w-full">
      <BarChart
        data={chartData}
        height={chartHeight}
        showLegend={false}
        showGrid={true}
        colors={getColorsForChart('cronograma')}
        gradient={gradient}
        neon={neon}
        chartKey="cronograma"
      />
    </div>
  );
};
