'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, ViewColumnsIcon, Squares2X2Icon, DocumentArrowDownIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ContratoImportado } from '@/types/contratos';
import { FilterPanel } from '@/components/contratos/FilterPanel';
import { FiltrosContratos } from '@/types/contratos';

export default function ContratosPage() {
  const [contratos, setContratos] = useState<ContratoImportado[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<FiltrosContratos>({});
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoImportado | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detalhe, setDetalhe] = useState<ContratoImportado | null>(null);

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

      // Buscar contratos da API do Laravel
      const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/imports/todos-contratos?${params.toString()}`);
      const data = await response.json();
      setContratos(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      setContratos([]);
    } finally {
      setLoading(false);
    }
  };

  const contratosFiltrados = contratos.filter(contrato => {
    const matchesSearch = !searchTerm || 
      contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.contratado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.diretoria?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDiretoria = !filtros.diretoria || contrato.diretoria === filtros.diretoria;
    const matchesStatus = !filtros.status || contrato.status === filtros.status;

    return matchesSearch && matchesDiretoria && matchesStatus;
  });

  const getValorCampo = (primary: any, keys: string[], contrato?: any): string | undefined => {
    if (primary) return String(primary);
    const obj = (contrato || detalhe) as any;
    const orig = obj?.dados_originais || {};
    const allKeys = Object.keys(orig);
    if (allKeys.length === 0) return undefined;
    const normalize = (s: string) => s
      ?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[_\-.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const map: Record<string, any> = {};
    for (const k of allKeys) {
      map[normalize(k)] = orig[k];
    }
    for (const k of keys) {
      const nk = normalize(k);
      if (map[nk]) return String(map[nk]);
    }
    return undefined;
  };

  const abrirDetalhe = async (contrato: ContratoImportado) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';
      const resp = await fetch(`${API_URL}/api/contratos/${contrato.id}`);
      if (resp.ok) {
        const full = await resp.json();
        setDetalhe(full);
      } else {
        setDetalhe(contrato);
      }
    } catch (e) {
      setDetalhe(contrato);
    } finally {
      setShowModal(true);
    }
  };

  // Construir listas únicas sem depender de recursos ES2015 de iteração
  const diretorias = contratos.reduce<string[]>((acc, c) => {
    const dir = (c as any).diretoria || (c as any).secretaria;
    if (dir && !acc.includes(dir)) acc.push(dir);
    return acc;
  }, []);

  const statuses = contratos.reduce<string[]>((acc, c) => {
    const st = c.status as string | undefined;
    if (st && !acc.includes(st)) acc.push(st);
    return acc;
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contratos Importados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize e gerencie todos os contratos importados
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Filtros */}
          <FilterPanel
            filters={filtros}
            onFiltersChange={setFiltros}
            onFilter={carregarContratos}
            loading={loading}
          />

          {/* Modo de Visualização */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${
                viewMode === 'cards'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <ViewColumnsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{contratos.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total de Contratos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{diretorias.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Diretorias</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {contratos.filter(c => c.status === 'VIGENTE').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Vigentes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {contratos.filter(c => c.status === 'ENCERRADO').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Encerrados</div>
        </div>
      </div>

      {/* Lista de Contratos */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : contratosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum contrato encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || Object.keys(filtros).length > 0
              ? 'Tente ajustar os filtros de busca.'
              : 'Nenhum contrato foi importado ainda.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {viewMode === 'cards' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contratosFiltrados.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {contrato.numero_contrato || getValorCampo(undefined, ['contrato','numero','numero_contrato','nº contrato','numero contrato'], contrato) || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contrato.ano_numero || contrato.ano || (getValorCampo(undefined, ['ano-nº','ano_numero','ano numero','ano-numero'], contrato) as any) || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (contrato.status || getValorCampo(undefined, ['status','situacao','situação'], contrato)) === 'VIGENTE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {contrato.status || getValorCampo(undefined, ['status','situacao','situação'], contrato) || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Empresa:</span>
                        <p className="text-gray-600 dark:text-gray-400 truncate">
                          {contrato.contratado || contrato.nome_empresa || getValorCampo(undefined, ['nome da empresa','nome_empresa','empresa','contratado','fornecedor','razao social','razão social'], contrato) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Diretoria:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {contrato.diretoria || (contrato as any).secretaria || getValorCampo(undefined, ['diretoria requisitante','diretoria','secretaria','unidade'], contrato) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Valor:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {(contrato.valor || contrato.valor_contrato)
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format((contrato.valor ?? contrato.valor_contrato) ?? 0)
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => abrirDetalhe(contrato)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Empresa
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
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contrato.numero_contrato || getValorCampo(undefined, ['contrato','numero','numero_contrato','nº contrato','numero contrato'], contrato) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contrato.ano_numero || contrato.ano || (getValorCampo(undefined, ['ano-nº','ano_numero','ano numero','ano-numero'], contrato) as any) || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                          {contrato.contratado || contrato.nome_empresa || getValorCampo(undefined, ['nome da empresa','nome_empresa','empresa','contratado','fornecedor','razao social','razão social'], contrato) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {contrato.diretoria || (contrato as any).secretaria || getValorCampo(undefined, ['diretoria requisitante','diretoria','secretaria','unidade'], contrato) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {(contrato.valor || contrato.valor_contrato)
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format((contrato.valor ?? contrato.valor_contrato) ?? 0)
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          (contrato.status || getValorCampo(undefined, ['status','situacao','situação'], contrato)) === 'VIGENTE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {contrato.status || getValorCampo(undefined, ['status','situacao','situação'], contrato) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setContratoSelecionado(contrato);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && detalhe && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detalhes do Contrato
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Número do Contrato
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.numero_contrato || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ano-Número
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.ano_numero || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ano
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.ano || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      P.A
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.pa || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Diretoria
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.secretaria || detalhe.diretoria || getValorCampo(undefined, ['diretoria requisitante','diretoria','secretaria','unidade'], detalhe) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Modalidade
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.modalidade || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome da Empresa
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.contratado || detalhe.nome_empresa || getValorCampo(undefined, ['nome da empresa','nome_empresa','empresa','contratado','fornecedor','razao social','razão social'], detalhe) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      CNPJ da Empresa
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.cnpj_contratado || detalhe.cnpj_empresa || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Objeto
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.objeto || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data da Assinatura
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.data_assinatura || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prazo
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.prazo ? `${detalhe.prazo} ${detalhe.unidade_prazo || ''}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valor do Contrato
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {(detalhe.valor || detalhe.valor_contrato)
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format((detalhe.valor ?? detalhe.valor_contrato) ?? 0)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vencimento
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.vencimento || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gestor do Contrato
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.gestor_contrato || getValorCampo(undefined, ['gestor do contrato','gestor_contrato','gestor','responsavel'], detalhe) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fiscal Técnico
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.fiscal_tecnico || getValorCampo(undefined, ['fiscal tecnico','fiscal_técnico','fiscal_tecnico'], detalhe) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fiscal Administrativo
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.fiscal_administrativo || getValorCampo(undefined, ['fiscal administrativo','fiscal_administrativo','fiscal admin'], detalhe) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suplente
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {detalhe.suplente || getValorCampo(undefined, ['suplente','substituto'], detalhe) || 'N/A'}
                    </p>
                  </div>
                  {contratoSelecionado.observacoes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Observações
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {contratoSelecionado.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
