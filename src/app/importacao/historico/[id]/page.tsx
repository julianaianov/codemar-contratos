'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, DocumentTextIcon, ArrowDownTrayIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
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
  pdf_path?: string;
  dados_originais?: any;
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
  const [showTextoCompleto, setShowTextoCompleto] = useState(false);

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

  const handleViewPdf = () => {
    if (importData?.id) {
      window.open(`${API_URL}/api/imports/${importData.id}/pdf/view`, '_blank');
    }
  };

  const handleDownloadPdf = () => {
    if (importData?.id) {
      window.location.href = `${API_URL}/api/imports/${importData.id}/pdf/download`;
    }
  };

  const getTextoExtraido = () => {
    if (!importData?.contratos || importData.contratos.length === 0) return null;
    const contrato = importData.contratos[0];
    return contrato.dados_originais?.texto_extraido_ocr || contrato.dados_originais?.texto_extraido || null;
  };

  const getMetodoExtracao = () => {
    if (!importData?.contratos || importData.contratos.length === 0) return 'texto';
    const contrato = importData.contratos[0];
    return contrato.dados_originais?.metodo || 'texto';
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

          <div className="flex gap-2">
            {importData.file_type === 'pdf' && (
              <>
                <button
                  onClick={handleViewPdf}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  title="Ver PDF original"
                >
                  <EyeIcon className="h-5 w-5" />
                  Ver PDF
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  title="Baixar PDF original"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Baixar PDF
                </button>
              </>
            )}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Exportar CSV
            </button>
          </div>
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

      {/* Seção de Texto Extraído (apenas para PDFs) */}
      {importData.file_type === 'pdf' && getTextoExtraido() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Texto Extraído do PDF
              </h2>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getMetodoExtracao() === 'OCR' 
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {getMetodoExtracao() === 'OCR' ? '🔍 OCR (Escaneado)' : '📄 Texto Direto'}
                </span>
                <button
                  onClick={() => setShowTextoCompleto(!showTextoCompleto)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {showTextoCompleto ? 'Ocultar' : 'Ver Completo'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                {showTextoCompleto 
                  ? getTextoExtraido()
                  : `${getTextoExtraido()?.substring(0, 1000)}${(getTextoExtraido()?.length || 0) > 1000 ? '...' : ''}`
                }
              </pre>
            </div>
            
            {(getTextoExtraido()?.length || 0) > 1000 && !showTextoCompleto && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Texto truncado. Clique em "Ver Completo" para ver todo o conteúdo.
              </p>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Método:</strong> {getMetodoExtracao() === 'OCR' 
                  ? 'OCR (Reconhecimento Óptico de Caracteres) - para PDFs escaneados'
                  : 'Extração direta de texto - para PDFs com texto selecionável'
                }
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                <strong>Caracteres extraídos:</strong> {getTextoExtraido()?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


