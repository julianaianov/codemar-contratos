'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon,
  LightBulbIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  query: string;
  answer: string;
  suggestions: string[];
  confidence: number;
  sources?: string[];
}

interface AISearchBoxProps {
  placeholder?: string;
  onResult?: (result: SearchResult) => void;
  searchType?: 'contracts' | 'minutas' | 'general';
  className?: string;
}

export default function AISearchBox({ 
  placeholder = "Pergunte sobre contratos, minutas ou dados...",
  onResult,
  searchType = 'general',
  className = ''
}: AISearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Carregar sugestões iniciais
  useEffect(() => {
    loadSuggestions();
  }, [searchType]);

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`/api/ai/search?type=suggestions`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setResult(null);

    try {
      const endpoint = searchType === 'minutas' 
        ? `/api/ai/search/minutas?q=${encodeURIComponent(searchQuery)}`
        : `/api/ai/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        if (onResult) {
          onResult(data.result);
        }
      } else {
        throw new Error(data.error || 'Erro na busca');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResult({
        query: searchQuery,
        answer: 'Erro ao processar sua consulta. Tente novamente.',
        suggestions: ['Verificar conexão', 'Tentar consulta mais simples'],
        confidence: 0,
        sources: []
      });
    } finally {
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearResult = () => {
    setResult(null);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barra de Busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <SparklesIcon className="h-5 w-5 text-purple-500" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="p-1 text-gray-400 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sugestões */}
      {showSuggestions && suggestions.length > 0 && !result && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              <LightBulbIcon className="h-4 w-4" />
              <span>Sugestões de consulta:</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultado da Busca */}
      {result && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-start justify-between mb-3">
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
              onClick={clearResult}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.answer}
            </p>
          </div>

          {/* Fontes */}
          {result.sources && result.sources.length > 0 && (
            <div className="mb-4">
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

          {/* Sugestões de Follow-up */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Consultas relacionadas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay para fechar sugestões */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}



