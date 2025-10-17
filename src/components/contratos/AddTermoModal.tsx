'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TermoTipo, CriarTermoRequest, getClassificacaoContrato, isAditivoDentroLimite } from '@/types/contract-terms';
import { ContratoImportado } from '@/types/contratos';

interface AddTermoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: ContratoImportado;
  onSuccess: () => void;
}

export const AddTermoModal: React.FC<AddTermoModalProps> = ({
  isOpen,
  onClose,
  contrato,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CriarTermoRequest>({
    contrato_id: contrato.id.toString(),
    tipo: 'aditivo',
    valor_aditivo: 0,
    descricao: '',
    justificativa: '',
    data_vigencia: '',
    data_execucao: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aditivoWarning, setAditivoWarning] = useState<string>('');

  const tiposTermo: { value: TermoTipo; label: string }[] = [
    { value: 'aditivo', label: 'Aditivo' },
    { value: 'apostilamento', label: 'Apostilamento' },
    { value: 'reconhecimento_divida', label: 'Reconhecimento de Dívida' },
    { value: 'rescisao', label: 'Rescisão' }
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        contrato_id: contrato.id.toString(),
        tipo: 'aditivo',
        valor_aditivo: 0,
        descricao: '',
        justificativa: '',
        data_vigencia: '',
        data_execucao: '',
        observacoes: ''
      });
      setErrors({});
      setAditivoWarning('');
    }
  }, [isOpen, contrato.id]);

  const handleInputChange = (field: keyof CriarTermoRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Verificar limite de aditivo
    if (field === 'valor_aditivo' && formData.tipo === 'aditivo') {
      const valorOriginal = contrato.valor_contrato || 0;
      const valorAditivo = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
      
      if (valorAditivo > 0 && valorOriginal > 0) {
        // Classificar contrato conforme Lei 14.133/2021
        const classificacao = getClassificacaoContrato(
          contrato.tipo_contrato || '', 
          contrato.objeto || ''
        );
        
        const limite = classificacao.limite;
        const percentual = (valorAditivo / valorOriginal) * 100;
        
        if (percentual > limite) {
          setAditivoWarning(
            `⚠️ Aditivo acima do limite legal (${limite}%) para ${classificacao.descricao}. ` +
            `Valor máximo: R$ ${(valorOriginal * limite / 100).toLocaleString('pt-BR')}`
          );
        } else if (percentual > limite * 0.8) {
          setAditivoWarning(
            `⚠️ Aditivo próximo do limite legal (${limite}%) para ${classificacao.descricao}. ` +
            `Valor máximo: R$ ${(valorOriginal * limite / 100).toLocaleString('pt-BR')}`
          );
        } else {
          setAditivoWarning('');
        }
      } else {
        setAditivoWarning('');
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.justificativa.trim()) {
      newErrors.justificativa = 'Justificativa é obrigatória';
    }

    if (!formData.data_vigencia) {
      newErrors.data_vigencia = 'Data de vigência é obrigatória';
    }

    if (formData.tipo === 'aditivo' && (!formData.valor_aditivo || formData.valor_aditivo <= 0)) {
      newErrors.valor_aditivo = 'Valor do aditivo é obrigatório';
    }

    // Verificar limite de aditivo
    if (formData.tipo === 'aditivo' && formData.valor_aditivo && contrato.valor_contrato) {
      const classificacao = getClassificacaoContrato(
        contrato.tipo_contrato || '', 
        contrato.objeto || ''
      );
      
      if (!isAditivoDentroLimite(
        contrato.valor_contrato, 
        formData.valor_aditivo, 
        contrato.tipo_contrato || '',
        contrato.objeto
      )) {
        newErrors.valor_aditivo = `Aditivo acima do limite legal (${classificacao.limite}%) para ${classificacao.descricao}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/contratos/termos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: data.error || 'Erro ao criar termo' });
      }
    } catch (error) {
      console.error('Erro ao criar termo:', error);
      setErrors({ submit: 'Erro ao criar termo' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Adicionar Termo - {contrato.numero_contrato}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo do Termo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo do Termo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as TermoTipo)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposTermo.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Valor do Aditivo (apenas para aditivos) */}
          {formData.tipo === 'aditivo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Aditivo (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_aditivo || ''}
                onChange={(e) => handleInputChange('valor_aditivo', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.valor_aditivo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0,00"
              />
              {errors.valor_aditivo && (
                <p className="mt-1 text-sm text-red-600">{errors.valor_aditivo}</p>
              )}
              {aditivoWarning && (
                <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{aditivoWarning}</span>
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Valor original: R$ {(contrato.valor_contrato || 0).toLocaleString('pt-BR')}
                <br />
                Classificação: {getClassificacaoContrato(contrato.tipo_contrato || '', contrato.objeto).descricao}
                <br />
                Limite legal: {getClassificacaoContrato(contrato.tipo_contrato || '', contrato.objeto).limite}%
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.descricao ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Descreva o termo contratual..."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
            )}
          </div>

          {/* Justificativa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificativa *
            </label>
            <textarea
              value={formData.justificativa}
              onChange={(e) => handleInputChange('justificativa', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.justificativa ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Justifique a necessidade deste termo..."
            />
            {errors.justificativa && (
              <p className="mt-1 text-sm text-red-600">{errors.justificativa}</p>
            )}
          </div>

          {/* Data de Vigência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Vigência *
            </label>
            <input
              type="date"
              value={formData.data_vigencia}
              onChange={(e) => handleInputChange('data_vigencia', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.data_vigencia ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.data_vigencia && (
              <p className="mt-1 text-sm text-red-600">{errors.data_vigencia}</p>
            )}
          </div>

          {/* Data de Execução */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Execução
            </label>
            <input
              type="date"
              value={formData.data_execucao || ''}
              onChange={(e) => handleInputChange('data_execucao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Termo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
