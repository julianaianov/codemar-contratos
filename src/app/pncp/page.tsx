'use client';

import React from 'react';
import { GlobeAltIcon, ArrowDownTrayIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PNCPPage() {
  const pncpOptions = [
    {
      title: 'Enviar ao PNCP',
      description: 'Envie contratos para o Portal Nacional de Contratações Públicas',
      icon: ArrowDownTrayIcon,
      href: '/pncp/enviar',
      color: 'bg-blue-500',
      count: 0,
      label: 'Pendentes',
    },
    {
      title: 'Consultar PNCP',
      description: 'Consulte informações de contratos no PNCP',
      icon: EyeIcon,
      href: '/pncp/consultar',
      color: 'bg-green-500',
      count: 0,
      label: 'Sincronizados',
    },
    {
      title: 'Histórico',
      description: 'Visualize o histórico de envios ao PNCP',
      icon: DocumentTextIcon,
      href: '/pncp/historico',
      color: 'bg-purple-500',
      count: 0,
      label: 'Enviados',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <GlobeAltIcon className="h-8 w-8 text-blue-500" />
          Portal Nacional de Contratações Públicas (PNCP)
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Integração com o Portal Nacional de Contratações Públicas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {pncpOptions.map((option) => (
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

      {/* Status da Integração */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Status da Integração
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200 mb-1">Conexão</div>
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              Disponível
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">Último Envio</div>
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Nenhum
            </div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">Taxa de Sucesso</div>
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              100%
            </div>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Sobre o PNCP
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-3">
          O Portal Nacional de Contratações Públicas (PNCP) é uma plataforma digital oficial do Governo Federal 
          que centraliza informações sobre contratações públicas no Brasil, proporcionando transparência e 
          facilitando o acesso às informações sobre licitações e contratos.
        </p>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-2">
          <li>Envio obrigatório de contratos conforme legislação vigente</li>
          <li>Consulta pública de informações sobre contratações</li>
          <li>Histórico completo de envios e sincronizações</li>
          <li>Integração automática com validação de dados</li>
        </ul>
      </div>
    </div>
  );
}

