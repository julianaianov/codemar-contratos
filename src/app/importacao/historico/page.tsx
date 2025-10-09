'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardDocumentListIcon, ArrowLeftIcon, FunnelIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface FileImport {
  id: number;
  original_filename: string;
  file_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number | null;
  successful_records: number;
  failed_records: number;
  created_at: string;
}

export default function HistoricoImportacoesPage() {
  const [imports, setImports] = useState<FileImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchImports();
  }, [filter]);

  const fetchImports = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/api/imports`);
      if (filter !== 'all') {
        url.searchParams.append('status', filter);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setImports(data.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar importações:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImport = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta importação?')) return;

    try {
      const response = await fetch(`${API_URL}/api/imports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchImports();
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluído',
      failed: 'Falhou',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getFileTypeColor = (type: string) => {
    const colorMap = {
      xml: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      excel: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      csv: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const filteredImports = imports.filter((imp) =>
    imp.original_filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/importacao"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Importação
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ClipboardDocumentListIcon className="h-8 w-8 text-orange-500" />
              Histórico de Importações
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Visualize o status e resultados de todas as importações realizadas
            </p>
          </div>

          <button
            onClick={fetchImports}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Filtro por Status */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="processing">Processando</option>
            <option value="completed">Concluído</option>
            <option value="failed">Falhou</option>
          </select>
        </div>

        {/* Busca */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome de arquivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Importações */}
      {loading ? (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando importações...</p>
        </div>
      ) : filteredImports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ClipboardDocumentListIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma importação encontrada</p>
          <p className="text-sm text-gray-500">
            {search ? 'Tente outra busca' : 'Faça sua primeira importação!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredImports.map((imp) => (
            <div
              key={imp.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(imp.status)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {imp.original_filename}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(imp.file_type)}`}>
                      {imp.file_type.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getStatusText(imp.status)}
                      </p>
                    </div>

                    {imp.total_records !== null && (
                      <>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Total</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {imp.total_records} registros
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Sucesso</p>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            {imp.successful_records}
                          </p>
                        </div>

                        {imp.failed_records > 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Falhas</p>
                            <p className="font-medium text-red-600 dark:text-red-400">
                              {imp.failed_records}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Data</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(imp.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/importacao/historico/${imp.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={() => deleteImport(imp.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

