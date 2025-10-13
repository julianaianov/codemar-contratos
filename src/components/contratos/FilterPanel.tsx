'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FiltrosContratos, SelectOption } from '@/types/contratos';
import { SelectFilter } from './SelectFilter';

interface FilterPanelProps {
  filters: FiltrosContratos;
  onFiltersChange: (filters: FiltrosContratos) => void;
  onFilter: () => void;
  loading?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onFilter,
  loading = false
}) => {
  const [orgaoOptions, setOrgaoOptions] = useState<SelectOption[]>([]);
  const [unidadeGestoraOptions, setUnidadeGestoraOptions] = useState<SelectOption[]>([]);
  const [fornecedorOptions, setFornecedorOptions] = useState<SelectOption[]>([]);
  const [contratoOptions, setContratoOptions] = useState<SelectOption[]>([]);
  const [diretoriaOptions] = useState<SelectOption[]>([
    { value: 'TODAS', label: 'Todas' },
    { value: 'OPERAÇÕES', label: 'Operações' },
    { value: 'MERCADO E PARCERIAS', label: 'Mercado e Parcerias' },
    { value: 'OBRAS E PROJETOS', label: 'Obras e Projetos' },
    { value: 'COMUNICAÇÃO', label: 'Comunicação' },
    { value: 'ADMINISTRAÇÃO', label: 'Administração' },
    { value: 'ASSUNTOS IMOBILIÁRIOS', label: 'Assuntos Imobiliários' },
    { value: 'PRESIDÊNCIA', label: 'Presidência' },
    { value: 'JURÍDICO', label: 'Jurídico' },
    { value: 'TECNOLOGIA DA INFORMAÇÃO E INOVAÇÃO', label: 'Tecnologia da Informação e Inovação' },
    { value: 'OUTROS', label: 'Outros' },
  ]);
  const [loadingOptions, setLoadingOptions] = useState({
    orgao: false,
    unidadeGestora: false,
    fornecedor: false,
    contrato: false
  });

  // Carregar opções dos órgãos
  useEffect(() => {
    const loadOrgaos = async () => {
      setLoadingOptions(prev => ({ ...prev, orgao: true }));
      try {
        const response = await fetch('/api/contratos/orgaos');
        const data = await response.json();
        if (data.success) {
          setOrgaoOptions(data.data.map((orgao: any) => ({
            value: orgao.id,
            label: `${orgao.codigo} - ${orgao.nome}`
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar órgãos:', error);
      } finally {
        setLoadingOptions(prev => ({ ...prev, orgao: false }));
      }
    };

    loadOrgaos();
  }, []);

  // Carregar unidades gestoras quando órgão for selecionado
  useEffect(() => {
    if (filters.orgao_id) {
      const loadUnidadesGestoras = async () => {
        setLoadingOptions(prev => ({ ...prev, unidadeGestora: true }));
        try {
          const response = await fetch(`/api/contratos/unidades-gestoras?orgao_id=${filters.orgao_id}`);
          const data = await response.json();
          if (data.success) {
            setUnidadeGestoraOptions(data.data.map((unidade: any) => ({
              value: unidade.id,
              label: `${unidade.codigo} - ${unidade.nome}`
            })));
          }
        } catch (error) {
          console.error('Erro ao carregar unidades gestoras:', error);
        } finally {
          setLoadingOptions(prev => ({ ...prev, unidadeGestora: false }));
        }
      };

      loadUnidadesGestoras();
    } else {
      setUnidadeGestoraOptions([]);
    }
  }, [filters.orgao_id]);

  // Carregar fornecedores
  useEffect(() => {
    const loadFornecedores = async () => {
      setLoadingOptions(prev => ({ ...prev, fornecedor: true }));
      try {
        const response = await fetch('/api/contratos/fornecedores');
        const data = await response.json();
        if (data.success) {
          setFornecedorOptions(data.data.map((fornecedor: any) => ({
            value: fornecedor.id,
            label: `${fornecedor.cnpj} - ${fornecedor.razao_social}`
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
      } finally {
        setLoadingOptions(prev => ({ ...prev, fornecedor: false }));
      }
    };

    loadFornecedores();
  }, []);

  // Carregar contratos
  useEffect(() => {
    const loadContratos = async () => {
      setLoadingOptions(prev => ({ ...prev, contrato: true }));
      try {
        const response = await fetch('/api/contratos/contratos');
        const data = await response.json();
        if (data.success) {
          setContratoOptions(data.data.map((contrato: any) => ({
            value: contrato.id,
            label: contrato.numero
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
      } finally {
        setLoadingOptions(prev => ({ ...prev, contrato: false }));
      }
    };

    loadContratos();
  }, []);


  const handleFilterChange = (field: keyof FiltrosContratos, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      {/* Header do filtro */}
      <div className="flex items-center gap-2 mb-3">
        <MagnifyingGlassIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Filtro</h3>
      </div>

      {/* Campos de filtro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Diretoria
          </label>
          <SelectFilter
            value={filters.diretoria}
            onChange={(value) => handleFilterChange('diretoria', value)}
            options={diretoriaOptions}
            placeholder="Todas"
            clearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Órgão
          </label>
          <SelectFilter
            value={filters.orgao_id}
            onChange={(value) => handleFilterChange('orgao_id', value)}
            options={orgaoOptions}
            placeholder="Selecione"
            loading={loadingOptions.orgao}
            clearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Unidade Gestora
          </label>
          <SelectFilter
            value={filters.unidade_gestora_id}
            onChange={(value) => handleFilterChange('unidade_gestora_id', value)}
            options={unidadeGestoraOptions}
            placeholder="Selecione"
            loading={loadingOptions.unidadeGestora}
            disabled={!filters.orgao_id}
            clearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Fornecedor
          </label>
          <SelectFilter
            value={filters.fornecedor_id}
            onChange={(value) => handleFilterChange('fornecedor_id', value)}
            options={fornecedorOptions}
            placeholder="Selecione"
            loading={loadingOptions.fornecedor}
            clearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Contrato
          </label>
          <SelectFilter
            value={filters.contrato_id}
            onChange={(value) => handleFilterChange('contrato_id', value)}
            options={contratoOptions}
            placeholder="Selecione"
            loading={loadingOptions.contrato}
            clearable
          />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={onFilter}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          Filtrar
        </button>
        
        <button
          onClick={clearFilters}
          className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          <XMarkIcon className="w-4 h-4" />
          Limpar
        </button>
      </div>
    </div>
  );
};
