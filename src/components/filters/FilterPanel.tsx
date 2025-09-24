'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FilterPanelProps {
  onFilter: (filters: FilterData) => void;
  onClear: () => void;
  loading?: boolean;
}

interface FilterData {
  exercicio: string;
  instituicao?: number;
  credor?: string;
  elemento?: string;
  fonte?: string;
  funcao?: string;
  subfuncao?: string;
  programa?: string;
  projeto?: string;
}

interface Institution {
  id: number;
  descricao: string;
}

export function FilterPanel({ onFilter, onClear, loading = false }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterData>({
    exercicio: new Date().getFullYear().toString(),
  });
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filterBy, setFilterBy] = useState('instituicao');

  const availableYears = ['2025', '2024', '2023', '2022', '2021'];

  useEffect(() => {
    // Buscar instituições
    const fetchInstitutions = async () => {
      try {
        const response = await fetch('/api/ecidade/database?path=institutions');
        const data = await response.json();
        setInstitutions(data);
      } catch (error) {
        console.error('Erro ao carregar instituições:', error);
      }
    };

    fetchInstitutions();
  }, []);

  const handleFilterChange = (key: keyof FilterData, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({
      exercicio: new Date().getFullYear().toString(),
    });
    onClear();
  };

  const renderFilterInput = () => {
    switch (filterBy) {
      case 'instituicao':
        return (
          <select
            value={filters.instituicao || ''}
            onChange={(e) => handleFilterChange('instituicao', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Selecione uma instituição</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.descricao}
              </option>
            ))}
          </select>
        );
      case 'credor':
        return (
          <input
            type="text"
            placeholder="Digite o nome do credor"
            value={filters.credor || ''}
            onChange={(e) => handleFilterChange('credor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
          />
        );
      case 'elemento':
        return (
          <input
            type="text"
            placeholder="Digite o elemento de despesa"
            value={filters.elemento || ''}
            onChange={(e) => handleFilterChange('elemento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
          />
        );
      default:
        return (
          <input
            type="text"
            placeholder="Digite o filtro"
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
          />
        );
    }
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Consulta de Dados</h3>
        
        {/* Aviso sobre filtros */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                No filtro de Exercício só são exibidos os anos que possuam elementos cadastrados. 
                O fato de algum exercício não ser exibido indica que não existem dados para este período.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exercício */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exercício:
            </label>
            <select
              value={filters.exercicio}
              onChange={(e) => handleFilterChange('exercicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar Por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar Por:
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
            >
              <option value="instituicao">INSTITUIÇÃO/ÓRGÃO</option>
              <option value="credor">CREDOR/INSTITUIÇÃO</option>
              <option value="elemento">ELEMENTO DE DESPESA</option>
              <option value="fonte">FONTE DE RECURSO</option>
              <option value="funcao">FUNÇÃO</option>
              <option value="subfuncao">SUBFUNÇÃO</option>
              <option value="programa">PROGRAMA</option>
              <option value="projeto">PROJETO/ATIVIDADE</option>
            </select>
          </div>

          {/* Campo de filtro dinâmico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {filterBy === 'instituicao' ? 'Instituição:' : 
               filterBy === 'credor' ? 'Credor:' :
               filterBy === 'elemento' ? 'Elemento:' : 'Filtro:'}
            </label>
            {renderFilterInput()}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
          Pesquisar
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Limpar
        </button>
      </div>
    </div>
  );
}