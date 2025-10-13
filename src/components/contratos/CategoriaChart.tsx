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

        // Se o filtro for especificamente "OUTROS", buscar as diretorias individuais que estão em OUTROS
        const currentFilter = filters?.diretoria;
        if (currentFilter === 'OUTROS') {
          const response = await fetch('/api/contratos/diretorias-outros');
          const result = await response.json();
          
          if (result.success) {
            // Função para deixar rótulos curtos e amigáveis
            const shortLabel = (s: string) => {
              const original = (s || '').toString().trim();
              const cleaned = original
                .replace(/^\s*(DIRETORIA\s+DE\s+|DIRETORIA\s+|SECRETARIA\s+DE\s+|SECRETARIA\s+|DEPARTAMENTO\s+DE\s+)/i, '')
                .trim();
              return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            };

            const adapted = (result.data || []).map((item: any) => ({
              categoria: shortLabel(item.diretoria),
              quantidade: item.quantidade,
              valor_total: item.valor_total,
              percentual: 0,
              cor: '#60a5fa'
            }));
            setData(adapted);
            setError(null);
          } else {
            setData([]);
            setError(null);
          }
        } else {
          // Para TODOS os outros filtros (Todas, OPERAÇÕES, ADMINISTRAÇÃO, etc.), usar a lógica anterior
          const response = await fetch(`/api/contratos/diretorias?${params.toString()}`);
          const result = await response.json();
          
          if (result.success) {
            // Função para deixar rótulos curtos e amigáveis (remover prefixos)
            const shortLabel = (s: string) => {
              const original = (s || '').toString().trim();
              const upper = original.toUpperCase();
              if (upper === 'OUTRAS DIRETORIAS') return 'Outras';
              // remove prefixos comuns
              const cleaned = original
                .replace(/^\s*(DIRETORIA\s+DE\s+|DIRETORIA\s+|SECRETARIA\s+DE\s+|SECRETARIA\s+|DEPARTAMENTO\s+DE\s+)/i, '')
                .trim();
              // normaliza capitalização
              return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            };

            // Adaptar para formato do pie: usar diretoria como categoria (sem o prefixo)
            const adapted = (result.data || []).map((item: any) => ({
              categoria: shortLabel(item.diretoria),
              quantidade: item.quantidade,
              valor_total: item.valor_total,
              percentual: 0,
              cor: '#60a5fa'
            }));
            setData(adapted);
            setError(null);
          } else {
            // Em caso de falha, manter gráfico zerado
            setData([]);
            setError(null);
          }
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

  const baseColors = getColorsForChart('categorias');
  // Colore cada diretoria de forma consistente: hash do nome -> índice
  const indexFor = (label: string) => {
    let h = 0;
    for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
    return (h + 7) % baseColors.length; // pequeno deslocamento para dispersar
  };
  // Garante cores únicas no conjunto visível: se cor já usada, avança para próxima disponível
  const used = new Set<number>();
  const pieColors = effectiveData.map(item => {
    let idx = indexFor(item.categoria);
    let guard = 0;
    while (used.has(idx) && guard < baseColors.length) {
      idx = (idx + 1) % baseColors.length;
      guard++;
    }
    used.add(idx);
    return baseColors[idx];
  });
  
  const chartData = {
    labels: effectiveData.map(item => item.categoria),
    datasets: [{
      label: 'Valor por Diretoria',
      data: effectiveData.map(item => item.valor_total),
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
        colors={pieColors}
      />
    </div>
  );
};
