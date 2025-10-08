'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ConsultaContratosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Consulta Contratos
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Exibindo 1 a 25 de 4,972 registros
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Contratos.gov.br &gt; Consulta Contratos &gt; Lista
          </span>
        </div>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <MagnifyingGlassIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Ações e Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Visibilidade da coluna
            </button>
            <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
              Copiar
            </button>
            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              Excel
            </button>
            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              CSV
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              PDF
            </button>
            <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
              Imprimir
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Pesquisar:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Digite sua pesquisa..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Órgão
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100">
                <option>Selecione</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Unidade Gestora
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100">
                <option>Selecione</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Fornecedor
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100">
                <option>Selecione</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Número Contrato
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Digite o número"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Remover filtros
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Lista de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Órgão</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Unidade Gestora</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Número Contrato</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Fornecedor</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Vig. Início</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Vig. Fim</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Valor Global</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 text-gray-900 dark:text-gray-100">MINISTERIO DA FAZENDA</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">RFB/ME</td>
                  <td className="py-3 px-2 text-gray-900 dark:text-gray-100">2023NE000108</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">PILOTO CARIMBOS COMERCIO E INDUSTRIA LTDA</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">15/03/2023</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">15/03/2024</td>
                  <td className="text-right py-3 px-2 text-gray-900 dark:text-gray-100">R$ 1.445,00</td>
                  <td className="text-center py-3 px-2">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      👁️
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 text-gray-900 dark:text-gray-100">MINISTERIO DA FAZENDA</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">RFB/ME</td>
                  <td className="py-3 px-2 text-gray-900 dark:text-gray-100">2024NE000109</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">CONSILLIUM SOLUCOES INSTITUCIONAIS E GOVERNAMENTAIS LTDA</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">08/04/2024</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">08/10/2024</td>
                  <td className="text-right py-3 px-2 text-gray-900 dark:text-gray-100">R$ 42.000,00</td>
                  <td className="text-center py-3 px-2">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      👁️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}