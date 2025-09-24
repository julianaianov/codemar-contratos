'use client';

import React, { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';

interface Despesa {
  id: number;
  numero_empenho: string;
  descricao: string;
  valor: number;
  valor_liquidado: number;
  valor_pago: number;
  data_emissao: string;
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

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterData>({
    exercicio: new Date().getFullYear().toString(),
  });
  
  const { neon, gradient, getColorsForChart } = useChartStyle();

  const fetchDespesas = async (filterData: FilterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        path: 'despesas',
        year: filterData.exercicio,
      });
      
      if (filterData.instituicao) {
        params.append('instituicao', filterData.instituicao.toString());
      }
      
      const response = await fetch(`/api/ecidade/database?${params}`);
      const data = await response.json();
      
      setDespesas(data);
    } catch (err) {
      setError('Erro ao carregar despesas');
      console.error('Erro ao carregar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterData: FilterData) => {
    setFilters(filterData);
    fetchDespesas(filterData);
  };

  const handleClear = () => {
    setFilters({
      exercicio: new Date().getFullYear().toString(),
    });
    setDespesas([]);
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchDespesas(filters);
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

  const totalEmpenhado = despesas.reduce((sum, despesa) => sum + parseFloat(despesa.valor.toString()), 0);
  const totalLiquidado = despesas.reduce((sum, despesa) => sum + parseFloat(despesa.valor_liquidado.toString()), 0);
  const totalPago = despesas.reduce((sum, despesa) => sum + parseFloat(despesa.valor_pago.toString()), 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600">Consulta de despesas municipais</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Empenhado</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalEmpenhado)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Liquidado</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalLiquidado)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pago</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPago)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabela de despesas */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lista de Despesas
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
          ) : despesas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
                <thead className="bg-gray-50 dark:bg-secondary-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Empenho
                    </th>
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
                      Empenhado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Liquidado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pago
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-secondary-700">
                  {despesas.map((despesa) => (
                    <tr key={despesa.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {despesa.numero_empenho}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {despesa.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {despesa.instituicao_nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(despesa.data_emissao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {formatCurrency(parseFloat(despesa.valor.toString()))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        {formatCurrency(parseFloat(despesa.valor_liquidado.toString()))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(parseFloat(despesa.valor_pago.toString()))}
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
            <CardTitle>Despesas por Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              chartKey="despesas-instituicao-pie" 
              data={{
                labels: [...new Set(despesas.map(d => d.instituicao_nome || 'N/A'))],
                datasets: [{
                  label: 'Despesas por Instituição',
                  data: [...new Set(despesas.map(d => d.instituicao_nome || 'N/A'))].map(instituicao => 
                    despesas
                      .filter(d => d.instituicao_nome === instituicao)
                      .reduce((sum, d) => sum + parseFloat(d.valor.toString()), 0)
                  ),
                  backgroundColor: getColorsForChart('despesas-instituicao-pie')
                }]
              }} 
              height={320} 
              colors={getColorsForChart('despesas-instituicao-pie')} 
              donut 
              neon={neon} 
            />
            <ChartColorPicker chartKey="despesas-instituicao-pie" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              chartKey="despesas-status-bar" 
              data={{
                labels: ['Status das Despesas'],
                datasets: [
                  {
                    label: 'Empenhado',
                    data: [totalEmpenhado],
                    backgroundColor: '#3B82F6' // Azul
                  },
                  {
                    label: 'Liquidado',
                    data: [totalLiquidado],
                    backgroundColor: '#EF4444' // Vermelho
                  },
                  {
                    label: 'Pago',
                    data: [totalPago],
                    backgroundColor: '#10B981' // Verde
                  }
                ]
              }} 
              height={320} 
              colors={['#3B82F6', '#EF4444', '#10B981']} 
              neon={neon} 
              gradient={false} 
            />
            <ChartColorPicker chartKey="despesas-status-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              chartKey="despesas-mes-bar" 
              data={{
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [
                  {
                    label: 'Empenhado',
                    data: [600000, 380000, 180000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#3B82F6' // Azul
                  },
                  {
                    label: 'Liquidado',
                    data: [550000, 330000, 160000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#EF4444' // Vermelho
                  },
                  {
                    label: 'Pago',
                    data: [480000, 290000, 140000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#10B981' // Verde
                  }
                ]
              }} 
              height={320} 
              colors={['#3B82F6', '#EF4444', '#10B981']} 
              neon={neon} 
              gradient={false} 
            />
            <ChartColorPicker chartKey="despesas-mes-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução das Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              chartKey="despesas-evolucao-line" 
              data={despesas.map((d, i) => ({ 
                date: new Date(d.data_emissao).toISOString().split('T')[0], 
                value: parseFloat(d.valor.toString()) 
              }))} 
              height={320} 
              title="Despesas" 
              colors={getColorsForChart('despesas-evolucao-line')} 
              neon={neon} 
              gradient={gradient} 
            />
            <ChartColorPicker chartKey="despesas-evolucao-line" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}