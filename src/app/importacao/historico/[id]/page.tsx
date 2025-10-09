'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface ContratoImportado {
  id: number;
  numero_contrato: string;
  objeto: string;
  contratado: string;
  valor: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  processado: boolean;
}

interface FileImport {
  id: number;
  original_filename: string;
  file_type: string;
  status: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  created_at: string;
  contratos: ContratoImportado[];
}

export default function DetalhesImportacaoPage() {
  const params = useParams();
  const [importData, setImportData] = useState<FileImport | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (params.id) {
      fetchImportDetails();
    }
  }, [params.id]);

  const fetchImportDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/imports/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setImportData(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!importData?.contratos) return;

    const headers = ['Número', 'Objeto', 'Contratado', 'Valor', 'Data Início', 'Data Fim', 'Status'];
    const rows = importData.contratos.map((c) => [
      c.numero_contrato,
      c.objeto,
      c.contratado,
      c.valor,
      c.data_inicio,
      c.data_fim,
      c.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell || ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contratos-importacao-${params.id}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!importData) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Importação não encontrada</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/importacao/historico"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Histórico
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              Detalhes da Importação
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {importData.original_filename}
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {importData.status}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total de Registros</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {importData.total_records}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-green-200 dark:border-green-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sucessos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {importData.successful_records}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-red-200 dark:border-red-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Falhas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {importData.failed_records}
          </p>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Contratos Importados ({importData.contratos?.length || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Objeto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contratado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vigência
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {importData.contratos && importData.contratos.length > 0 ? (
                importData.contratos.map((contrato) => (
                  <tr key={contrato.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contrato.processado ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {contrato.numero_contrato || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {contrato.objeto || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contrato.contratado || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {contrato.valor
                        ? `R$ ${parseFloat(contrato.valor).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {contrato.data_inicio && contrato.data_fim
                        ? `${new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} até ${new Date(
                            contrato.data_fim
                          ).toLocaleDateString('pt-BR')}`
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum contrato encontrado nesta importação
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

