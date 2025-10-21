'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { InstrumentoTipo, CriarInstrumentoRequest } from '@/types/contract-terms';
import { ContratoImportado } from '@/types/contratos';

interface AddInstrumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: ContratoImportado;
  onSuccess: () => void;
}

export const AddInstrumentoModal: React.FC<AddInstrumentoModalProps> = ({
  isOpen,
  onClose,
  contrato,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CriarInstrumentoRequest>({
    contrato_id: contrato.id.toString(),
    tipo: 'convenio',
    valor: 0,
    descricao: '',
    data_inicio: '',
    data_fim: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tiposInstrumento: { value: InstrumentoTipo; label: string }[] = [
    { value: 'colaboracao', label: 'Colaboração' },
    { value: 'comodato', label: 'Comodato' },
    { value: 'concessao', label: 'Concessão' },
    { value: 'convenio', label: 'Convênio' },
    { value: 'cooperacao', label: 'Cooperação' },
    { value: 'fomento', label: 'Fomento' },
    { value: 'parceria', label: 'Parceria' },
    { value: 'patrocinio', label: 'Patrocínio' },
    { value: 'protocolo_intencoes', label: 'Protocolo de Intenções' },
    { value: 'cessao', label: 'Cessão' },
    { value: 'reconhecimento_divida', label: 'Reconhecimento de Dívida' }
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        contrato_id: contrato.id.toString(),
        tipo: 'convenio',
        valor: 0,
        descricao: '',
        data_inicio: '',
        data_fim: '',
        observacoes: ''
      });
      setErrors({});
    }
  }, [isOpen, contrato.id]);

  const handleInputChange = (field: keyof CriarInstrumentoRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória';
    }

    if (!formData.data_fim) {
      newErrors.data_fim = 'Data de fim é obrigatória';
    }

    if (formData.data_inicio && formData.data_fim && formData.data_inicio > formData.data_fim) {
      newErrors.data_fim = 'Data de fim deve ser posterior à data de início';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor é obrigatório e deve ser maior que zero';
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
      const response = await fetch('/api/contratos/instrumentos', {
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
        setErrors({ submit: data.error || 'Erro ao criar instrumento' });
      }
    } catch (error) {
      console.error('Erro ao criar instrumento:', error);
      setErrors({ submit: 'Erro ao criar instrumento' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Adicionar Instrumento - {contrato.numero_contrato}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo do Instrumento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo do Instrumento *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as InstrumentoTipo)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              {tiposInstrumento.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor || ''}
              onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                errors.valor ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="0,00"
            />
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valor}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                errors.descricao ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              rows={3}
              placeholder="Descreva o instrumento contratual..."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descricao}</p>
            )}
          </div>

          {/* Data de Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Início *
            </label>
            <input
              type="date"
              value={formData.data_inicio}
              onChange={(e) => handleInputChange('data_inicio', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                errors.data_inicio ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.data_inicio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.data_inicio}</p>
            )}
          </div>

          {/* Data de Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Fim *
            </label>
            <input
              type="date"
              value={formData.data_fim}
              onChange={(e) => handleInputChange('data_fim', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                errors.data_fim ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.data_fim && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.data_fim}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              rows={2}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Instrumento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
