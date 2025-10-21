'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { ContratoModel, ContratosService } from '@/services/contratos-service';

interface ContratosManagerProps {
  onContratoSelect?: (contrato: ContratoModel) => void;
  onEdit?: (contrato: ContratoModel) => void;
  onDelete?: (contrato: ContratoModel) => void;
  showUpload?: boolean;
  onCloseUpload?: () => void;
  title?: string;
  description?: string;
}

export default function ContratosManager({ 
  onContratoSelect, 
  onEdit, 
  onDelete,
  showUpload = false,
  onCloseUpload,
  title = "Contratos",
  description = "Gerencie seus contratos"
}: ContratosManagerProps) {
  const [contratos, setContratos] = useState<ContratoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    carregarContratos();
    carregarEstatisticas();
  }, [currentPage, filterType, filterStatus]);

  const carregarContratos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contratos?page=${currentPage}&tipo=${filterType}&status=${filterStatus}`);
      const result = await response.json();

      if (result.success) {
        setContratos(result.data.data);
        setTotalPages(result.data.total_pages);
      } else {
        setError(result.message || 'Erro ao carregar contratos');
      }
    } catch (err) {
      setError('Erro ao carregar contratos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch('/api/contratos/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleDownload = async (contrato: ContratoModel, tipo: 'original' | 'editado' = 'original') => {
    try {
      const response = await fetch(`/api/contratos/${contrato.id}/download?tipo=${tipo}`);
      const result = await response.json();

      if (result.success) {
        // Abrir download em nova aba
        window.open(result.data.url, '_blank');
      } else {
        alert('Erro ao baixar arquivo: ' + result.message);
      }
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      alert('Erro ao baixar arquivo');
    }
  };

  const handleDelete = async (contrato: ContratoModel) => {
    if (!confirm(`Tem certeza que deseja excluir o contrato "${contrato.nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/contratos/${contrato.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setContratos(contratos.filter(c => c.id !== contrato.id));
        onDelete?.(contrato);
      } else {
        alert('Erro ao excluir contrato: ' + result.message);
      }
    } catch (err) {
      console.error('Erro ao excluir contrato:', err);
      alert('Erro ao excluir contrato');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const contratosFiltrados = contratos.filter(contrato =>
    contrato.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal de Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload de {title}
                </h3>
                <button
                  onClick={onCloseUpload}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Arraste e solte um arquivo aqui ou
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const formData = new FormData();
                        formData.append('arquivo', file);
                        formData.append('nome', file.name);
                        formData.append('descricao', `Modelo de contrato: ${file.name}`);
                        
                        const response = await fetch('/api/contratos', {
                          method: 'POST',
                          body: formData
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          await carregarContratos();
                          onCloseUpload?.();
                        } else {
                          alert('Erro ao fazer upload: ' + result.message);
                        }
                      } catch (err) {
                        console.error('Erro no upload:', err);
                        alert('Erro ao fazer upload');
                      }
                    }
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                  Selecionar Arquivo
                </label>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={onCloseUpload}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total_contratos || 0}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total de Contratos</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.contratos_editados || 0}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Editados</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.contratos_pdf || 0}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">PDFs</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatFileSize(stats.tamanho_total || 0)}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Tamanho Total</div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os tipos</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="DOC">DOC</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Lista de Contratos */}
      {error ? (
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">Erro</div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      ) : contratosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 dark:text-gray-400">Nenhum contrato encontrado</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contratosFiltrados.map((contrato) => (
            <div
              key={contrato.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {contrato.nome}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contrato.tipo} • {formatFileSize(contrato.tamanho)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {contrato.is_editado && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Editado
                    </span>
                  )}
                </div>
              </div>

              {contrato.descricao && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {contrato.descricao}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div>Upload: {formatDate(contrato.data_upload)}</div>
                {contrato.data_edicao && (
                  <div>Editado: {formatDate(contrato.data_edicao)}</div>
                )}
                <div>Versão: {contrato.versao}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(contrato, 'original')}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Baixar original"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  {contrato.arquivo_editado && (
                    <button
                      onClick={() => handleDownload(contrato, 'editado')}
                      className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                      title="Baixar editado"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit?.(contrato)}
                    className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contrato)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Excluir"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => onContratoSelect?.(contrato)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
