'use client';

import React from 'react';
import { DocumentPlusIcon, DocumentTextIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function GeracaoContratosPage() {
  const geracaoOptions = [
    {
      title: 'Modelos',
      description: 'Gerencie modelos de contratos',
      icon: DocumentTextIcon,
      href: '/geracao-contratos/modelos',
      color: 'bg-blue-500',
      count: 0,
      label: 'Modelos disponíveis',
    },
    {
      title: 'Gerar Contrato',
      description: 'Crie um novo contrato a partir de modelos',
      icon: DocumentPlusIcon,
      href: '/geracao-contratos/gerar',
      color: 'bg-green-500',
      count: 0,
      label: 'Gerados este mês',
    },
    {
      title: 'Minhas Minutas',
      description: 'Visualize suas minutas salvas',
      icon: DocumentCheckIcon,
      href: '/geracao-contratos/minutas',
      color: 'bg-purple-500',
      count: 0,
      label: 'Minutas salvas',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <DocumentPlusIcon className="h-8 w-8 text-blue-500" />
          Geração de Contratos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Crie e gerencie contratos utilizando modelos padronizados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {geracaoOptions.map((option) => (
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

      {/* Início Rápido */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-8 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Criar Novo Contrato</h2>
        <p className="mb-6 text-blue-50">
          Escolha um modelo e gere um contrato personalizado em minutos
        </p>
        <Link
          href="/geracao-contratos/gerar"
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          Iniciar Geração
        </Link>
      </div>

      {/* Modelos Populares */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Modelos Populares
        </h2>
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum modelo disponível ainda
          </p>
          <Link
            href="/geracao-contratos/modelos"
            className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            Gerenciar Modelos
          </Link>
        </div>
      </div>
    </div>
  );
}

