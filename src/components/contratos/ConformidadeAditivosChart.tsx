'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { FiltrosContratos } from '@/types/contratos';

interface Props { 
  filters?: FiltrosContratos;
}

interface ConformidadeData {
  diretoria: string;
  total_contratos: number;
  contratos_conformes: number;
  contratos_atencao: number;
  contratos_inconformes: number;
  percentual_conformes: number;
  percentual_atencao: number;
  percentual_inconformes: number;
  valor_total_contratos: number;
  valor_inconformes: number;
}

export const ConformidadeAditivosChart: React.FC<Props> = ({ filters }) => {
  const { getColorsForChart } = useChartStyle();
  const [data, setData] = useState<ConformidadeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartHeight, setChartHeight] = useState(350);

  // Função para calcular altura responsiva
  const calculateChartHeight = () => {
    const width = window.innerWidth;
    if (width >= 1920) return 400; // Telas muito grandes
    if (width >= 1536) return 350; // xl
    if (width >= 1280) return 300; // lg
    if (width >= 1024) return 280; // md
    return 250; // sm e menores
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

        const response = await fetch(`/api/contratos/powerbi?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          // Processar dados para conformidade
          const conformidadeData = (result.data || []).map((item: any) => {
            const total = item.total_contratos || 0;
            const conformes = item.contratos_conformes || 0;
            const atencao = item.contratos_atencao || 0;
            const inconformes = item.contratos_inconformes || 0;
            
            return {
              diretoria: item.diretoria || 'Não informado',
              total_contratos: total,
              contratos_conformes: conformes,
              contratos_atencao: atencao,
              contratos_inconformes: inconformes,
              percentual_conformes: total > 0 ? (conformes / total) * 100 : 0,
              percentual_atencao: total > 0 ? (atencao / total) * 100 : 0,
              percentual_inconformes: total > 0 ? (inconformes / total) * 100 : 0,
              valor_total_contratos: item.valor_total_contratos || 0,
              valor_inconformes: item.valor_inconformes || 0
            };
          });
          
          setData(conformidadeData);
          setError(null);
        } else {
          setData([]);
          setError(null);
        }
      } catch (err) {
        setData([]);
        setError(null);
        console.error('Erro ao buscar dados de conformidade:', err);
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

  if (error || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Sem dados de conformidade</div>
          <div className="text-sm">Não há dados disponíveis para análise de conformidade</div>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico
  const chartData = {
    labels: data.map(item => {
      // Simplificar nomes das diretorias
      const nome = item.diretoria;
      if (nome.includes('DIRETORIA DE')) return nome.replace('DIRETORIA DE ', '');
      if (nome.includes('SECRETARIA DE')) return nome.replace('SECRETARIA DE ', '');
      if (nome.includes('DEPARTAMENTO DE')) return nome.replace('DEPARTAMENTO DE ', '');
      return nome;
    }),
    datasets: [
      {
        label: 'Conformes (%)',
        data: data.map(item => item.percentual_conformes),
        backgroundColor: '#10b981', // Verde
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Atenção (%)',
        data: data.map(item => item.percentual_atencao),
        backgroundColor: '#f59e0b', // Amarelo
        borderColor: '#d97706',
        borderWidth: 1,
      },
      {
        label: 'Inconformes (%)',
        data: data.map(item => item.percentual_inconformes),
        backgroundColor: '#ef4444', // Vermelho
        borderColor: '#dc2626',
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Conformidade de Aditivos por Diretoria (Lei 14.133/2021)',
        font: {
          size: 14,
          weight: 'bold' as const
        }
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y.toFixed(1);
            const index = context.dataIndex;
            const item = data[index];
            
            if (label.includes('Conformes')) {
              return `${label}: ${value}% (${item.contratos_conformes} contratos)`;
            } else if (label.includes('Atenção')) {
              return `${label}: ${value}% (${item.contratos_atencao} contratos)`;
            } else if (label.includes('Inconformes')) {
              return `${label}: ${value}% (${item.contratos_inconformes} contratos)`;
            }
            return `${label}: ${value}%`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Diretorias'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        title: {
          display: true,
          text: 'Percentual (%)'
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full" style={{ height: `${chartHeight}px` }}>
      <BarChart
        data={chartData}
        options={options}
        height={chartHeight}
      />
    </div>
  );
};
