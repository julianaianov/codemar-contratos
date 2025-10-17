'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import AIDashboard from '@/components/ai/AIDashboard';

export default function AssistenteIAPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <SparklesIcon className="h-8 w-8 text-purple-500" />
          Assistente IA CODEMAR
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Use inteligência artificial para analisar contratos, minutas e dados do sistema
        </p>
      </div>

      <AIDashboard />

      {/* Informações sobre o Assistente */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Como usar o Assistente IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">🔍 Consultas sobre Contratos:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>"Quais são os maiores contratos por valor?"</li>
              <li>"Quais fornecedores têm mais contratos?"</li>
              <li>"Qual diretoria tem mais gastos?"</li>
              <li>"Quais contratos estão próximos do vencimento?"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">📄 Consultas sobre Minutas:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>"Qual minuta usar para acordo de cooperação?"</li>
              <li>"Preciso de uma minuta para contrato de serviços"</li>
              <li>"Quais minutas estão disponíveis?"</li>
              <li>"Recomende uma minuta para meu caso"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recursos do Assistente */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              IA Avançada
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Powered by Google Gemini AI para análises inteligentes e respostas precisas sobre seus dados.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Análise Inteligente
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Identifica padrões, tendências e insights valiosos nos seus contratos e minutas.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Respostas Rápidas
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Obtenha respostas instantâneas e sugestões úteis para suas consultas.
          </p>
        </div>
      </div>
    </div>
  );
}
