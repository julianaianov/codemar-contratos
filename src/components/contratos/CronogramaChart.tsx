'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { CronogramaContrato } from '@/types/contratos';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

interface CronogramaChartProps {
  anoSelecionado?: string | number;
}

export const CronogramaChart: React.FC<CronogramaChartProps> = ({ anoSelecionado }) => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não houver dados, gerar dataset zerado para manter UI consistente
  const baseData = (data && data.length > 0) ? data : [];

  // Gerar dados para o gráfico
  const generateChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labels: string[] = [];
    const values: number[] = [];
    const chartColors = getColorsForChart('cronograma');

    // Se um ano específico foi selecionado, mostrar apenas esse ano
    if (anoSelecionado && anoSelecionado !== 'geral') {
      const ano = typeof anoSelecionado === 'string' ? parseInt(anoSelecionado) : anoSelecionado;
      
      months.forEach((month, index) => {
        labels.push(`${String(index + 1).padStart(2, '0')}/${ano}`);
        
        // Buscar dados do mês/ano ou usar valor padrão
        const monthData = baseData.find(d => d.mes === (index + 1) && d.ano === ano);
        values.push(monthData?.valor_previsto || 0);
      });
    } else {
      // Modo geral: mostrar todos os anos (2023-2027)
      const years = [2023, 2024, 2025, 2026, 2027];
      
      years.forEach(year => {
        months.forEach((month, index) => {
          labels.push(`${String(index + 1).padStart(2, '0')}/${year}`);
          
          // Buscar dados do mês/ano ou usar valor padrão
          const monthData = baseData.find(d => d.mes === (index + 1) && d.ano === year);
          values.push(monthData?.valor_previsto || 0);
        });
      });
    }

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
