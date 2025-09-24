'use client';

import React, { useState } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { BarChart } from '@/components/charts/BarChart';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

interface FilterData {
  exercicio: string;
  instituicao?: string;
  mes?: string;
}

export default function ContratosPage() {
  const [filters, setFilters] = useState<FilterData>({
    exercicio: '2024',
    instituicao: '',
    mes: '',
  });

  const [data, setData] = useState({
    totalContratos: 45,
    valorTotal: 1500000.00,
    contratosAtivos: 40,
    contratosVencidos: 5,
  });

  const handleFilter = (newFilters: FilterData) => {
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Contratos Assinados',
        data: [5, 8, 12, 6, 4, 3, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Valor Total (R$ mil)',
        data: [200, 350, 500, 300, 150, 100, 0, 0, 0, 0, 0, 0],
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
              <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
              <nav className="flex space-x-2 text-sm text-gray-500 mt-1">
                <span>Início</span>
                <span>›</span>
                <span className="text-gray-900">Contratos</span>
                <span>›</span>
                <span className="text-gray-900">Gestão</span>
              </nav>
            </div>
            <button className="text-gray-600 hover:text-gray-900">
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Filtros */}
        <div className="mb-8">
          <FilterPanel
            title="Consulta de Dados"
            onFilter={handleFilter}
            showInstitution={true}
            showYear={true}
            showMonth={true}
          />
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Contratos"
            value={data.totalContratos.toLocaleString('pt-BR')}
            icon={<DocumentTextIcon className="w-6 h-6" />}
            className="bg-blue-50 border-blue-200"
          />
          <MetricCard
            title="Valor Total"
            value={`R$ ${data.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            className="bg-green-50 border-green-200"
          />
          <MetricCard
            title="Contratos Ativos"
            value={data.contratosAtivos.toLocaleString('pt-BR')}
            icon={<ChartBarIcon className="w-6 h-6" />}
            className="bg-purple-50 border-purple-200"
          />
          <MetricCard
            title="Contratos Vencidos"
            value={data.contratosVencidos.toLocaleString('pt-BR')}
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            className="bg-red-50 border-red-200"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Contratos por Mês - Exercício {filters.exercicio}</CardTitle>
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
              <CardTitle>Status dos Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ativos</span>
                  <span className="text-sm font-medium text-green-600">40 contratos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vencidos</span>
                  <span className="text-sm font-medium text-red-600">5 contratos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Em Renovação</span>
                  <span className="text-sm font-medium text-yellow-600">3 contratos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Suspensos</span>
                  <span className="text-sm font-medium text-gray-600">2 contratos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Contratos */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos por Órgão - Exercício {filters.exercicio}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Órgão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Contratos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ativos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencidos
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
                      25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 800.000,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      22
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      3
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
