'use client';

import React, { useState } from 'react';
import { 
  ClipboardDocumentListIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  Squares2X2Icon,
  TableCellsIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Contrato {
  id: number;
  numero_contrato: string;
  objeto: string;
  contratante: string;
  contratado: string;
  cnpj_contratado: string | null;
  valor: number;
  data_inicio: string;
  data_fim: string;
  modalidade: string | null;
  status: string;
  tipo_contrato: string | null;
  secretaria: string | null;
  fonte_recurso: string | null;
  observacoes: string | null;
  created_at: string;
}

export default function ContratosPage() {
  const [showForm, setShowForm] = useState(false);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    numero_contrato: '',
    objeto: '',
    contratante: '',
    contratado: '',
    cnpj_contratado: '',
    valor: '',
    data_inicio: '',
    data_fim: '',
    modalidade: '',
    status: 'vigente',
    tipo_contrato: '',
    secretaria: '',
    fonte_recurso: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      numero_contrato: '',
      objeto: '',
      contratante: '',
      contratado: '',
      cnpj_contratado: '',
      valor: '',
      data_inicio: '',
      data_fim: '',
      modalidade: '',
      status: 'vigente',
      tipo_contrato: '',
      secretaria: '',
      fonte_recurso: '',
      observacoes: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = selectedContrato 
        ? `http://localhost:8000/api/contratos/${selectedContrato.id}`
        : 'http://localhost:8000/api/contratos';
      
      const method = selectedContrato ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        throw new Error(data.message || 'Erro ao salvar contrato');
      }

      alert(selectedContrato ? 'Contrato atualizado com sucesso!' : 'Contrato cadastrado com sucesso!');
      setShowForm(false);
      setShowEditModal(false);
      setSelectedContrato(null);
      resetForm();
      loadContratos();
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao salvar contrato');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContrato) return;

    try {
      const response = await fetch(`http://localhost:8000/api/contratos/${selectedContrato.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao excluir contrato');
      }

      alert('Contrato excluído com sucesso!');
      setShowDeleteModal(false);
      setSelectedContrato(null);
      loadContratos();
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao excluir contrato');
    }
  };

  const handleEdit = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setFormData({
      numero_contrato: contrato.numero_contrato,
      objeto: contrato.objeto,
      contratante: contrato.contratante,
      contratado: contrato.contratado,
      cnpj_contratado: contrato.cnpj_contratado || '',
      valor: contrato.valor.toString(),
      data_inicio: contrato.data_inicio.split('T')[0],
      data_fim: contrato.data_fim.split('T')[0],
      modalidade: contrato.modalidade || '',
      status: contrato.status,
      tipo_contrato: contrato.tipo_contrato || '',
      secretaria: contrato.secretaria || '',
      fonte_recurso: contrato.fonte_recurso || '',
      observacoes: contrato.observacoes || '',
    });
    setShowEditModal(true);
  };

  const loadContratos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/contratos');
      const data = await response.json();
      setContratos(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    }
  };

  React.useEffect(() => {
    loadContratos();
  }, []);

  const filteredContratos = contratos.filter(contrato =>
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.contratado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vigente':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'encerrado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rescindido':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'vigente':
        return 'border-l-green-500';
      case 'encerrado':
        return 'border-l-gray-500';
      case 'suspenso':
        return 'border-l-yellow-500';
      case 'rescindido':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const FormModal = ({ isEdit }: { isEdit: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Contrato' : 'Novo Contrato'}
          </h2>
          <button
            onClick={() => {
              if (isEdit) {
                setShowEditModal(false);
              } else {
                setShowForm(false);
              }
              setSelectedContrato(null);
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Linha 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número do Contrato *
              </label>
              <input
                type="text"
                name="numero_contrato"
                value={formData.numero_contrato}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {errors.numero_contrato && (
                <p className="text-red-500 text-xs mt-1">{errors.numero_contrato[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="vigente">Vigente</option>
                <option value="encerrado">Encerrado</option>
                <option value="suspenso">Suspenso</option>
                <option value="rescindido">Rescindido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {errors.valor && (
                <p className="text-red-500 text-xs mt-1">{errors.valor[0]}</p>
              )}
            </div>
          </div>

          {/* Linha 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objeto do Contrato *
            </label>
            <textarea
              name="objeto"
              value={formData.objeto}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {errors.objeto && (
              <p className="text-red-500 text-xs mt-1">{errors.objeto[0]}</p>
            )}
          </div>

          {/* Linha 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contratante *
              </label>
              <input
                type="text"
                name="contratante"
                value={formData.contratante}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contratado *
              </label>
              <input
                type="text"
                name="contratado"
                value={formData.contratado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Linha 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CNPJ do Contratado
              </label>
              <input
                type="text"
                name="cnpj_contratado"
                value={formData.cnpj_contratado}
                onChange={handleInputChange}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Término *
              </label>
              <input
                type="date"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Linha 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modalidade
              </label>
              <input
                type="text"
                name="modalidade"
                value={formData.modalidade}
                onChange={handleInputChange}
                placeholder="Ex: Pregão Eletrônico"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Contrato
              </label>
              <input
                type="text"
                name="tipo_contrato"
                value={formData.tipo_contrato}
                onChange={handleInputChange}
                placeholder="Ex: Serviços"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diretoria *
              </label>
              <select
                name="secretaria"
                value={formData.secretaria}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Selecione uma diretoria</option>
                <option value="Presidência">Presidência</option>
                <option value="Diretoria de Administração">Diretoria de Administração</option>
                <option value="Diretoria Jurídica">Diretoria Jurídica</option>
                <option value="Diretoria de Assuntos Imobiliários">Diretoria de Assuntos Imobiliários</option>
                <option value="Diretoria de Operações">Diretoria de Operações</option>
                <option value="Diretoria de Tecnologia da Informação e Inovação">Diretoria de Tecnologia da Informação e Inovação</option>
                <option value="Diretoria de Governança em Licitações e Contratações">Diretoria de Governança em Licitações e Contratações</option>
              </select>
              {errors.secretaria && (
                <p className="text-red-500 text-xs mt-1">{errors.secretaria[0]}</p>
              )}
            </div>
          </div>

          {/* Linha 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fonte de Recurso
              </label>
              <input
                type="text"
                name="fonte_recurso"
                value={formData.fonte_recurso}
                onChange={handleInputChange}
                placeholder="Ex: Recursos Próprios"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Salvando...' : (isEdit ? 'Atualizar Contrato' : 'Salvar Contrato')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false);
                } else {
                  setShowForm(false);
                }
                setSelectedContrato(null);
                resetForm();
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
            Gestão de Contratos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cadastre e gerencie contratos administrativos
          </p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setSelectedContrato(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Contrato
        </button>
      </div>

      {/* Busca e Toggle de Visualização */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número, objeto ou contratado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <TableCellsIcon className="h-5 w-5" />
            Tabela
          </button>
        </div>
      </div>

      {/* Visualização em Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContratos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Nenhum contrato encontrado' : 'Nenhum contrato cadastrado ainda'}
              </p>
            </div>
          ) : (
            filteredContratos.map((contrato) => (
              <div
                key={contrato.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${getStatusBorderColor(contrato.status)} group`}
              >
                {/* Header do Card */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {contrato.numero_contrato}
                      </h3>
                      <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contrato.status)}`}>
                        {contrato.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                    {contrato.objeto}
                  </p>
                </div>

                {/* Corpo do Card */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{contrato.contratante}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{contrato.contratado}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(parseFloat(contrato.valor.toString()))}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatDate(contrato.data_inicio)} até {formatDate(contrato.data_fim)}
                    </span>
                  </div>
                </div>

                {/* Footer do Card com Ações */}
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedContrato(contrato);
                      setShowViewModal(true);
                    }}
                    title="Visualizar"
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(contrato)}
                    title="Editar"
                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContrato(contrato);
                      setShowDeleteModal(true);
                    }}
                    title="Excluir"
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Visualização em Tabela */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Objeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contratado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vigência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContratos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Nenhum contrato encontrado' : 'Nenhum contrato cadastrado ainda'}
                    </td>
                  </tr>
                ) : (
                  filteredContratos.map((contrato) => (
                    <tr key={contrato.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {contrato.numero_contrato}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {contrato.objeto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {contrato.contratado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(parseFloat(contrato.valor.toString()))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(contrato.data_inicio)} até {formatDate(contrato.data_fim)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contrato.status)}`}>
                          {contrato.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedContrato(contrato);
                              setShowViewModal(true);
                            }}
                            title="Visualizar"
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(contrato)}
                            title="Editar"
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedContrato(contrato);
                              setShowDeleteModal(true);
                            }}
                            title="Excluir"
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Novo/Editar Contrato */}
      {(showForm || showEditModal) && <FormModal isEdit={showEditModal} />}

      {/* Modal de Visualização */}
      {showViewModal && selectedContrato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Detalhes do Contrato
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedContrato(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Número do Contrato</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white font-semibold">{selectedContrato.numero_contrato}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedContrato.status)}`}>
                      {selectedContrato.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Objeto</label>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.objeto}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contratante</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.contratante}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contratado</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.contratado}</p>
                </div>
              </div>

              {selectedContrato.cnpj_contratado && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">CNPJ</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.cnpj_contratado}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Valor</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white font-bold">
                    {formatCurrency(parseFloat(selectedContrato.valor.toString()))}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Início</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{formatDate(selectedContrato.data_inicio)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Término</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{formatDate(selectedContrato.data_fim)}</p>
                </div>
              </div>

              {(selectedContrato.modalidade || selectedContrato.tipo_contrato || selectedContrato.secretaria) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedContrato.modalidade && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Modalidade</label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.modalidade}</p>
                    </div>
                  )}
                  
                  {selectedContrato.tipo_contrato && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.tipo_contrato}</p>
                    </div>
                  )}
                  
                  {selectedContrato.secretaria && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Secretaria</label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.secretaria}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedContrato.fonte_recurso && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fonte de Recurso</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.fonte_recurso}</p>
                </div>
              )}

              {selectedContrato.observacoes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Observações</label>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{selectedContrato.observacoes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedContrato);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedContrato(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && selectedContrato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
                Excluir Contrato
              </h3>
              <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                Tem certeza que deseja excluir o contrato <strong>{selectedContrato.numero_contrato}</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Excluir
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedContrato(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
