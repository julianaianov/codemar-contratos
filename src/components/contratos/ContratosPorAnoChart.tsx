'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { ContratoPorAno, FiltrosContratos } from '@/types/contratos';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

interface Props { filters?: FiltrosContratos }

export const ContratosPorAnoChart: React.FC<Props> = ({ filters }) => {
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
        const params = new URLSearchParams();
        if (filters?.diretoria) {
          params.append('diretoria', String(filters.diretoria));
        } else {
          const savedFilters = sessionStorage.getItem('contratos:filters');
          if (savedFilters) {
            const parsed = JSON.parse(savedFilters);
            if (parsed.diretoria) params.append('diretoria', parsed.diretoria);
          }
        }
        const response = await fetch(`/api/contratos/por-ano?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data || []);
          setError(null);
        } else {
          setData([]);
          setError(null);
        }
      } catch (err) {
        setData([]);
        setError(null);
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters?.diretoria]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Always render chart; if empty, show zeroed dataset
  const safeData = (data && data.length > 0) ? data : [{ ano: new Date().getFullYear(), quantidade: 0, valor_total: 0, valor_pago: 0 }];

  // Ordenar dados por ano (mais recente primeiro)
  const sortedData = [...safeData].sort((a, b) => b.ano - a.ano);
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
