import React, { useState } from 'react';
import { ContratoImportado } from '@/types/contratos';
import { ContratoCard } from './ContratoCard';
import { SelectFilter } from './SelectFilter';

interface ContratosListProps {
  contratos: ContratoImportado[];
  loading?: boolean;
  onContratoClick?: (contrato: ContratoImportado) => void;
}

export const ContratosList: React.FC<ContratosListProps> = ({
  contratos,
  loading = false,
  onContratoClick,
}) => {
  const [filtros, setFiltros] = useState({
    ano: '',
    diretoria: '',
    modalidade: '',
    status: '',
  });

  // Extrai opções únicas para os filtros (sem depender de spread + Set)
  const anos = contratos.reduce<number[]>((acc, c) => {
    const v = c.ano as number | undefined;
    if (typeof v === 'number' && !acc.includes(v)) acc.push(v);
    return acc;
  }, []).sort((a, b) => b - a);

  const diretorias = contratos.reduce<string[]>((acc, c) => {
    const v = (c.diretoria || c.secretaria) as string | undefined;
    if (v && !acc.includes(v)) acc.push(v);
    return acc;
  }, []).sort();

  const modalidades = contratos.reduce<string[]>((acc, c) => {
    const v = c.modalidade as string | undefined;
    if (v && !acc.includes(v)) acc.push(v);
    return acc;
  }, []).sort();

  const status = contratos.reduce<string[]>((acc, c) => {
    const v = c.status as string | undefined;
    if (v && !acc.includes(v)) acc.push(v);
    return acc;
  }, []).sort();

  // Filtra contratos baseado nos filtros selecionados
  const contratosFiltrados = contratos.filter(contrato => {
    if (filtros.ano && contrato.ano?.toString() !== filtros.ano) return false;
    if (filtros.diretoria && (contrato.diretoria || contrato.secretaria) !== filtros.diretoria) return false;
    if (filtros.modalidade && contrato.modalidade !== filtros.modalidade) return false;
    if (filtros.status && contrato.status !== filtros.status) return false;
    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFiltros({
      ano: '',
      diretoria: '',
      modalidade: '',
      status: '',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <SelectFilter
              value={filtros.ano}
              onChange={(value) => handleFilterChange('ano', value as string)}
              options={[
                { value: '', label: 'Todos os anos' },
                ...anos.map(ano => ({ value: ano.toString(), label: ano.toString() }))
              ]}
              placeholder="Filtrar por ano"
            />
          </div>

          <div className="flex-1 min-w-48">
            <SelectFilter
              value={filtros.diretoria}
              onChange={(value) => handleFilterChange('diretoria', value as string)}
              options={[
                { value: '', label: 'Todas as diretorias' },
                ...diretorias.map(diretoria => ({ value: diretoria, label: diretoria }))
              ]}
              placeholder="Filtrar por diretoria"
            />
          </div>

          <div className="flex-1 min-w-48">
            <SelectFilter
              value={filtros.modalidade}
              onChange={(value) => handleFilterChange('modalidade', value as string)}
              options={[
                { value: '', label: 'Todas as modalidades' },
                ...modalidades.map(modalidade => ({ value: modalidade, label: modalidade }))
              ]}
              placeholder="Filtrar por modalidade"
            />
          </div>

          <div className="flex-1 min-w-48">
            <SelectFilter
              value={filtros.status}
              onChange={(value) => handleFilterChange('status', value as string)}
              options={[
                { value: '', label: 'Todos os status' },
                ...status.map(status => ({ value: status, label: status }))
              ]}
              placeholder="Filtrar por status"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {contratosFiltrados.length} de {contratos.length} contratos
        </div>
      </div>

      {/* Lista de contratos */}
      {contratosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum contrato encontrado
          </h3>
          <p className="text-gray-600">
            {contratos.length === 0 
              ? 'Não há contratos importados ainda.'
              : 'Tente ajustar os filtros para encontrar contratos.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contratosFiltrados.map((contrato) => (
            <ContratoCard
              key={contrato.id}
              contrato={contrato}
              onClick={() => onContratoClick?.(contrato)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContratosList;




