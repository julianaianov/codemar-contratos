'use client';

import React from 'react';

export default function ReceitasPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Receitas</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Gestão de receitas municipais</p>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Página de Receitas
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Esta é uma versão simplificada da página de receitas para testar se o problema está nos componentes complexos.
        </p>
      </div>
    </div>
  );
}



