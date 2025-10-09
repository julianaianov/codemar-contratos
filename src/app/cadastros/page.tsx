'use client';

import React from 'react';
import { FolderIcon, TruckIcon, ClipboardDocumentListIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CadastrosPage() {
  const cadastros = [
    {
      title: 'Fornecedores',
      description: 'Gerencie o cadastro de fornecedores e empresas',
      icon: TruckIcon,
      href: '/cadastros/fornecedores',
      color: 'bg-green-500',
      stats: { total: 0, ativos: 0 },
    },
    {
      title: 'Contratos',
      description: 'Cadastre e gerencie contratos administrativos',
      icon: ClipboardDocumentListIcon,
      href: '/cadastros/contratos',
      color: 'bg-blue-500',
      stats: { total: 0, vigentes: 0 },
    },
    {
      title: 'Órgãos',
      description: 'Cadastro de órgãos e entidades públicas',
      icon: BuildingOfficeIcon,
      href: '/cadastros/orgaos',
      color: 'bg-purple-500',
      stats: { total: 0 },
    },
    {
      title: 'Unidades Gestoras',
      description: 'Gerencie unidades gestoras e setores',
      icon: BuildingOfficeIcon,
      href: '/cadastros/unidades-gestoras',
      color: 'bg-orange-500',
      stats: { total: 0 },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FolderIcon className="h-8 w-8 text-blue-500" />
          Cadastros
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie todos os cadastros do sistema de gestão de contratos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cadastros.map((cadastro) => (
          <Link
            key={cadastro.href}
            href={cadastro.href}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${cadastro.color}`}>
                <cadastro.icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {cadastro.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {cadastro.description}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {Object.entries(cadastro.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

