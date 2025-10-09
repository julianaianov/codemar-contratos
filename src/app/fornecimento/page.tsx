'use client';

import React from 'react';
import { TruckIcon, ClipboardDocumentListIcon, DocumentCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FornecimentoPage() {
  const fornecimentoOptions = [
    {
      title: 'Pedidos',
      description: 'Gerencie pedidos de fornecimento',
      icon: ClipboardDocumentListIcon,
      href: '/fornecimento/pedidos',
      color: 'bg-blue-500',
      stats: { pendentes: 0, total: 0 },
    },
    {
      title: 'Entregas',
      description: 'Acompanhe entregas realizadas',
      icon: DocumentCheckIcon,
      href: '/fornecimento/entregas',
      color: 'bg-green-500',
      stats: { concluidas: 0, total: 0 },
    },
    {
      title: 'Acompanhamento',
      description: 'Monitore o status dos fornecimentos',
      icon: ChartBarIcon,
      href: '/fornecimento/acompanhamento',
      color: 'bg-purple-500',
      stats: { emAndamento: 0 },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TruckIcon className="h-8 w-8 text-blue-500" />
          Gestão de Fornecimento
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie pedidos, entregas e acompanhamento de fornecimentos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {fornecimentoOptions.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${option.color}`}>
                <option.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {option.title}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {option.description}
            </p>
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {Object.entries(option.stats).map(([key, value]) => (
                <div key={key} className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key === 'pendentes' ? 'Pendentes' : 
                     key === 'concluidas' ? 'Concluídas' :
                     key === 'emAndamento' ? 'Em andamento' : 
                     key}
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Resumo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Resumo de Fornecimentos
        </h2>
        <div className="text-center py-12">
          <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum fornecimento cadastrado
          </p>
        </div>
      </div>
    </div>
  );
}

