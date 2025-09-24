'use client';

import React, { useState } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { BarChart } from '@/components/charts/BarChart';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

interface FilterData {
  exercicio: string;
  instituicao?: string;
  mes?: string;
}

export default function PessoalPage() {
  const [filters, setFilters] = useState<FilterData>({
    exercicio: '2024',
    instituicao: '',
    mes: '',
  });

  const [data, setData] = useState({
    totalServidores: 1250,
    totalFolha: 2500000.00,
    mediaSalarial: 2000.00,
    ativos: 1200,
  });

  const handleFilter = (newFilters: FilterData) => {
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Folha de Pagamento',
        data: [200000, 210000, 220000, 230000, 240000, 250000, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
              <h1 className="text-2xl font-bold text-gray-900">Pessoal</h1>
              <nav className="flex space-x-2 text-sm text-gray-500 mt-1">
                <span>Início</span>
                <span>›</span>
                <span className="text-gray-900">Pessoal</span>
                <span>›</span>
                <span className="text-gray-900">Servidores</span>
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
            title="Total de Servidores"
            value={data.totalServidores.toLocaleString('pt-BR')}
            icon={<UsersIcon className="w-6 h-6" />}
            className="bg-blue-50 border-blue-200"
          />
          <MetricCard
            title="Folha de Pagamento"
            value={`R$ ${data.totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            className="bg-green-50 border-green-200"
          />
          <MetricCard
            title="Média Salarial"
            value={`R$ ${data.mediaSalarial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<ChartBarIcon className="w-6 h-6" />}
            className="bg-purple-50 border-purple-200"
          />
          <MetricCard
            title="Servidores Ativos"
            value={data.ativos.toLocaleString('pt-BR')}
            icon={<UserGroupIcon className="w-6 h-6" />}
            className="bg-orange-50 border-orange-200"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Folha de Pagamento por Mês - Exercício {filters.exercicio}</CardTitle>
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
              <CardTitle>Distribuição por Órgão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prefeitura Municipal</span>
                  <span className="text-sm font-medium">450 servidores</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Câmara Municipal</span>
                  <span className="text-sm font-medium">25 servidores</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fundação de Saúde</span>
                  <span className="text-sm font-medium">300 servidores</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Companhia de Saneamento</span>
                  <span className="text-sm font-medium">200 servidores</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outros</span>
                  <span className="text-sm font-medium">275 servidores</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Servidores */}
        <Card>
          <CardHeader>
            <CardTitle>Servidores por Órgão - Exercício {filters.exercicio}</CardTitle>
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
                      Total Servidores
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ativos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inativos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Folha Mensal
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
                      450
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      430
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      20
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 900.000,00
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
