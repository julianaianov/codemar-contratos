'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { ContratoPorAno } from '@/types/contratos';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

export const ContratosPorAnoChart: React.FC = () => {
  const { getColorsForChart, gradient, neon } = useChartStyle();
  const [data, setData] = useState<ContratoPorAno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartHeight, setChartHeight] = useState(400);

  // Função para calcular altura responsiva
  const calculateChartHeight = () => {
    const width = window.innerWidth;
    if (width >= 1920) return 700; // Telas muito grandes
    if (width >= 1536) return 600; // xl
    if (width >= 1280) return 500; // lg
    if (width >= 1024) return 400; // md
    return 350; // sm e menores
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
        const response = await fetch('/api/contratos/por-ano');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError('Erro ao carregar dados por ano');
        }
      } catch (err) {
        setError('Erro ao carregar dados por ano');
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
        Nenhum dado disponível por ano
      </div>
    );
  }

  // Ordenar dados por ano (mais recente primeiro)
  const sortedData = [...data].sort((a, b) => b.ano - a.ano);
  const chartColors = getColorsForChart('por-ano');

  const chartData = {
    labels: sortedData.map(item => item.ano.toString()),
    datasets: [
      {
        label: 'Valor Total',
        data: sortedData.map(item => item.valor_total),
        backgroundColor: chartColors,
        borderColor: chartColors,
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="w-full">
      <BarChart
        data={chartData}
        height={chartHeight}
        showLegend={false}
        showGrid={true}
        colors={chartColors}
        gradient={gradient}
        neon={neon}
        chartKey="por-ano"
      />
    </div>
  );
};
