'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  TrashIcon, 
  EyeIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import DocxViewer from '@/components/minutas/DocxViewer';
import QuickAISearch from '@/components/ai/QuickAISearch';

interface MinutaModel {
  id: string;
  nome: string;
  descricao: string;
  arquivo: string;
  arquivoOriginal: string;
  tamanho: number;
  dataUpload: string;
  dataUltimaEdicao?: string;
  tipo: string;
  versao: number;
  isEditada: boolean;
  versaoOriginal?: string;
}

export default function MinutasPage() {
  const [minutas, setMinutas] = useState<MinutaModel[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    nome: '',
    descricao: ''
  });
  const [selectedMinuta, setSelectedMinuta] = useState<MinutaModel | null>(null);

  // Carregar minutas existentes
  useEffect(() => {
    carregarMinutas();
  }, []);

  const carregarMinutas = async () => {
    try {
      const response = await fetch('/api/geracao-contratos/minutas');
      if (response.ok) {
        const data = await response.json();
        setMinutas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar minutas:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setUploadFile(file);
      setUploadData(prev => ({
        ...prev,
        nome: file.name.replace('.docx', '')
      }));
    } else {
      alert('Por favor, selecione um arquivo .docx válido');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.nome) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('arquivo', uploadFile);
    formData.append('nome', uploadData.nome);
    formData.append('descricao', uploadData.descricao);

    try {
      const response = await fetch('/api/geracao-contratos/minutas/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await carregarMinutas();
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadData({ nome: '', descricao: '' });
        alert('Minuta enviada com sucesso!');
      } else {
        throw new Error('Erro no upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar minuta. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta minuta?')) return;

    try {
      const response = await fetch(`/api/geracao-contratos/minutas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await carregarMinutas();
        alert('Minuta excluída com sucesso!');
      } else {
        throw new Error('Erro ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir minuta. Tente novamente.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DocumentTextIcon className="h-8 w-8 text-purple-500" />
              Minhas Minutas
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gerencie seus modelos de minutas de contratos
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            Nova Minuta
          </button>
        </div>
      </div>

      {/* Busca Inteligente */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-xl font-semibold">Busca Inteligente em Minutas</h2>
          </div>
          <p className="text-purple-100 mb-4">
            Pergunte sobre suas minutas e receba sugestões inteligentes
          </p>
          <QuickAISearch
            placeholder="Ex: Qual minuta usar para acordo de cooperação?"
            searchType="minutas"
            className="max-w-2xl"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Minutas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{minutas.length}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {minutas.filter(m => {
                  const dataUpload = new Date(m.dataUpload);
                  const agora = new Date();
                  return dataUpload.getMonth() === agora.getMonth() && 
                         dataUpload.getFullYear() === agora.getFullYear();
                }).length}
              </p>
            </div>
            <CloudArrowUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamanho Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFileSize(minutas.reduce((acc, m) => acc + m.tamanho, 0))}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(minutas.map(m => m.tipo)).size}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Lista de Minutas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Modelos de Minutas
          </h2>
        </div>
        
        {minutas.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma minuta encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comece enviando seu primeiro modelo de minuta
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              Enviar Primeira Minuta
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {minutas.map((minuta) => (
              <div key={minuta.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {minuta.nome}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          minuta.isEditada 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {minuta.isEditada ? 'Editada' : 'Original'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                          v{minuta.versao}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {minuta.descricao || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Tipo: {minuta.tipo}</span>
                        <span>Tamanho: {formatFileSize(minuta.tamanho)}</span>
                        <span>Enviado em: {new Date(minuta.dataUpload).toLocaleDateString('pt-BR')}</span>
                        {minuta.dataUltimaEdicao && (
                          <span>Editado em: {new Date(minuta.dataUltimaEdicao).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMinuta(minuta)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                      title="Visualizar e Editar"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(minuta.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Excluir"
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

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Enviar Nova Minuta
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arquivo (.docx)
                  </label>
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Minuta *
                  </label>
                  <input
                    type="text"
                    value={uploadData.nome}
                    onChange={(e) => setUploadData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Minuta de Acordo de Cooperação"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={uploadData.descricao}
                    onChange={(e) => setUploadData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Descreva o propósito desta minuta..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadFile || !uploadData.nome}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isUploading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualizador/Editor de Minutas */}
      {selectedMinuta && (
        <DocxViewer
          minutaId={selectedMinuta.id}
          minutaNome={selectedMinuta.nome}
          onClose={() => {
            setSelectedMinuta(null);
            carregarMinutas(); // Recarregar lista após possíveis alterações
          }}
        />
      )}
    </div>
  );
}
