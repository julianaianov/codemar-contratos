'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FilterPanelProps {
  title: string;
  onFilter: (filters: FilterData) => void;
  showInstitution?: boolean;
  showYear?: boolean;
  showMonth?: boolean;
}

interface FilterData {
  exercicio: string;
  instituicao?: string;
  mes?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  title,
  onFilter,
  showInstitution = true,
  showYear = true,
  showMonth = false,
}) => {
  const [filters, setFilters] = useState<FilterData>({
    exercicio: new Date().getFullYear().toString(),
    instituicao: '',
    mes: '',
  });

  const [years, setYears] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<Array<{id: string, name: string}>>([]);
  const [months] = useState([
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]);

  useEffect(() => {
    // Carregar anos disponíveis
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
    setYears(availableYears);

    // Carregar instituições
    setInstitutions([
      { id: '', name: 'Todas as Instituições' },
      { id: '1', name: 'Prefeitura Municipal' },
      { id: '2', name: 'Câmara Municipal' },
      { id: '3', name: 'Fundação Municipal de Saúde' },
      { id: '4', name: 'Companhia de Saneamento' },
      { id: '5', name: 'Companhia de Desenvolvimento' },
    ]);
  }, []);

  const handleFilter = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({
      exercicio: new Date().getFullYear().toString(),
      instituicao: '',
      mes: '',
    });
    onFilter({
      exercicio: new Date().getFullYear().toString(),
      instituicao: '',
      mes: '',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showYear && (
            <div>
              <label htmlFor="exercicio" className="block text-sm font-medium text-gray-700 mb-2">
                Exercício:
              </label>
              <select
                id="exercicio"
                value={filters.exercicio}
                onChange={(e) => setFilters({ ...filters, exercicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showInstitution && (
            <div>
              <label htmlFor="instituicao" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar Por:
              </label>
              <select
                id="instituicao"
                value={filters.instituicao}
                onChange={(e) => setFilters({ ...filters, instituicao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showMonth && (
            <div>
              <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-2">
                Mês:
              </label>
              <select
                id="mes"
                value={filters.mes}
                onChange={(e) => setFilters({ ...filters, mes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os meses</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Limpar
          </button>
          <button
            onClick={handleFilter}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            Pesquisar
          </button>
        </div>
      </div>
    </div>
  );
};
