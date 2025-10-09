'use client';

import React from 'react';
import { UserGroupIcon, UsersIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TercerizacaoPage() {
  const tercerizacaoOptions = [
    {
      title: 'Terceirizados',
      description: 'Gerencie cadastro de terceirizados',
      icon: UsersIcon,
      href: '/tercerizacao/terceirizados',
      color: 'bg-blue-500',
      count: 0,
      label: 'Ativos',
    },
    {
      title: 'Contratos de Terceirização',
      description: 'Visualize contratos de terceirização',
      icon: ClipboardDocumentListIcon,
      href: '/tercerizacao/contratos',
      color: 'bg-green-500',
      count: 0,
      label: 'Vigentes',
    },
    {
      title: 'Folha de Ponto',
      description: 'Acompanhe folha de ponto de terceirizados',
      icon: DocumentTextIcon,
      href: '/tercerizacao/folha-ponto',
      color: 'bg-purple-500',
      count: 0,
      label: 'Pendentes',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <UserGroupIcon className="h-8 w-8 text-blue-500" />
          Gestão de Terceirização
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie contratos, terceirizados e folha de ponto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tercerizacaoOptions.map((option) => (
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total de Terceirizados</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Contratos Ativos</div>
          <div className="text-3xl font-bold text-green-600 mt-2">0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pontos Pendentes</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Custo Mensal</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">R$ 0</div>
        </div>
      </div>

      {/* Lista de Terceirizados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Terceirizados Ativos
        </h2>
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum terceirizado cadastrado
          </p>
        </div>
      </div>

      {/* Avisos */}
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          Lembretes
        </h3>
        <ul className="list-disc list-inside text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>Nenhum contrato próximo ao vencimento</li>
          <li>Todas as folhas de ponto estão em dia</li>
        </ul>
      </div>
    </div>
  );
}

