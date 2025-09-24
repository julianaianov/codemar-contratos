'use client';

import React, { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';
import { ChartColorPicker } from '@/components/charts/ChartColorPicker';

interface Contrato {
  id: number;
  numero: string;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string;
  status: string;
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

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterData>({
    exercicio: new Date().getFullYear().toString(),
  });
  
  const { neon, gradient, getColorsForChart } = useChartStyle();

  const fetchContratos = async (filterData: FilterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data para demonstração
      const mockContratos: Contrato[] = [
        {
          id: 1,
          numero: 'CT-2024-001',
          descricao: 'Fornecimento de Material de Escritório',
          valor: 50000,
          data_inicio: '2024-01-01',
          data_fim: '2024-12-31',
          status: 'Ativo',
          instituicao_nome: 'Prefeitura Municipal'
        },
        {
          id: 2,
          numero: 'CT-2024-002',
          descricao: 'Serviços de Limpeza',
          valor: 120000,
          data_inicio: '2024-02-01',
          data_fim: '2024-11-30',
          status: 'Ativo',
          instituicao_nome: 'Secretaria de Administração'
        },
        {
          id: 3,
          numero: 'CT-2024-003',
          descricao: 'Manutenção de Equipamentos',
          valor: 80000,
          data_inicio: '2024-03-01',
          data_fim: '2024-12-31',
          status: 'Ativo',
          instituicao_nome: 'Secretaria de Obras'
        }
      ];
      
      setContratos(mockContratos);
    } catch (err) {
      setError('Erro ao carregar dados dos contratos');
      console.error('Erro ao carregar dados dos contratos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterData: FilterData) => {
    setFilters(filterData);
    fetchContratos(filterData);
  };

  const handleClear = () => {
    setFilters({
      exercicio: new Date().getFullYear().toString(),
    });
    setContratos([]);
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchContratos(filters);
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

  const totalContratos = contratos.length;
  const totalValor = contratos.reduce((sum, c) => sum + c.valor, 0);
  const contratosAtivos = contratos.filter(c => c.status === 'Ativo').length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600">Gestão de contratos municipais</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Contratos</h3>
            <p className="text-2xl font-bold text-blue-600">
              {totalContratos}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Valor Total</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalValor)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contratos Ativos</h3>
            <p className="text-2xl font-bold text-purple-600">
              {contratosAtivos}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabela de contratos */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lista de Contratos
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
          ) : contratos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum contrato encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instituição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Início
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Fim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contratos.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {c.numero}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {c.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.instituicao_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(c.data_inicio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(c.data_fim)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          c.status === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(c.valor)}
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
            <CardTitle>Contratos por Instituição</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              chartKey="contratos-instituicao-pie" 
              data={{
                labels: Array.from(new Set(contratos.map(c => c.instituicao_nome || 'N/A'))),
                datasets: [{
                  label: 'Contratos por Instituição',
                  data: Array.from(new Set(contratos.map(c => c.instituicao_nome || 'N/A'))).map(instituicao => 
                    contratos.filter(c => c.instituicao_nome === instituicao).length
                  ),
                  backgroundColor: getColorsForChart('contratos-instituicao-pie')
                }]
              }} 
              height={320} 
              colors={getColorsForChart('contratos-instituicao-pie')} 
              donut 
              neon={neon} 
            />
            <ChartColorPicker chartKey="contratos-instituicao-pie" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              chartKey="contratos-status-bar" 
              data={{
                labels: ['Ativo', 'Inativo'],
                datasets: [{
                  label: 'Valores',
                  data: [
                    contratos.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + c.valor, 0),
                    contratos.filter(c => c.status !== 'Ativo').reduce((sum, c) => sum + c.valor, 0)
                  ],
                  backgroundColor: ['#10B981', '#EF4444'] // Verde para Ativo, Vermelho para Inativo
                }]
              }} 
              height={320} 
              colors={['#10B981', '#EF4444']} 
              neon={neon} 
              gradient={false} 
            />
            <ChartColorPicker chartKey="contratos-status-bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              chartKey="contratos-evolucao-line" 
              data={contratos.map((c, i) => ({ 
                date: new Date(c.data_inicio).toISOString().split('T')[0], 
                value: c.valor 
              }))} 
              height={320} 
              title="Valores dos Contratos" 
              colors={getColorsForChart('contratos-evolucao-line')} 
              neon={neon} 
              gradient={gradient} 
            />
            <ChartColorPicker chartKey="contratos-evolucao-line" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}