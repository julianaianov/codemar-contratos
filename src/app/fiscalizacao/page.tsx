'use client';

import React from 'react';
import { ShieldCheckIcon, EyeIcon, ExclamationTriangleIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FiscalizacaoPage() {
  const fiscalizacaoOptions = [
    {
      title: 'Vistorias',
      description: 'Agende e realize vistorias em contratos',
      icon: EyeIcon,
      href: '/fiscalizacao/vistorias',
      color: 'bg-blue-500',
      count: 0,
      label: 'Programadas',
    },
    {
      title: 'Ocorrências',
      description: 'Registre e acompanhe ocorrências e não conformidades',
      icon: ExclamationTriangleIcon,
      href: '/fiscalizacao/ocorrencias',
      color: 'bg-red-500',
      count: 0,
      label: 'Abertas',
    },
    {
      title: 'Relatórios de Fiscalização',
      description: 'Gere relatórios de fiscalização e acompanhamento',
      icon: DocumentChartBarIcon,
      href: '/fiscalizacao/relatorios',
      color: 'bg-green-500',
      count: 0,
      label: 'Gerados',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
          Fiscalização de Contratos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie a fiscalização e acompanhamento da execução dos contratos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {fiscalizacaoOptions.map((option) => (
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

      {/* Contratos em Fiscalização */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Contratos em Fiscalização
        </h2>
        <div className="text-center py-12">
          <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum contrato em fiscalização no momento
          </p>
        </div>
      </div>

      {/* Alertas */}
      <div className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3 mb-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            Alertas e Lembretes
          </h3>
        </div>
        <ul className="list-disc list-inside text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>Nenhum alerta pendente</li>
        </ul>
      </div>
    </div>
  );
}

