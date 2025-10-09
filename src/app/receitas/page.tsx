'use client';

import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function ReceitasPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BanknotesIcon className="h-8 w-8 text-green-500" />
          Gestão de Receitas
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Acompanhamento e gestão das receitas municipais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Receita Total</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">R$ 0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Receita no Mês</div>
          <div className="text-3xl font-bold text-green-600 mt-2">R$ 0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Previsto</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">R$ 0</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">% Realizado</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">0%</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Receitas por Categoria
        </h2>
        <div className="text-center py-12">
          <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma receita cadastrada
          </p>
        </div>
      </div>
    </div>
  );
}

