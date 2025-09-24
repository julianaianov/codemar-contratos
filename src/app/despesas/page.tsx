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
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface FilterData {
  exercicio: string;
  instituicao?: string;
  mes?: string;
}

export default function DespesasPage() {
  const [filters, setFilters] = useState<FilterData>({
    exercicio: '2024',
    instituicao: '',
    mes: '',
  });

  const [data, setData] = useState({
    empenhado: 420000.00,
    liquidado: 360000.00,
    anulado: 0.00,
    pago: 360000.00,
  });

  const handleFilter = (newFilters: FilterData) => {
    setFilters(newFilters);
    // Aqui você faria a chamada para a API com os novos filtros
    console.log('Filtros aplicados:', newFilters);
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Empenhado',
        data: [80000, 120000, 90000, 60000, 70000, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Liquidado',
        data: [75000, 110000, 85000, 55000, 65000, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'Pago',
        data: [70000, 100000, 80000, 50000, 60000, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
              <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
              <nav className="flex space-x-2 text-sm text-gray-500 mt-1">
                <span>Início</span>
                <span>›</span>
                <span className="text-gray-900">Despesas</span>
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
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
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
            title="Empenhado"
            value={`R$ ${data.empenhado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            className="bg-blue-50 border-blue-200"
          />
          <MetricCard
            title="Liquidado"
            value={`R$ ${data.liquidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            className="bg-green-50 border-green-200"
          />
          <MetricCard
            title="Anulado"
            value={`R$ ${data.anulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            className="bg-red-50 border-red-200"
          />
          <MetricCard
            title="Pago"
            value={`R$ ${data.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<ChartBarIcon className="w-6 h-6" />}
            className="bg-orange-50 border-orange-200"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Mês - Exercício {filters.exercicio}</CardTitle>
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
              <CardTitle>Evolução das Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={chartData}
                xKey="mes"
                yKey="empenhado"
                height={300}
                multipleYKeys={['empenhado', 'liquidado', 'pago']}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Instituições */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Instituição - Exercício {filters.exercicio}</CardTitle>
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
                      Empenhado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liquidado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anulado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago
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
                      R$ 140.000,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 0,00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ 140.000,00
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
