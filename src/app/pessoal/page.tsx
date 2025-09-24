'use client';

import React, { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';

interface Pessoal {
  id: number;
  nome: string;
  cargo: string;
  salario: number;
  data_admissao: string;
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

export default function PessoalPage() {
  const [pessoal, setPessoal] = useState<Pessoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterData>({
    exercicio: new Date().getFullYear().toString(),
  });
  
  const { neon, gradient, getColorsForChart } = useChartStyle();

  const fetchPessoal = async (filterData: FilterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data para demonstração
      const mockPessoal: Pessoal[] = [
        {
          id: 1,
          nome: 'João Silva',
          cargo: 'Professor',
          salario: 5000,
          data_admissao: '2024-01-15',
          instituicao_nome: 'Secretaria de Educação'
        },
        {
          id: 2,
          nome: 'Maria Santos',
          cargo: 'Médico',
          salario: 8000,
          data_admissao: '2024-02-20',
          instituicao_nome: 'Secretaria de Saúde'
        },
        {
          id: 3,
          nome: 'Pedro Costa',
          cargo: 'Engenheiro',
          salario: 6000,
          data_admissao: '2024-03-10',
          instituicao_nome: 'Secretaria de Obras'
        }
      ];
      
      setPessoal(mockPessoal);
    } catch (err) {
      setError('Erro ao carregar dados do pessoal');
      console.error('Erro ao carregar dados do pessoal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterData: FilterData) => {
    setFilters(filterData);
    fetchPessoal(filterData);
  };

  const handleClear = () => {
    setFilters({
      exercicio: new Date().getFullYear().toString(),
    });
    setPessoal([]);
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchPessoal(filters);
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

  const totalPessoal = pessoal.length;
  const totalSalarios = pessoal.reduce((sum, p) => sum + p.salario, 0);
  const salarioMedio = totalPessoal > 0 ? totalSalarios / totalPessoal : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pessoal</h1>
          <p className="text-gray-600">Gestão de recursos humanos</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Servidores</h3>
            <p className="text-2xl font-bold text-blue-600">
              {totalPessoal}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Salários</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSalarios)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Salário Médio</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(salarioMedio)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabela de pessoal */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lista de Servidores
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
          ) : pessoal.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum servidor encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instituição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Admissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salário
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pessoal.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {p.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.cargo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.instituicao_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(p.data_admissao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(p.salario)}
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
            <CardTitle>Pessoal por Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              chartKey="pessoal-instituicao-pie" 
              data={{
                labels: Array.from(new Set(pessoal.map(p => p.instituicao_nome || 'N/A'))),
                datasets: [{
                  label: 'Pessoal por Instituição',
                  data: Array.from(new Set(pessoal.map(p => p.instituicao_nome || 'N/A'))).map(instituicao => 
                    pessoal.filter(p => p.instituicao_nome === instituicao).length
                  ),
                  backgroundColor: getColorsForChart('pessoal-instituicao-pie')
                }]
              }} 
              height={320} 
              colors={getColorsForChart('pessoal-instituicao-pie')} 
              donut 
              neon={neon} 
            />
            <ChartColorPicker chartKey="pessoal-instituicao-pie" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salários por Cargo</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              chartKey="pessoal-cargo-bar" 
              data={{
                labels: pessoal.map(p => p.cargo),
                datasets: [{
                  label: 'Salários',
                  data: pessoal.map(p => p.salario),
                  backgroundColor: getColorsForChart('pessoal-cargo-bar')
                }]
              }} 
              height={320} 
              colors={getColorsForChart('pessoal-cargo-bar')} 
              neon={neon} 
              gradient={gradient} 
            />
            <ChartColorPicker chartKey="pessoal-cargo-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Salários</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              chartKey="pessoal-salarios-line" 
              data={pessoal.map((p, i) => ({ 
                date: new Date(p.data_admissao).toISOString().split('T')[0], 
                value: p.salario 
              }))} 
              height={320} 
              title="Salários" 
              colors={getColorsForChart('pessoal-salarios-line')} 
              neon={neon} 
              gradient={gradient} 
            />
            <ChartColorPicker chartKey="pessoal-salarios-line" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}