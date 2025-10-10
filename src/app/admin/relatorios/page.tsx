'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  ChartBarIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ImportReport {
  id: number;
  original_filename: string;
  file_type: string;
  status: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  created_at: string;
}

interface StatsByType {
  file_type: string;
  total: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ImportReport[]>([]);
  const [statsByType, setStatsByType] = useState<StatsByType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchReports();
  }, [dateFrom, dateTo, fileTypeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/api/imports`);
      if (dateFrom) url.searchParams.append('date_from', dateFrom);
      if (dateTo) url.searchParams.append('date_to', dateTo);
      if (fileTypeFilter !== 'all') url.searchParams.append('file_type', fileTypeFilter);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        const list: ImportReport[] = data.data?.data || data.data || [];
        setReports(list);

        const counts: Record<string, number> = {};
        for (const item of list) {
          counts[item.file_type] = (counts[item.file_type] || 0) + 1;
        }
        const stats: StatsByType[] = Object.entries(counts).map(([file_type, total]) => ({ file_type, total }));
        setStatsByType(stats);
      } else {
        setReports([]);
        setStatsByType([]);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setReports([]);
      setStatsByType([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = fileTypeFilter === 'all' || report.file_type === fileTypeFilter;
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(report.created_at) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(report.created_at) <= new Date(dateTo + 'T23:59:59');
    }

    return matchesType && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-red-600" />;
      case 'xml':
        return <DocumentArrowUpIcon className="h-5 w-5 text-blue-600" />;
      case 'excel':
        return <ChartBarIcon className="h-5 w-5 text-green-600" />;
      default:
        return <DocumentArrowUpIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Arquivo', 'Tipo', 'Status', 'Total', 'Sucesso', 'Falhas', 'Data'];
    const rows = filteredReports.map(report => [
      report.id,
      report.original_filename,
      report.file_type,
      report.status,
      report.total_records,
      report.successful_records,
      report.failed_records,
      formatDate(report.created_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_importacoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                Relatórios de Importação
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Visualize estatísticas e relatórios detalhados das importações
              </p>
            </div>
            
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Estatísticas por Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsByType.map((stat) => (
            <div key={stat.file_type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {getFileTypeIcon(stat.file_type)}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">
                    {stat.file_type}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.total}
                  </p>
                  <p className="text-xs text-gray-500">importações</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Inicial
              </label>
              <div className="relative">
                <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Final
              </label>
              <div className="relative">
                <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Arquivo
              </label>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os tipos</option>
                <option value="xml">XML</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setFileTypeFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Relatórios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando relatórios...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Arquivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Registros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Taxa de Sucesso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReports.map((report) => {
                      const successRate = report.total_records > 0 
                        ? ((report.successful_records / report.total_records) * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getFileTypeIcon(report.file_type)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {report.original_filename}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 uppercase">
                              {report.file_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                              {report.status === 'completed' ? 'Concluído' : 
                               report.status === 'failed' ? 'Falhou' : 
                               report.status === 'processing' ? 'Processando' : report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="text-sm">
                              <div>Total: {report.total_records}</div>
                              <div className="text-green-600">✓ {report.successful_records}</div>
                              {report.failed_records > 0 && (
                                <div className="text-red-600">✗ {report.failed_records}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${successRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {successRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(report.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredReports.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhum relatório encontrado com os filtros aplicados.
                </div>
              )}
            </>
          )}
        </div>

        {/* Resumo */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Importações</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Taxa Média de Sucesso</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.length > 0 
                ? ((reports.reduce((acc, r) => acc + (r.successful_records / r.total_records), 0) / reports.length) * 100).toFixed(1)
                : '0'
              }%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Registros</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.reduce((acc, r) => acc + r.total_records, 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Registros Processados</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.reduce((acc, r) => acc + r.successful_records, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
