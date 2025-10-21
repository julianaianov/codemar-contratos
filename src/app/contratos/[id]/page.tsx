'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ContratoImportado } from '@/types/contratos';
import { ContratoTermsCard } from '@/components/contratos/ContratoTermsCard';
import { AddTermoModal } from '@/components/contratos/AddTermoModal';
import { AddInstrumentoModal } from '@/components/contratos/AddInstrumentoModal';
import { ConformidadeContrato } from '@/components/contratos/ConformidadeContrato';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function ContratoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const contratoId = params.id as string;
  
  const [contrato, setContrato] = useState<ContratoImportado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'detalhes' | 'termos' | 'conformidade'>('detalhes');
  const [showAddTermoModal, setShowAddTermoModal] = useState(false);
  const [showAddInstrumentoModal, setShowAddInstrumentoModal] = useState(false);

  useEffect(() => {
    if (contratoId) {
      carregarContrato();
    }
  }, [contratoId]);

  const carregarContrato = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contratos/contratos?id=${contratoId}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        setContrato(result.data[0]);
      } else {
        setError('Contrato não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar contrato');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'executado':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pendente':
      case 'em andamento':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'cancelado':
      case 'suspenso':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'executado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
      case 'em andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
      case 'suspenso':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error || 'Contrato não encontrado'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {contrato.numero_contrato}
                </h1>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  {contrato.objeto}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contrato.status)}`}>
                {getStatusIcon(contrato.status)}
                {contrato.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'detalhes', label: 'Detalhes', icon: DocumentTextIcon },
              { id: 'termos', label: 'Termos & Instrumentos', icon: DocumentTextIcon },
              { id: 'conformidade', label: 'Conformidade', icon: ExclamationTriangleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'detalhes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número</label>
                    <p className="text-sm text-gray-900">{contrato.numero_contrato}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ano</label>
                    <p className="text-sm text-gray-900">{contrato.ano}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo</label>
                    <p className="text-sm text-gray-900">{contrato.tipo_contrato}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Modalidade</label>
                    <p className="text-sm text-gray-900">{contrato.modalidade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Diretoria</label>
                    <p className="text-sm text-gray-900">{contrato.diretoria || contrato.secretaria}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm text-gray-900">{contrato.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Original</label>
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {contrato.valor_contrato?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Atual</label>
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {contrato.valor_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">% Aditivo</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {contrato.percentual_aditivo_total?.toFixed(1) || '0,0'}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Aditivos</label>
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {contrato.valor_aditivo_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datas */}
            <Card>
              <CardHeader>
                <CardTitle>Datas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Início</label>
                    <p className="text-sm text-gray-900">
                      {contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Fim</label>
                    <p className="text-sm text-gray-900">
                      {contrato.data_fim ? new Date(contrato.data_fim).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Vigência</label>
                    <p className="text-sm text-gray-900">
                      {contrato.data_vigencia ? new Date(contrato.data_vigencia).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Execução</label>
                    <p className="text-sm text-gray-900">
                      {contrato.data_execucao ? new Date(contrato.data_execucao).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fornecedor */}
            <Card>
              <CardHeader>
                <CardTitle>Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-sm text-gray-900">{contrato.contratado || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'termos' && contrato && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Termos e Instrumentos</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddTermoModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Adicionar Termo
                </button>
                <button
                  onClick={() => setShowAddInstrumentoModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Adicionar Instrumento
                </button>
              </div>
            </div>
            
            <ContratoTermsCard contrato={contrato} />
          </div>
        )}

        {activeTab === 'conformidade' && contrato && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Análise de Conformidade</h2>
            <ConformidadeContrato contratoId={String(contrato.id)} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddTermoModal && contrato && (
        <AddTermoModal
          isOpen={showAddTermoModal}
          contrato={contrato}
          onClose={() => setShowAddTermoModal(false)}
          onSuccess={() => {
            setShowAddTermoModal(false);
            carregarContrato();
          }}
        />
      )}

      {showAddInstrumentoModal && contrato && (
        <AddInstrumentoModal
          isOpen={showAddInstrumentoModal}
          contrato={contrato}
          onClose={() => setShowAddInstrumentoModal(false)}
          onSuccess={() => {
            setShowAddInstrumentoModal(false);
            carregarContrato();
          }}
        />
      )}
    </div>
  );
}
