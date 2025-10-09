'use client';

import React, { useState } from 'react';
import { DocumentTextIcon, ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/importacao/FileUpload';

export default function ImportacaoXMLPage() {
  const router = useRouter();
  const [selectedDiretoria, setSelectedDiretoria] = useState('');

  const diretorias = [
    'Presidência',
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
          <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          Importar Arquivo XML
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Faça upload de arquivos XML contendo dados de contratos
        </p>
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
          acceptedFormats=".xml"
          fileType="xml"
          onUploadSuccess={handleUploadSuccess}
          disabled={!selectedDiretoria}
          diretoria={selectedDiretoria}
        />
      </div>

      {/* Informações sobre o formato */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estrutura Esperada */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estrutura do XML
            </h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-gray-700 dark:text-gray-300">{`<?xml version="1.0"?>
<contratos>
  <contrato>
    <numero>001/2025</numero>
    <objeto>Descrição</objeto>
    <contratante>Nome</contratante>
    <contratado>Empresa</contratado>
    <cnpj>00.000.000/0001-00</cnpj>
    <valor>150000.00</valor>
    <data_inicio>2025-01-01</data_inicio>
    <data_fim>2025-12-31</data_fim>
    <modalidade>Pregão</modalidade>
    <status>Ativo</status>
  </contrato>
</contratos>`}</pre>
          </div>
        </div>

        {/* Campos Aceitos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Campos Suportados
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• <strong>numero:</strong> Número do contrato</li>
            <li>• <strong>objeto:</strong> Descrição do objeto</li>
            <li>• <strong>contratante:</strong> Nome do contratante</li>
            <li>• <strong>contratado:</strong> Nome do contratado</li>
            <li>• <strong>cnpj:</strong> CNPJ do contratado</li>
            <li>• <strong>valor:</strong> Valor do contrato</li>
            <li>• <strong>data_inicio:</strong> Data de início</li>
            <li>• <strong>data_fim:</strong> Data de término</li>
            <li>• <strong>modalidade:</strong> Modalidade de licitação</li>
            <li>• <strong>status:</strong> Status do contrato</li>
            <li>• <strong>tipo:</strong> Tipo do contrato</li>
            <li>• <strong>secretaria:</strong> Secretaria responsável</li>
            <li>• <strong>fonte_recurso:</strong> Fonte do recurso</li>
            <li>• <strong>observacoes:</strong> Observações</li>
          </ul>
        </div>
      </div>

      {/* Dicas */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5" />
          Dicas Importantes
        </h3>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-2 text-sm">
          <li>O arquivo deve estar codificado em UTF-8</li>
          <li>Datas devem estar no formato AAAA-MM-DD (ex: 2025-01-01)</li>
          <li>Valores monetários devem usar ponto como separador decimal (ex: 150000.00)</li>
          <li>Tamanho máximo do arquivo: 10MB</li>
          <li>Todos os campos são opcionais, mas recomendamos preencher o máximo possível</li>
          <li>Erros em registros individuais não interrompem o processamento completo</li>
        </ul>
      </div>
    </div>
  );
}

