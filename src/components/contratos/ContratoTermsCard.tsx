'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { TermoContratual, InstrumentoContratual, TermoTipo, InstrumentoTipo, TermoStatus, getClassificacaoContrato } from '@/types/contract-terms';
import { ContratoImportado } from '@/types/contratos';

interface ContratoTermsCardProps {
  contrato: ContratoImportado;
  onAddTermo?: (contratoId: string) => void;
  onAddInstrumento?: (contratoId: string) => void;
  onViewDetails?: (contratoId: string) => void;
}

export const ContratoTermsCard: React.FC<ContratoTermsCardProps> = ({
  contrato,
  onAddTermo,
  onAddInstrumento,
  onViewDetails
}) => {
  const [termos, setTermos] = useState<TermoContratual[]>([]);
  const [instrumentos, setInstrumentos] = useState<InstrumentoContratual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTermosEInstrumentos();
  }, [contrato.id]);

  const carregarTermosEInstrumentos = async () => {
    try {
      setLoading(true);
      
      // Carregar termos
      const termosResponse = await fetch(`/api/contratos/termos?contrato_id=${contrato.id}`);
      const termosData = await termosResponse.json();
      
      if (termosData.success) {
        setTermos(termosData.data);
      }

      // Carregar instrumentos
      const instrumentosResponse = await fetch(`/api/contratos/instrumentos?contrato_id=${contrato.id}`);
      const instrumentosData = await instrumentosResponse.json();
      
      if (instrumentosData.success) {
        setInstrumentos(instrumentosData.data);
      }

    } catch (error) {
      console.error('Erro ao carregar termos e instrumentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: TermoStatus) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'rejeitado':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'em_analise':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TermoStatus) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'em_analise':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTipoTermo = (tipo: TermoTipo) => {
    const tipos = {
      'apostilamento': 'Apostilamento',
      'aditivo': 'Aditivo',
      'reconhecimento_divida': 'Reconhecimento de Dívida',
      'rescisao': 'Rescisão'
    };
    return tipos[tipo] || tipo;
  };

  const formatTipoInstrumento = (tipo: InstrumentoTipo) => {
    const tipos = {
      'colaboracao': 'Colaboração',
      'comodato': 'Comodato',
      'concessao': 'Concessão',
      'convenio': 'Convênio',
      'cooperacao': 'Cooperação',
      'fomento': 'Fomento',
      'parceria': 'Parceria',
      'patrocinio': 'Patrocínio',
      'protocolo_intencoes': 'Protocolo de Intenções',
      'cessao': 'Cessão',
      'reconhecimento_divida': 'Reconhecimento de Dívida'
    };
    return tipos[tipo] || tipo;
  };

  const getAditivoStatus = () => {
    const percentual = contrato.percentual_aditivo_total || 0;
    
    // Classificar contrato conforme Lei 14.133/2021
    const classificacao = getClassificacaoContrato(
      contrato.tipo_contrato || '', 
      contrato.objeto || ''
    );
    
    const limite = classificacao.limite;
    
    if (percentual > limite) {
      return {
        status: 'danger',
        message: `Aditivo acima do limite legal (${limite}%) - ${classificacao.descricao}`,
        color: 'text-red-600',
        classificacao: classificacao.descricao
      };
    } else if (percentual > limite * 0.8) {
      return {
        status: 'warning',
        message: `Aditivo próximo do limite legal (${limite}%) - ${classificacao.descricao}`,
        color: 'text-yellow-600',
        classificacao: classificacao.descricao
      };
    } else {
      return {
        status: 'ok',
        message: `Aditivo dentro do limite legal (${limite}%) - ${classificacao.descricao}`,
        color: 'text-green-600',
        classificacao: classificacao.descricao
      };
    }
  };

  const aditivoStatus = getAditivoStatus();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* Header com informações do contrato */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{contrato.numero_contrato}</h3>
          <p className="text-sm text-gray-600 truncate max-w-xs">{contrato.objeto}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            R$ {(contrato.valor_atual || contrato.valor_contrato || 0).toLocaleString('pt-BR')}
          </div>
          {contrato.percentual_aditivo_total && contrato.percentual_aditivo_total > 0 && (
            <div className={`text-xs ${aditivoStatus.color}`}>
              +{contrato.percentual_aditivo_total.toFixed(1)}% aditivo
            </div>
          )}
        </div>
      </div>

      {/* Classificação do contrato */}
      <div className="text-xs text-gray-500">
        <span className="font-medium">Classificação:</span> {aditivoStatus.classificacao}
      </div>

      {/* Status do aditivo */}
      {contrato.percentual_aditivo_total && contrato.percentual_aditivo_total > 0 && (
        <div className={`flex items-center gap-2 text-xs ${aditivoStatus.color}`}>
          {aditivoStatus.status === 'danger' && <ExclamationTriangleIcon className="w-4 h-4" />}
          <span>{aditivoStatus.message}</span>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded p-2">
          <div className="text-lg font-semibold text-blue-600">
            {contrato.quantidade_aditivos || 0}
          </div>
          <div className="text-xs text-blue-600">Aditivos</div>
        </div>
        <div className="bg-green-50 rounded p-2">
          <div className="text-lg font-semibold text-green-600">
            {contrato.quantidade_apostilamentos || 0}
          </div>
          <div className="text-xs text-green-600">Apostilamentos</div>
        </div>
        <div className="bg-red-50 rounded p-2">
          <div className="text-lg font-semibold text-red-600">
            {contrato.quantidade_rescisoes || 0}
          </div>
          <div className="text-xs text-red-600">Rescisões</div>
        </div>
      </div>

      {/* Termos recentes */}
      {termos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Termos Recentes</h4>
          <div className="space-y-2">
            {termos.slice(0, 3).map((termo) => (
              <div key={termo.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getStatusIcon(termo.status)}
                  <span className="font-medium">{formatTipoTermo(termo.tipo)}</span>
                  <span className="text-gray-500">#{termo.numero}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(termo.status)}`}>
                  {termo.status}
                </span>
              </div>
            ))}
            {termos.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{termos.length - 3} outros termos
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instrumentos recentes */}
      {instrumentos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Instrumentos</h4>
          <div className="space-y-2">
            {instrumentos.slice(0, 2).map((instrumento) => (
              <div key={instrumento.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{formatTipoInstrumento(instrumento.tipo)}</span>
                  <span className="text-gray-500">#{instrumento.numero}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(instrumento.status)}`}>
                  {instrumento.status}
                </span>
              </div>
            ))}
            {instrumentos.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{instrumentos.length - 2} outros instrumentos
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-2 pt-2 border-t">
        <button
          onClick={() => onAddTermo?.(contrato.id.toString())}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Termo
        </button>
        <button
          onClick={() => onAddInstrumento?.(contrato.id.toString())}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Instrumento
        </button>
        <button
          onClick={() => onViewDetails?.(contrato.id.toString())}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-md text-xs hover:bg-gray-700 transition-colors"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Detalhes
        </button>
      </div>
    </div>
  );
};
