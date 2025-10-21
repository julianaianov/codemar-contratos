'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface ConformidadeContratoProps {
  contratoId: string;
  onClose?: () => void;
}

interface ConformidadeData {
  contrato: {
    id: string;
    numero: string;
    objeto: string;
    valor_original: number;
    valor_atual: number;
    tipo: string;
    modalidade: string;
    categoria: string;
    diretoria: string;
    status: string;
  };
  classificacao: {
    categoria: string;
    limite_legal: number;
    descricao: string;
    base_legal: string;
  };
  conformidade: {
    percentual_aditivo: number;
    valor_aditivo_total: number;
    dentro_limite_legal: boolean;
    percentual_restante: number;
    valor_restante: number;
    status: 'CONFORME' | 'ATENCAO' | 'INCONFORME';
    margem_seguranca: number;
  };
  termos: {
    total: number;
    analise: Array<{
      id: string;
      tipo: string;
      numero: string;
      data_criacao: string;
      valor_aditivo: number;
      percentual_aditivo: number;
      descricao: string;
      justificativa: string;
      status: string;
    }>;
  };
  recomendacoes: Array<{
    tipo: 'CRITICO' | 'ATENCAO' | 'INFO';
    titulo: string;
    descricao: string;
    acao: string;
  }>;
  historico_conformidade: Array<{
    data: string;
    termo: string;
    tipo: string;
    percentual_acumulado: number;
    status: 'CONFORME' | 'ATENCAO' | 'INCONFORME';
  }>;
  estatisticas: {
    quantidade_aditivos: number;
    quantidade_apostilamentos: number;
    quantidade_rescisoes: number;
    ultimo_termo: string | null;
  };
}

export const ConformidadeContrato: React.FC<ConformidadeContratoProps> = ({
  contratoId,
  onClose
}) => {
  const [data, setData] = useState<ConformidadeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarConformidade();
  }, [contratoId]);

  const carregarConformidade = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contratos/${contratoId}/conformidade`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erro ao carregar conformidade');
      }
    } catch (err) {
      setError('Erro ao carregar conformidade');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFORME':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'ATENCAO':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'INCONFORME':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFORME':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'ATENCAO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'INCONFORME':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getRecomendacaoColor = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'ATENCAO':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'INFO':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Erro</h3>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Dados não encontrados'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Análise de Conformidade - {data.contrato.numero}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.contrato.objeto}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Status de Conformidade */}
      <div className={`border rounded-lg p-4 ${getStatusColor(data.conformidade.status)}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(data.conformidade.status)}
          <div>
            <h3 className="font-semibold">
              Status: {data.conformidade.status}
            </h3>
            <p className="text-sm">
              {data.conformidade.dentro_limite_legal 
                ? 'Contrato dentro dos limites legais' 
                : 'Contrato fora dos limites legais'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Informações do Contrato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Informações do Contrato</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.contrato.tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Modalidade:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.contrato.modalidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Diretoria:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.contrato.diretoria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.contrato.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Classificação Legal</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Categoria:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.classificacao.descricao}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Limite Legal:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.classificacao.limite_legal}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Base Legal:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.classificacao.base_legal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Valores e Percentuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            R$ {data.contrato.valor_original.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Valor Original</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            R$ {data.conformidade.valor_aditivo_total.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Valor Aditivos</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.conformidade.percentual_aditivo.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Percentual Aditivo</div>
        </div>
      </div>

      {/* Recomendações */}
      {data.recomendacoes.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recomendações</h4>
          <div className="space-y-3">
            {data.recomendacoes.map((recomendacao, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getRecomendacaoColor(recomendacao.tipo)}`}>
                <h5 className="font-medium mb-2">{recomendacao.titulo}</h5>
                <p className="text-sm mb-2">{recomendacao.descricao}</p>
                <p className="text-sm font-medium">Ação: {recomendacao.acao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Conformidade */}
      {data.historico_conformidade.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Histórico de Conformidade</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Termo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">% Acumulado</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.historico_conformidade.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.termo}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.tipo}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.percentual_acumulado.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.estatisticas.quantidade_aditivos}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Aditivos</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.estatisticas.quantidade_apostilamentos}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Apostilamentos</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.estatisticas.quantidade_rescisoes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rescisões</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.termos.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Termos</div>
        </div>
      </div>
    </div>
  );
};
