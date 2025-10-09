'use client';

import React from 'react';
import { PencilSquareIcon, DocumentTextIcon, DocumentCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AssinaturaEletronicaPage() {
  const assinaturaOptions = [
    {
      title: 'Documentos Pendentes',
      description: 'Documentos aguardando assinatura',
      icon: DocumentTextIcon,
      href: '/assinatura-eletronica/pendentes',
      color: 'bg-yellow-500',
      count: 0,
      label: 'Pendentes',
    },
    {
      title: 'Documentos Assinados',
      description: 'Documentos com assinatura concluída',
      icon: DocumentCheckIcon,
      href: '/assinatura-eletronica/assinados',
      color: 'bg-green-500',
      count: 0,
      label: 'Assinados',
    },
    {
      title: 'Enviar para Assinatura',
      description: 'Envie documentos para assinatura eletrônica',
      icon: ArrowDownTrayIcon,
      href: '/assinatura-eletronica/enviar',
      color: 'bg-blue-500',
      count: 0,
      label: 'Enviados',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <PencilSquareIcon className="h-8 w-8 text-blue-500" />
          Assinatura Eletrônica
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie documentos e assinaturas eletrônicas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {assinaturaOptions.map((option) => (
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

      {/* Documentos Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Documentos Recentes
        </h2>
        <div className="text-center py-12">
          <PencilSquareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum documento para assinatura
          </p>
          <Link
            href="/assinatura-eletronica/enviar"
            className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            Enviar Documento
          </Link>
        </div>
      </div>

      {/* Informações sobre Assinatura Eletrônica */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Sobre Assinatura Eletrônica
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-3">
          A assinatura eletrônica permite validar documentos digitalmente, garantindo 
          autenticidade, integridade e validade jurídica.
        </p>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-2">
          <li>Assinatura com certificado digital ICP-Brasil</li>
          <li>Rastreabilidade completa do processo</li>
          <li>Notificações automáticas para signatários</li>
          <li>Armazenamento seguro dos documentos</li>
          <li>Validade jurídica conforme MP 2.200-2/2001</li>
        </ul>
      </div>
    </div>
  );
}

