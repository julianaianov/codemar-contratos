'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { ContratoPorAno } from '@/types/contratos';

export const ContratosPorAnoChart: React.FC = () => {
  const [data, setData] = useState<ContratoPorAno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const chartData = {
    labels: sortedData.map(item => item.ano.toString()),
    datasets: [
      {
        label: 'Valor Total',
        data: sortedData.map(item => item.valor_total),
        backgroundColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
          '#F97316', '#84CC16', '#EC4899', '#06B6D4', '#8B5A2B'
        ],
        borderColor: [
          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
          '#F97316', '#84CC16', '#EC4899', '#06B6D4', '#8B5A2B'
        ],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="w-full">
      <BarChart
        data={chartData}
        height={300}
        showLegend={false}
        showGrid={true}
      />
    </div>
  );
};
