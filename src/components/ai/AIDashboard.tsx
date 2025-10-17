'use client';

import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AISearchBox from './AISearchBox';

interface SearchResult {
  query: string;
  answer: string;
  suggestions: string[];
  confidence: number;
  sources?: string[];
}

export default function AIDashboard() {
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [insights, setInsights] = useState<SearchResult[]>([]);

  // Carregar consultas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-recent-queries');
    if (saved) {
      setRecentQueries(JSON.parse(saved));
    }
  }, []);

  const handleSearchResult = (result: SearchResult) => {
    // Adicionar à lista de consultas recentes
    const newQueries = [result.query, ...recentQueries.filter(q => q !== result.query)].slice(0, 5);
    setRecentQueries(newQueries);
    localStorage.setItem('ai-recent-queries', JSON.stringify(newQueries));

    // Adicionar insight se a confiança for alta
    if (result.confidence >= 80) {
      setInsights(prev => [result, ...prev.slice(0, 4)]);
    }
  };

  const clearRecentQueries = () => {
    setRecentQueries([]);
    localStorage.removeItem('ai-recent-queries');
  };

  const clearInsights = () => {
    setInsights([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Assistente IA CODEMAR</h2>
            <p className="text-purple-100">
              Pergunte sobre contratos, minutas e dados do sistema
            </p>
          </div>
        </div>
        
        <AISearchBox
          placeholder="Ex: Quais são os maiores contratos por valor?"
          onResult={handleSearchResult}
          searchType="general"
          className="max-w-2xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas Recentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Consultas Recentes
              </h3>
            </div>
            {recentQueries.length > 0 && (
              <button
                onClick={clearRecentQueries}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                Limpar
              </button>
            )}
          </div>
          
          {recentQueries.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma consulta recente
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Faça sua primeira pergunta para começar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    // Re-executar a consulta
                    const searchBox = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (searchBox) {
                      searchBox.value = query;
                      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {query}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights da IA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insights da IA
              </h3>
            </div>
            {insights.length > 0 && (
              <button
                onClick={clearInsights}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                Limpar
              </button>
            )}
          </div>
          
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum insight disponível
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Faça consultas para gerar insights
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {insight.query}
                    </span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      {insight.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {insight.answer.length > 100 
                      ? `${insight.answer.substring(0, 100)}...`
                      : insight.answer
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ações Rápidas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const searchBox = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchBox) {
                searchBox.value = 'Quais são os maiores contratos por valor?';
                searchBox.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
            className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
          >
            <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Análise de Valores
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Maiores contratos
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              const searchBox = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchBox) {
                searchBox.value = 'Quais fornecedores têm mais contratos?';
                searchBox.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
            className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
          >
            <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="font-medium text-green-900 dark:text-green-100">
                Análise de Fornecedores
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Top fornecedores
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              const searchBox = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchBox) {
                searchBox.value = 'Analise as tendências dos contratos';
                searchBox.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
            className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
          >
            <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <p className="font-medium text-purple-900 dark:text-purple-100">
                Análise de Tendências
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Padrões e insights
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

