'use client';

import React from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, ClipboardDocumentListIcon, TruckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ImportacaoPage() {
  const importOptions = [
    {
      title: 'Importar XML',
      description: 'Importe arquivos XML de contratos do e-Cidade ou outros sistemas',
      icon: DocumentTextIcon,
      href: '/importacao/xml',
      color: 'bg-blue-500',
    },
    {
      title: 'Importar Excel',
      description: 'Importe contratos em lote através de planilhas Excel (.xlsx, .xls)',
      icon: ClipboardDocumentListIcon,
      href: '/importacao/excel',
      color: 'bg-green-500',
    },
    {
      title: 'Importar CSV',
      description: 'Importe contratos através de arquivos CSV (valores separados por vírgula)',
      icon: DocumentTextIcon,
      href: '/importacao/csv',
      color: 'bg-purple-500',
    },
    {
      title: 'Importar PDF',
      description: 'Importe contratos em PDF com extração automática de dados',
      icon: DocumentTextIcon,
      href: '/importacao/pdf',
      color: 'bg-red-500',
      badge: 'Novo',
    },
    {
      title: 'Ver Importações',
      description: 'Visualize o histórico e status de todas as importações realizadas',
      icon: ClipboardDocumentListIcon,
      href: '/importacao/historico',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ArrowDownTrayIcon className="h-8 w-8 text-blue-500" />
          Importação de Dados
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Importe dados de diferentes fontes para o sistema de gestão de contratos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {importOptions.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 relative"
          >
            {option.badge && (
              <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                {option.badge}
              </span>
            )}
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${option.color}`}>
                <option.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {option.title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {option.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Importante
        </h3>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-2">
          <li>Certifique-se de que os arquivos estão no formato correto antes de importar</li>
          <li>Faça backup dos dados antes de realizar importações em lote</li>
          <li>Verifique se não há duplicatas antes de confirmar a importação</li>
          <li>Acompanhe o log de importação para identificar possíveis erros</li>
        </ul>
      </div>
    </div>
  );
}

