'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import ContratosManager from '@/components/contratos/ContratosManager';

export default function ModelosContratosPage() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              Modelos de Contratos
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gerencie modelos de contratos para geração automática
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            Novo Modelo
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Modelos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Modelos Editados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
            <PencilIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
            <ArrowDownTrayIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">-</p>
            </div>
            <EyeIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Gerenciador de Contratos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Meus Modelos de Contratos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload, edite e gerencie seus modelos de contratos
          </p>
        </div>
        
        <div className="p-6">
          <ContratosManager 
            showUpload={showUpload}
            onCloseUpload={() => setShowUpload(false)}
            title="Modelos de Contratos"
            description="Gerencie seus modelos para geração de contratos"
          />
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/geracao-contratos/gerar"
          className="block p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md text-white hover:from-green-600 hover:to-green-700 transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <DocumentDuplicateIcon className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Gerar Contrato</h3>
          </div>
          <p className="text-green-100">
            Use um modelo para criar um novo contrato
          </p>
        </Link>
        
        <Link
          href="/importacao"
          className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <PlusIcon className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Importar Contrato</h3>
          </div>
          <p className="text-blue-100">
            Importe contratos existentes como modelos
          </p>
        </Link>
        
        <Link
          href="/geracao-contratos/minutas"
          className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <DocumentTextIcon className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Minhas Minutas</h3>
          </div>
          <p className="text-purple-100">
            Visualize e edite suas minutas salvas
          </p>
        </Link>
      </div>
    </div>
  );
}