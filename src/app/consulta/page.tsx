'use client';

import React from 'react';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, CreditCardIcon, UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ConsultaPage() {
  const consultaOptions = [
    {
      title: 'Consulta de Contratos',
      description: 'Consulte contratos cadastrados no sistema',
      icon: ClipboardDocumentListIcon,
      href: '/consulta/contratos',
      color: 'bg-blue-500',
      count: 0,
      label: 'Contratos',
    },
    {
      title: 'Instrumentos de Cobrança',
      description: 'Consulte instrumentos de cobrança e títulos',
      icon: CreditCardIcon,
      href: '/consulta/cobranca',
      color: 'bg-green-500',
      count: 0,
      label: 'Instrumentos',
    },
    {
      title: 'Terceirizados',
      description: 'Consulte informações sobre terceirizados',
      icon: UsersIcon,
      href: '/consulta/terceirizados',
      color: 'bg-purple-500',
      count: 0,
      label: 'Terceirizados',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MagnifyingGlassIcon className="h-8 w-8 text-blue-500" />
          Consultas
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Consulte informações sobre contratos, instrumentos de cobrança e terceirizados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {consultaOptions.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${option.color}`}>
                <option.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {option.count}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {option.label}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {option.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {option.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Pesquisa Rápida */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Pesquisa Rápida
        </h2>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por número do contrato, fornecedor, terceirizado..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Buscas recentes:</span>
          <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            Contrato 001/2025
          </button>
          <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            Fornecedor XYZ
          </button>
        </div>
      </div>
    </div>
  );
}

