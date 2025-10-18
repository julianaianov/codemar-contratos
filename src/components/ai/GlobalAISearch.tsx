'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon,
  XMarkIcon,
  CommandLineIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  query: string;
  answer: string;
  suggestions: string[];
  confidence: number;
  sources?: string[];
}

interface GlobalAISearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalAISearch({ isOpen, onClose }: GlobalAISearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchType, setSearchType] = useState<'general' | 'contracts' | 'minutas'>('general');

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('global-search-input');
      if (input) {
        input.focus();
      }
    }
  }, [isOpen]);

  // Atalho de teclado Ctrl+K ou Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Abrir modal de busca
          const event = new CustomEvent('openGlobalSearch');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResult(null);

    try {
      let endpoint = '';
      
      switch (searchType) {
        case 'minutas':
          endpoint = `/api/ai/search/minutas?q=${encodeURIComponent(query)}`;
          break;
        case 'contracts':
          endpoint = `/api/ai/search?q=${encodeURIComponent(query)}&type=contracts`;
          break;
        default:
          endpoint = `/api/ai/search?q=${encodeURIComponent(query)}&type=general`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        throw new Error(data.error || 'Erro na busca');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResult({
        query,
        answer: 'Erro ao processar sua consulta. Tente novamente.',
        suggestions: ['Verificar conexão', 'Tentar consulta mais simples'],
        confidence: 0,
        sources: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Busca Inteligente CODEMAR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                id="global-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte sobre contratos, minutas, dados..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Search Type Selector */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSearchType('general')}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                searchType === 'general'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Geral
            </button>
            <button
              onClick={() => setSearchType('contracts')}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                searchType === 'contracts'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Contratos
            </button>
            <button
              onClick={() => setSearchType('minutas')}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                searchType === 'minutas'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Minutas
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result && !isSearching && (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Busca Inteligente
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Pergunte sobre contratos, minutas ou dados do sistema
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    💡 Exemplos de consultas:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• "Quais são os maiores contratos?"</li>
                    <li>• "Qual minuta usar para acordo?"</li>
                    <li>• "Analise as tendências"</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    ⌨️ Atalhos:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Ctrl+K ou Cmd+K</li>
                    <li>• Esc para fechar</li>
                    <li>• Enter para buscar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Resposta da IA
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.confidence >= 80 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : result.confidence >= 60
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {result.confidence}% confiança
                  </span>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  Nova busca
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.answer}
                </p>
              </div>

              {/* Fontes */}
              {result.sources && result.sources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Fontes:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Consultas relacionadas:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(suggestion);
                          handleSearch();
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>Powered by Google Gemini AI</span>
              <span>•</span>
              <span>Tipo: {searchType}</span>
            </div>
            <div className="flex items-center gap-2">
              <CommandLineIcon className="h-4 w-4" />
              <span>Ctrl+K para abrir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



