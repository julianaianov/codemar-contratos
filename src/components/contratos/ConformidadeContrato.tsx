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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ATENCAO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INCONFORME':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecomendacaoColor = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'ATENCAO':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'INFO':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro</h3>
          <p className="text-gray-600">{error || 'Dados não encontrados'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Análise de Conformidade - {data.contrato.numero}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{data.contrato.objeto}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Informações do Contrato</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium">{data.contrato.tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Modalidade:</span>
              <span className="font-medium">{data.contrato.modalidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diretoria:</span>
              <span className="font-medium">{data.contrato.diretoria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{data.contrato.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Classificação Legal</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Categoria:</span>
              <span className="font-medium">{data.classificacao.descricao}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Limite Legal:</span>
              <span className="font-medium">{data.classificacao.limite_legal}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base Legal:</span>
              <span className="font-medium">{data.classificacao.base_legal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Valores e Percentuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">
            R$ {data.contrato.valor_original.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-blue-600">Valor Original</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            R$ {data.conformidade.valor_aditivo_total.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-green-600">Valor Aditivos</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <CurrencyDollarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {data.conformidade.percentual_aditivo.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-600">Percentual Aditivo</div>
        </div>
      </div>

      {/* Recomendações */}
      {data.recomendacoes.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recomendações</h4>
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
          <h4 className="font-medium text-gray-900 mb-3">Histórico de Conformidade</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Termo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">% Acumulado</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.historico_conformidade.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.termo}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.tipo}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.percentual_acumulado.toFixed(1)}%</td>
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
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{data.estatisticas.quantidade_aditivos}</div>
          <div className="text-sm text-gray-600">Aditivos</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{data.estatisticas.quantidade_apostilamentos}</div>
          <div className="text-sm text-gray-600">Apostilamentos</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{data.estatisticas.quantidade_rescisoes}</div>
          <div className="text-sm text-gray-600">Rescisões</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{data.termos.total}</div>
          <div className="text-sm text-gray-600">Total Termos</div>
        </div>
      </div>
    </div>
  );
};
