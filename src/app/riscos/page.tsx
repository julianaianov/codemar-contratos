'use client';

import React from 'react';
import { ExclamationTriangleIcon, MapIcon, ShieldCheckIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RiscosPage() {
  const riscosOptions = [
    {
      title: 'Mapa de Riscos',
      description: 'Visualize o mapa de riscos dos contratos',
      icon: MapIcon,
      href: '/riscos/mapa',
      color: 'bg-red-500',
      stats: { criticos: 0, altos: 0, medios: 0, baixos: 0 },
    },
    {
      title: 'Avaliação de Riscos',
      description: 'Realize avaliação de riscos contratuais',
      icon: ShieldCheckIcon,
      href: '/riscos/avaliacao',
      color: 'bg-orange-500',
      stats: { pendentes: 0, concluidas: 0 },
    },
    {
      title: 'Plano de Mitigação',
      description: 'Gerencie planos de mitigação de riscos',
      icon: DocumentCheckIcon,
      href: '/riscos/mitigacao',
      color: 'bg-yellow-500',
      stats: { ativos: 0, implementados: 0 },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          Gestão de Riscos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Identifique, avalie e mitigue riscos relacionados aos contratos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {riscosOptions.map((option) => (
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
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {Object.entries(option.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key === 'criticos' ? 'Críticos' :
                     key === 'altos' ? 'Altos' :
                     key === 'medios' ? 'Médios' :
                     key === 'baixos' ? 'Baixos' :
                     key === 'pendentes' ? 'Pendentes' :
                     key === 'concluidas' ? 'Concluídas' :
                     key === 'ativos' ? 'Ativos' :
                     key === 'implementados' ? 'Implementados' :
                     key}
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Dashboard de Riscos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Visão Geral dos Riscos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-800 dark:text-red-200 mb-1">Críticos</div>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100">0</div>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-orange-800 dark:text-orange-200 mb-1">Altos</div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">0</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-1">Médios</div>
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">0</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200 mb-1">Baixos</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">0</div>
          </div>
        </div>
      </div>

      {/* Matriz de Riscos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Matriz de Riscos
        </h2>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum risco identificado
          </p>
        </div>
      </div>
    </div>
  );
}

