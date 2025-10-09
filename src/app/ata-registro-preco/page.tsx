'use client';

import React from 'react';
import { DocumentCheckIcon, DocumentPlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AtaRegistroPrecoPage() {
  const ataOptions = [
    {
      title: 'Atas Vigentes',
      description: 'Visualize atas de registro de preço vigentes',
      icon: DocumentCheckIcon,
      href: '/ata-registro-preco/vigentes',
      color: 'bg-green-500',
      count: 0,
      label: 'Vigentes',
    },
    {
      title: 'Nova Ata',
      description: 'Cadastre uma nova ata de registro de preço',
      icon: DocumentPlusIcon,
      href: '/ata-registro-preco/nova',
      color: 'bg-blue-500',
      count: 0,
      label: 'Criadas este ano',
    },
    {
      title: 'Consultar Atas',
      description: 'Consulte histórico de atas registradas',
      icon: EyeIcon,
      href: '/ata-registro-preco/consultar',
      color: 'bg-purple-500',
      count: 0,
      label: 'Total',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <DocumentCheckIcon className="h-8 w-8 text-blue-500" />
          Ata de Registro de Preço
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie atas de registro de preço e adesões
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {ataOptions.map((option) => (
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
          <div className="text-sm text-gray-600 dark:text-gray-400">Atas Vigentes</div>
          <div className="text-3xl font-bold text-green-600 mt-2">0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">A Vencer em 30 dias</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Adesões</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Valor Total</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">R$ 0</div>
        </div>
      </div>

      {/* Lista de Atas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Atas Recentes
        </h2>
        <div className="text-center py-12">
          <DocumentCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma ata cadastrada
          </p>
          <Link
            href="/ata-registro-preco/nova"
            className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            Cadastrar Nova Ata
          </Link>
        </div>
      </div>

      {/* Informações */}
      <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Sobre Ata de Registro de Preços
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-3">
          A Ata de Registro de Preços (ARP) é um instrumento que registra preços, fornecedores, 
          órgãos participantes e condições para futura contratação, mediante Sistema de Registro de Preços.
        </p>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-2">
          <li>Validade máxima de 12 meses</li>
          <li>Possibilidade de adesões por outros órgãos</li>
          <li>Controle de saldo e quantitativos</li>
          <li>Gestão de fornecedores registrados</li>
        </ul>
      </div>
    </div>
  );
}

