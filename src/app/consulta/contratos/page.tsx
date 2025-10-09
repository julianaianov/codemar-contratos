'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, ViewColumnsIcon, Squares2X2Icon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ContratoImportado } from '@/types/contratos';
import { FilterPanel } from '@/components/contratos/FilterPanel';
import { FiltrosContratos } from '@/types/contratos';

export default function ConsultaContratosPage() {
  const [contratos, setContratos] = useState<ContratoImportado[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<FiltrosContratos>({});
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoImportado | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    carregarContratos();
  }, [filtros]);

  const carregarContratos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filtros.diretoria) {
        params.append('diretoria', filtros.diretoria);
      }
      
      if (filtros.status) {
        params.append('status', filtros.status);
      }

      // Buscar contratos da API de contratos importados (mesma da página de cadastros)
      const response = await fetch(`/api/contratos?${params.toString()}`);
      const data = await response.json();
      setContratos(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      // Em caso de erro, mostrar dados mock para demonstração
      setContratos([
        {
          id: 1,
          numero_contrato: '001/2025',
          objeto: 'Contratação de serviços de manutenção predial',
          contratante: 'Prefeitura Municipal',
          contratado: 'Empresa XYZ Ltda',
          cnpj_contratado: '12.345.678/0001-90',
          valor_global: 50000,
          data_inicio: '2024-12-31',
          data_fim: '2025-12-30',
          modalidade: 'Pregão Eletrônico',
          status: 'vigente',
          tipo_contrato: 'Prestação de Serviços',
          secretaria: 'Presidência',
          fonte_recurso: 'Recursos Próprios',
          observacoes: 'Contrato para manutenção predial',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  const contratosFiltrados = contratos.filter(contrato => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        contrato.numero_contrato?.toLowerCase().includes(term) ||
        contrato.objeto?.toLowerCase().includes(term) ||
        contrato.contratado?.toLowerCase().includes(term) ||
        contrato.secretaria?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const formatarData = (data: string | null | undefined) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number | null | undefined) => {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'vigente':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'vencido':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'encerrado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'rescindido':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleViewContrato = (contrato: ContratoImportado) => {
    setContratoSelecionado(contrato);
    setShowModal(true);
  };

  const handleViewPdf = (contratoId: number) => {
    const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';
    // Abre o PDF em uma nova aba
    window.open(`${API_URL}/api/imports/${contratoId}/pdf/view`, '_blank');
  };

  const handleDownloadPdf = (contratoId: number) => {
    const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';
    // Faz download do PDF
    window.location.href = `${API_URL}/api/imports/${contratoId}/pdf/download`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Consulta de Contratos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consulte e gerencie todos os contratos cadastrados no sistema
          </p>
        </div>
      </div>

      {/* Filtros */}
      <FilterPanel 
        filters={filtros}
        onFiltersChange={setFiltros}
        onFilter={carregarContratos}
        loading={loading}
      />

      {/* Barra de Busca e Visualização */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número, objeto, contratado ou diretoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Visualização:
          </span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ViewColumnsIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? 'Carregando...' : `Exibindo ${contratosFiltrados.length} de ${contratos.length} contratos`}
        </p>
      </div>

      {/* Visualização em Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contratosFiltrados.map((contrato) => (
            <div key={contrato.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-green-500 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contrato.numero_contrato || 'N/A'}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contrato.status || '')}`}>
                    {contrato.status || 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewContrato(contrato)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {(contrato as any).file_import_id && (
                    <button
                      onClick={() => handleViewPdf((contrato as any).file_import_id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Ver PDF original"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition-colors" title="Editar">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors" title="Deletar">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Objeto</p>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                    {contrato.objeto || 'Não informado'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">🏢</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contratado</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {contrato.contratado || 'Não informado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatarValor(contrato.valor_global)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Período</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatarData(contrato.data_inicio)} até {formatarData(contrato.data_fim)}
                    </p>
                  </div>
                </div>
                
                {contrato.secretaria && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">🏛️</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Diretoria</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {contrato.secretaria}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visualização em Tabela */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contrato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Objeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contratado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Diretoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {contratosFiltrados.map((contrato) => (
                  <tr key={contrato.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {contrato.numero_contrato || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {contrato.objeto || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {contrato.contratado || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {contrato.secretaria || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatarValor(contrato.valor_global)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contrato.status || '')}`}>
                        {contrato.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewContrato(contrato)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver detalhes"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(contrato as any).file_import_id && (
                          <button
                            onClick={() => handleViewPdf((contrato as any).file_import_id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Ver PDF original"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title="Editar">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Deletar">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showModal && contratoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalhes do Contrato
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Número do Contrato</label>
                    <p className="text-sm text-gray-900 dark:text-white">{contratoSelecionado.numero_contrato || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contratoSelecionado.status || '')}`}>
                      {contratoSelecionado.status || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Objeto</label>
                  <p className="text-sm text-gray-900 dark:text-white">{contratoSelecionado.objeto || 'Não informado'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contratado</label>
                    <p className="text-sm text-gray-900 dark:text-white">{contratoSelecionado.contratado || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Diretoria</label>
                    <p className="text-sm text-gray-900 dark:text-white">{contratoSelecionado.secretaria || 'Não informado'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Data de Início</label>
                    <p className="text-sm text-gray-900 dark:text-white">{formatarData(contratoSelecionado.data_inicio)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Data de Fim</label>
                    <p className="text-sm text-gray-900 dark:text-white">{formatarData(contratoSelecionado.data_fim)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Valor Global</label>
                  <p className="text-sm text-gray-900 dark:text-white font-semibold">{formatarValor(contratoSelecionado.valor_global)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}