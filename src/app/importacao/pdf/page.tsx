'use client';

import React, { useState } from 'react';
import { DocumentTextIcon, ArrowLeftIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/importacao/FileUpload';

export default function ImportacaoPDFPage() {
  const router = useRouter();
  const [selectedDiretoria, setSelectedDiretoria] = useState('');

  const diretorias = [
    'Presidência',
    'Diretoria de Administração',
    'Diretoria Jurídica',
    'Diretoria de Assuntos Imobiliários',
    'Diretoria de Operações',
    'Diretoria de Tecnologia da Informação e Inovação',
    'Diretoria de Governança em Licitações e Contratações'
  ];

  const handleUploadSuccess = (data: any) => {
    // Redirecionar para o dashboard da diretoria selecionada
    if (selectedDiretoria) {
      setTimeout(() => {
        router.push(`/contratos/diretoria/${encodeURIComponent(selectedDiretoria)}`);
      }, 2000);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/importacao"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Importação
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <DocumentTextIcon className="h-8 w-8 text-red-500" />
          Importar Contratos de PDF
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Faça upload de arquivos PDF de contratos para extração automática de dados
        </p>
      </div>

      {/* Aviso sobre PDFs */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Importante: Extração Automática de PDFs
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>O sistema tentará extrair automaticamente os dados do PDF</li>
              <li>✅ <strong>Suporta PDFs com texto selecionável</strong> (extração direta)</li>
              <li>✅ <strong>Suporta PDFs escaneados</strong> (OCR automático em português)</li>
              <li>Verifique sempre os dados extraídos antes de finalizar a importação</li>
              <li>PDFs com baixa qualidade podem ter extração parcial</li>
              <li>O arquivo PDF original será armazenado para consulta posterior</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seleção de Diretoria */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Selecionar Diretoria
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Escolha a diretoria responsável pelos contratos que serão importados:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diretorias.map((diretoria) => (
            <label key={diretoria} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="diretoria"
                value={diretoria}
                checked={selectedDiretoria === diretoria}
                onChange={(e) => setSelectedDiretoria(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {diretoria}
              </span>
            </label>
          ))}
        </div>
        
        {!selectedDiretoria && (
          <p className="text-red-500 text-sm mt-3">
            ⚠️ Por favor, selecione uma diretoria antes de fazer o upload
          </p>
        )}
      </div>

      {/* Componente de Upload */}
      <div className={selectedDiretoria ? '' : 'opacity-50 pointer-events-none'}>
        <FileUpload
          acceptedFormats=".pdf"
          fileType="pdf"
          onUploadSuccess={handleUploadSuccess}
          disabled={!selectedDiretoria}
          diretoria={selectedDiretoria}
        />
      </div>

      {/* Informações sobre o formato */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campos Extraídos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Dados Extraídos Automaticamente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                O sistema tenta identificar os seguintes campos:
              </p>
            </div>
          </div>

          <div className="space-y-2 ml-9">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Número do Contrato</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Objeto do Contrato</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Contratante</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Contratado e CNPJ</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Valor do Contrato</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Datas (Início e Fim)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Modalidade de Licitação</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Tipo de Contrato</span>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Dicas para Melhor Extração
              </h3>
            </div>
          </div>

            <ul className="space-y-3 ml-9 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span><strong>PDFs com texto selecionável:</strong> extração direta e rápida</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span><strong>PDFs escaneados:</strong> OCR automático em português</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Prefira contratos com formatação padronizada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Certifique-se que o PDF não está protegido ou criptografado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Tamanho máximo: 20MB por arquivo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>O PDF original ficará disponível para download</span>
              </li>
            </ul>
        </div>
      </div>
    </div>
  );
}


