'use client';

import React, { useState, useEffect } from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { ContratoPorCategoria } from '@/types/contratos';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { FiltrosContratos } from '@/types/contratos';

interface Props { filters?: FiltrosContratos }

export const CategoriaChart: React.FC<Props> = ({ filters }) => {
  const { getColorsForChart } = useChartStyle();
  const [data, setData] = useState<ContratoPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartHeight, setChartHeight] = useState(350);

  // Função para calcular altura responsiva
  const calculateChartHeight = () => {
    const width = window.innerWidth;
    if (width >= 1920) return 500; // Telas muito grandes
    if (width >= 1536) return 450; // xl
    if (width >= 1280) return 400; // lg
    if (width >= 1024) return 350; // md
    return 300; // sm e menores
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
        const response = await fetch(`/api/contratos/categorias?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data || []);
          setError(null);
        } else {
          // Em caso de falha, manter gráfico zerado
          setData([]);
          setError(null);
        }
      } catch (err) {
        // Não exibir erro: manter gráfico zerado
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

  // Sempre renderizar o gráfico; se não houver dados, usar dataset zerado
  const effectiveData: ContratoPorCategoria[] = (data && data.length > 0)
    ? data
    : [{ categoria: 'Sem dados', quantidade: 0, valor_total: 0, percentual: 0, cor: '#e5e7eb' }];

  const chartColors = getColorsForChart('categorias');
  const pieColors = effectiveData.map((_, index) => chartColors[index % chartColors.length]);
  
  const chartData = {
    labels: effectiveData.map(item => item.categoria),
    datasets: [{
      label: 'Contratos por Categoria',
      data: effectiveData.map(item => item.quantidade),
      backgroundColor: pieColors,
      borderColor: pieColors,
      borderWidth: 2,
    }]
  };

  return (
    <div className="w-full">
      <PieChart
        data={chartData}
        height={chartHeight}
        showLegend={true}
      />
    </div>
  );
};
