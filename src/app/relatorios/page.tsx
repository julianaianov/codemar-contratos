'use client';

import React from 'react';
import { DocumentChartBarIcon, ClipboardDocumentListIcon, TruckIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RelatoriosPage() {
  const relatoriosOptions = [
    {
      title: 'Relatórios de Contratos',
      description: 'Gere relatórios sobre contratos e suas execuções',
      icon: ClipboardDocumentListIcon,
      href: '/relatorios/contratos',
      color: 'bg-blue-500',
      count: 0,
      label: 'Disponíveis',
    },
    {
      title: 'Relatórios de Fornecedores',
      description: 'Análises e relatórios sobre fornecedores',
      icon: TruckIcon,
      href: '/relatorios/fornecedores',
      color: 'bg-green-500',
      count: 0,
      label: 'Disponíveis',
    },
    {
      title: 'Relatórios de Fiscalização',
      description: 'Relatórios de vistorias e ocorrências',
      icon: ShieldCheckIcon,
      href: '/relatorios/fiscalizacao',
      color: 'bg-purple-500',
      count: 0,
      label: 'Disponíveis',
    },
    {
      title: 'Relatórios Financeiros',
      description: 'Análises financeiras e de despesas',
      icon: CurrencyDollarIcon,
      href: '/relatorios/financeiro',
      color: 'bg-orange-500',
      count: 0,
      label: 'Disponíveis',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <DocumentChartBarIcon className="h-8 w-8 text-blue-500" />
          Relatórios
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gere e visualize relatórios gerenciais do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {relatoriosOptions.map((option) => (
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

      {/* Relatórios Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Relatórios Gerados Recentemente
        </h2>
        <div className="text-center py-12">
          <DocumentChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum relatório gerado recentemente
          </p>
        </div>
      </div>

      {/* Modelos de Relatórios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Modelos de Relatórios Disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Contratos por Período',
            'Fornecedores Ativos',
            'Despesas por Categoria',
            'Contratos a Vencer',
            'Histórico de Fiscalizações',
            'Análise Financeira',
          ].map((modelo, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <DocumentChartBarIcon className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {modelo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
