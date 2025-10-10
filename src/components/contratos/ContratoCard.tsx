import React from 'react';
import { ContratoImportado } from '@/types/contratos';
import { Card } from '@/components/ui/Card';

interface ContratoCardProps {
  contrato: ContratoImportado;
  onClick?: () => void;
}

export const ContratoCard: React.FC<ContratoCardProps> = ({ contrato, onClick }) => {
  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'vigente':
        return 'text-green-600 bg-green-100';
      case 'vencido':
        return 'text-red-600 bg-red-100';
      case 'suspenso':
        return 'text-yellow-600 bg-yellow-100';
      case 'encerrado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header com ano-número e status */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {contrato.ano_numero || contrato.numero_contrato || 'N/A'}
            </h3>
            <p className="text-sm text-gray-600">
              Contrato: {contrato.numero_contrato || 'N/A'}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contrato.status)}`}>
            {contrato.status || 'N/A'}
          </span>
        </div>

        {/* Informações principais em grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Coluna 1 */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Ano
              </label>
              <p className="text-sm text-gray-900">
                {contrato.ano || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                P.A
              </label>
              <p className="text-sm text-gray-900">
                {contrato.pa || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Diretoria
              </label>
              <p className="text-sm text-gray-900">
                {contrato.secretaria || contrato.diretoria || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Modalidade
              </label>
              <p className="text-sm text-gray-900">
                {contrato.modalidade || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nome da Empresa
              </label>
              <p className="text-sm text-gray-900">
                {contrato.contratado || contrato.nome_empresa || 'N/A'}
              </p>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                CNPJ da Empresa
              </label>
              <p className="text-sm text-gray-900 font-mono">
                {contrato.cnpj_contratado || contrato.cnpj_empresa || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Data da Assinatura
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(contrato.data_assinatura)}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Prazo
              </label>
              <p className="text-sm text-gray-900">
                {contrato.prazo ? `${contrato.prazo} ${contrato.unidade_prazo || 'dias'}` : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Unidade Prazo
              </label>
              <p className="text-sm text-gray-900">
                {contrato.unidade_prazo || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vencimento
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(contrato.vencimento || contrato.data_fim)}
              </p>
            </div>
          </div>

          {/* Coluna 3 */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Valor do Contrato
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(contrato.valor || contrato.valor_contrato)}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Gestor do Contrato
              </label>
              <p className="text-sm text-gray-900">
                {contrato.gestor_contrato || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Fiscal Técnico
              </label>
              <p className="text-sm text-gray-900">
                {contrato.fiscal_tecnico || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Fiscal Administrativo
              </label>
              <p className="text-sm text-gray-900">
                {contrato.fiscal_administrativo || 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Suplente
              </label>
              <p className="text-sm text-gray-900">
                {contrato.suplente || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Objeto do contrato */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Objeto
          </label>
          <p className="text-sm text-gray-900 mt-1 line-clamp-3">
            {contrato.objeto || 'N/A'}
          </p>
        </div>

        {/* Observações */}
        {contrato.observacoes && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Observações
            </label>
            <p className="text-sm text-gray-900 mt-1 line-clamp-2">
              {contrato.observacoes}
            </p>
          </div>
        )}

        {/* Footer com informações adicionais */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              Importado em: {formatDate(contrato.created_at)}
            </span>
            {contrato.file_import_id && (
              <span>
                Arquivo ID: {contrato.file_import_id}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContratoCard;
