'use client';

import React, { useState } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface FilterData {
  exercicio: string;
  instituicao?: string;
  mes?: string;
}

export default function ReceitasPage() {
  const [filters, setFilters] = useState<FilterData>({
    exercicio: '2024',
    instituicao: '',
    mes: '',
  });

  const [data, setData] = useState({
    previsto: 650000.00,
    arrecadado: 335000.00,
    adicional: 0.00,
    diferenca: 315000.00,
  });

  const handleFilter = (newFilters: FilterData) => {
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Previsto',
        data: [150000, 200000, 100000, 80000, 120000, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Arrecadado',
        data: [25000, 70000, 85000, 65000, 55000, 35000, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
              <nav className="flex space-x-2 text-sm text-gray-500 mt-1">
                <span>Início</span>
                <span>›</span>
                <span className="text-gray-900">Receitas</span>
                <span>›</span>
                <span className="text-gray-900">Instituições</span>
              </nav>
            </div>
            <button className="text-gray-600 hover:text-gray-900">
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Aviso */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-sm text-yellow-800">
              <p>
                O filtro "Exercício" mostra apenas os anos com dados registrados. 
                Se um ano não aparecer na lista, significa que não existem dados para aquele período.
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <FilterPanel
            title="Consulta de Dados"
            onFilter={handleFilter}
            showInstitution={true}
            showYear={true}
            showMonth={false}
          />
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Previsto"
            value={`R$ ${data.previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            className="bg-blue-50 border-blue-200"
          />
          <MetricCard
            title="Arrecadado"
            value={`R$ ${data.arrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            className="bg-green-50 border-green-200"
          />
          <MetricCard
            title="Adicional"
            value={`R$ ${data.adicional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            className="bg-purple-50 border-purple-200"
          />
          <MetricCard
            title="Diferença"
            value={`R$ ${data.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<ChartBarIcon className="w-6 h-6" />}
            className="bg-orange-50 border-orange-200"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Receitas por Mês - Exercício {filters.exercicio}</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={chartData}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução das Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={chartData}
                xKey="mes"
                yKey="arrecadado"
                height={300}
                multipleYKeys={['previsto', 'arrecadado']}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Instituição - Exercício {filters.exercicio}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instituição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previsto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrecadado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adicional
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diferença
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Prefeitura Municipal
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 150.000,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 25.000,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 0,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 125.000,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">
                        👁️
                      </button>
                    </td>
                  </tr>
                  {/* Mais linhas aqui */}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
