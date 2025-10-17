'use client';

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface DocxViewerProps {
  minutaId: string;
  minutaNome: string;
  onClose: () => void;
}

interface MinutaData {
  id: string;
  nome: string;
  descricao: string;
  dataUpload: string;
  versao: number;
  isEditada: boolean;
  dataUltimaEdicao?: string;
}

export default function DocxViewer({ minutaId, minutaNome, onClose }: DocxViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [minutaData, setMinutaData] = useState<MinutaData | null>(null);
  const [error, setError] = useState('');

  // Carregar conteúdo da minuta
  useEffect(() => {
    carregarConteudo();
  }, [minutaId]);

  const carregarConteudo = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/geracao-contratos/minutas/${minutaId}/preview`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar minuta');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setHtmlContent(data.html);
        setEditContent(data.html);
        setMinutaData(data.minuta);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Erro ao carregar minuta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar minuta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/geracao-contratos/minutas/${minutaId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar minuta');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setHtmlContent(editContent);
        setIsEditing(false);
        alert('Minuta salva com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert(err instanceof Error ? err.message : 'Erro ao salvar minuta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(htmlContent);
    setIsEditing(false);
  };

  const handleDownload = () => {
    window.open(`/api/geracao-contratos/minutas/${minutaId}/download`, '_blank');
  };

  const handleDownloadOriginal = () => {
    window.open(`/api/geracao-contratos/minutas/${minutaId}/original`, '_blank');
  };

  const handlePrint = (tipo: 'original' | 'editada' = 'editada') => {
    window.open(`/api/geracao-contratos/minutas/${minutaId}/print?tipo=${tipo}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando minuta...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <DocumentTextIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Erro ao carregar minuta
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={carregarConteudo}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {minutaNome}
              </h2>
              {minutaData && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    minutaData.isEditada 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {minutaData.isEditada ? 'Editada' : 'Original'}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                    v{minutaData.versao}
                  </span>
                </div>
              )}
            </div>
            {minutaData && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <p>Enviado em: {new Date(minutaData.dataUpload).toLocaleDateString('pt-BR')}</p>
                {minutaData.dataUltimaEdicao && (
                  <p>Editado em: {new Date(minutaData.dataUltimaEdicao).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                  title="Editar"
                >
                  <PencilIcon className="h-5 w-5" />
                  Editar
                </button>
                
                {/* Menu de Download */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Download
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={handleDownload}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      Versão Atual
                    </button>
                    <button
                      onClick={handleDownloadOriginal}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      Versão Original
                    </button>
                  </div>
                </div>

                {/* Menu de Impressão */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors duration-200"
                    title="Imprimir"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    Imprimir
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => handlePrint('editada')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      Versão Atual
                    </button>
                    <button
                      onClick={() => handlePrint('original')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      Versão Original
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                >
                  <CheckIcon className="h-5 w-5" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Cancelar
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isEditing ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modo de edição - Você pode editar o conteúdo HTML diretamente
                </p>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm resize-none"
                  placeholder="Conteúdo da minuta..."
                />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto p-6">
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
