'use client';

import React, { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';

interface Receita {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  instituicao_nome: string;
}

interface FilterData {
  exercicio: string;
  instituicao?: number;
  credor?: string;
  elemento?: string;
  fonte?: string;
  funcao?: string;
  subfuncao?: string;
  programa?: string;
  projeto?: string;
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterData>({
    exercicio: new Date().getFullYear().toString(),
  });
  
  const { neon, gradient, getColorsForChart } = useChartStyle();

  const fetchReceitas = async (filterData: FilterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        path: 'receitas',
        year: filterData.exercicio,
      });
      
      if (filterData.instituicao) {
        params.append('instituicao', filterData.instituicao.toString());
      }
      
      const response = await fetch(`/api/ecidade/database?${params}`);
      const data = await response.json();
      
      setReceitas(data);
    } catch (err) {
      setError('Erro ao carregar receitas');
      console.error('Erro ao carregar receitas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterData: FilterData) => {
    setFilters(filterData);
    fetchReceitas(filterData);
  };

  const handleClear = () => {
    setFilters({
      exercicio: new Date().getFullYear().toString(),
    });
    setReceitas([]);
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchReceitas(filters);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalReceitas = receitas.reduce((sum, receita) => sum + parseFloat(receita.valor.toString()), 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">Consulta de receitas municipais</p>
        </div>
        <div className="text-sm text-gray-500">
          <span>← Voltar</span>
        </div>
      </div>

      {/* Filtros */}
      <FilterPanel 
        onFilter={handleFilter}
        onClear={handleClear}
        loading={loading}
      />

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Receitas</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceitas)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabela de receitas */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lista de Receitas
            {filters.instituicao && (
              <span className="text-sm text-gray-500 ml-2">
                (Filtrado por instituição)
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : receitas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma receita encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
                <thead className="bg-gray-50 dark:bg-secondary-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Instituição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
                  {receitas.map((receita) => (
                    <tr key={receita.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {receita.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {receita.instituicao_nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(receita.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(parseFloat(receita.valor.toString()))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              chartKey="receitas-instituicao-pie" 
              data={{
                labels: [...new Set(receitas.map(r => r.instituicao_nome || 'N/A'))],
                datasets: [{
                  label: 'Receitas por Instituição',
                  data: [...new Set(receitas.map(r => r.instituicao_nome || 'N/A'))].map(instituicao => 
                    receitas
                      .filter(r => r.instituicao_nome === instituicao)
                      .reduce((sum, r) => sum + parseFloat(r.valor.toString()), 0)
                  ),
                  backgroundColor: getColorsForChart('receitas-instituicao-pie')
                }]
              }} 
              height={320} 
              colors={getColorsForChart('receitas-instituicao-pie')} 
              donut 
              neon={neon} 
            />
            <ChartColorPicker chartKey="receitas-instituicao-pie" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              chartKey="receitas-mes-bar" 
              data={{
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [
                  {
                    label: 'Receitas Tributárias',
                    data: [450000, 380000, 420000, 350000, 400000, 380000, 410000, 390000, 430000, 400000, 420000, 450000],
                    backgroundColor: '#3B82F6' // Azul
                  },
                  {
                    label: 'Receitas de Transferências',
                    data: [320000, 280000, 300000, 250000, 290000, 270000, 310000, 280000, 300000, 290000, 310000, 330000],
                    backgroundColor: '#10B981' // Verde
                  },
                  {
                    label: 'Outras Receitas',
                    data: [180000, 150000, 160000, 140000, 170000, 160000, 190000, 170000, 180000, 175000, 185000, 200000],
                    backgroundColor: '#F59E0B' // Amarelo
                  }
                ]
              }} 
              height={320} 
              colors={['#3B82F6', '#10B981', '#F59E0B']} 
              neon={neon} 
              gradient={false} 
            />
            <ChartColorPicker chartKey="receitas-mes-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução das Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              chartKey="receitas-evolucao-line" 
              data={receitas.map((r, i) => ({ 
                date: new Date(r.data).toISOString().split('T')[0], 
                value: parseFloat(r.valor.toString()) 
              }))} 
              height={320} 
              title="Receitas" 
              colors={getColorsForChart('receitas-evolucao-line')} 
              neon={neon} 
              gradient={gradient} 
            />
            <ChartColorPicker chartKey="receitas-evolucao-line" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}