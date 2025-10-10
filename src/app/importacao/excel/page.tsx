'use client';

import React from 'react';
import { ClipboardDocumentListIcon, ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/importacao/FileUpload';

export default function ImportacaoExcelPage() {
  const router = useRouter();

  const handleUploadSuccess = (data: any) => {
    // Redirecionar para a página de consulta de contratos após upload bem-sucedido
    setTimeout(() => {
      router.push('/consulta/contratos');
    }, 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/importacao"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Importação
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ClipboardDocumentListIcon className="h-8 w-8 text-green-500" />
          Importar Planilha Excel
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Faça upload de planilhas Excel (.xlsx ou .xls) contendo dados de contratos
        </p>
      </div>

      {/* Informação sobre Diretorias */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Diretorias Automáticas
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-3">
              Para arquivos Excel, as diretorias são extraídas automaticamente do próprio arquivo. 
              Certifique-se de que sua planilha possui uma coluna com o nome "diretoria" (recomendado), "secretaria" ou "unidade".
            </p>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">✅ Vantagens:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Suporte a múltiplas diretorias no mesmo arquivo</li>
                <li>Organização automática dos contratos</li>
                <li>Sem necessidade de seleção manual</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de Upload */}
      <FileUpload
        acceptedFormats=".xlsx,.xls"
        fileType="excel"
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Informações sobre o formato */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estrutura Esperada */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estrutura da Planilha
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            A primeira linha deve conter os cabeçalhos das colunas:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="px-2 py-1 text-left font-semibold">ano-nº</th>
                  <th className="px-2 py-1 text-left font-semibold">contrato</th>
                  <th className="px-2 py-1 text-left font-semibold">ano</th>
                  <th className="px-2 py-1 text-left font-semibold">P.A</th>
                      <th className="px-2 py-1 text-left font-semibold">DIRETORIA REQUISITANTE</th>
                  <th className="px-2 py-1 text-left font-semibold">MODALIDADE</th>
                  <th className="px-2 py-1 text-left font-semibold">NOME DA EMPRESA</th>
                  <th className="px-2 py-1 text-left font-semibold">CNPJ DA EMPRESA</th>
                  <th className="px-2 py-1 text-left font-semibold">OBJETO</th>
                  <th className="px-2 py-1 text-left font-semibold">DATA DA ASSINATURA</th>
                  <th className="px-2 py-1 text-left font-semibold">PRAZO</th>
                  <th className="px-2 py-1 text-left font-semibold">UNID. PRAZO</th>
                  <th className="px-2 py-1 text-left font-semibold">VALOR DO CONTRATO</th>
                  <th className="px-2 py-1 text-left font-semibold">VENCIMENTO</th>
                  <th className="px-2 py-1 text-left font-semibold">STATUS</th>
                  <th className="px-2 py-1 text-left font-semibold">GESTOR DO CONTRATO</th>
                  <th className="px-2 py-1 text-left font-semibold">FISCAL TÉCNICO</th>
                  <th className="px-2 py-1 text-left font-semibold">FISCAL ADMINISTRATIVO</th>
                  <th className="px-2 py-1 text-left font-semibold">SUPLENTE</th>
                  <th className="px-2 py-1 text-left font-semibold">OBSERVAÇÕES</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr>
                  <td className="px-2 py-1">2025/001</td>
                  <td className="px-2 py-1">001/2025</td>
                  <td className="px-2 py-1">2025</td>
                  <td className="px-2 py-1">PA-2025-001</td>
                  <td className="px-2 py-1">Secretaria de Obras</td>
                  <td className="px-2 py-1">Pregão Eletrônico</td>
                  <td className="px-2 py-1">Construtora ABC Ltda</td>
                  <td className="px-2 py-1">12.345.678/0001-90</td>
                  <td className="px-2 py-1">Construção de escola</td>
                  <td className="px-2 py-1">2025-01-15</td>
                  <td className="px-2 py-1">12</td>
                  <td className="px-2 py-1">meses</td>
                  <td className="px-2 py-1">150000.00</td>
                  <td className="px-2 py-1">2026-01-15</td>
                  <td className="px-2 py-1">VIGENTE</td>
                  <td className="px-2 py-1">João Silva</td>
                  <td className="px-2 py-1">Lucas Santos</td>
                  <td className="px-2 py-1">Maria Oliveira</td>
                  <td className="px-2 py-1">Pedro Costa</td>
                  <td className="px-2 py-1">Contrato em andamento</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">2025/002</td>
                  <td className="px-2 py-1">002/2025</td>
                  <td className="px-2 py-1">2025</td>
                  <td className="px-2 py-1">PA-2025-002</td>
                  <td className="px-2 py-1">Secretaria de Saúde</td>
                  <td className="px-2 py-1">Tomada de Preços</td>
                  <td className="px-2 py-1">Hospital XYZ S.A.</td>
                  <td className="px-2 py-1">98.765.432/0001-10</td>
                  <td className="px-2 py-1">Equipamentos médicos</td>
                  <td className="px-2 py-1">2025-02-01</td>
                  <td className="px-2 py-1">6</td>
                  <td className="px-2 py-1">meses</td>
                  <td className="px-2 py-1">75000.00</td>
                  <td className="px-2 py-1">2025-08-01</td>
                  <td className="px-2 py-1">VIGENTE</td>
                  <td className="px-2 py-1">Ana Costa</td>
                  <td className="px-2 py-1">Carlos Lima</td>
                  <td className="px-2 py-1">Roberto Silva</td>
                  <td className="px-2 py-1">Fernanda Alves</td>
                  <td className="px-2 py-1">Equipamentos aprovados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Nomes de Colunas Aceitos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Colunas Flexíveis
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            O sistema aceita diferentes nomes para as mesmas colunas:
          </p>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <li>• <strong>ano-nº:</strong> ano-nº, ano_numero, ano_numero_contrato</li>
            <li>• <strong>contrato:</strong> contrato, numero, numero_contrato, nº contrato</li>
            <li>• <strong>ano:</strong> ano, ano_contrato</li>
            <li>• <strong>P.A:</strong> P.A, pa, p.a, processo_administrativo, processo</li>
                <li>• <strong>DIRETORIA REQUISITANTE:</strong> DIRETORIA REQUISITANTE, diretoria_requisitante, DIRETORIA, diretoria, secretaria, unidade</li>
            <li>• <strong>MODALIDADE:</strong> MODALIDADE, modalidade, modalidade_licitacao</li>
            <li>• <strong>NOME DA EMPRESA:</strong> NOME DA EMPRESA, nome_empresa, empresa, contratado, fornecedor, razao_social</li>
            <li>• <strong>CNPJ DA EMPRESA:</strong> CNPJ DA EMPRESA, cnpj_empresa, cnpj, cnpj_contratado</li>
            <li>• <strong>OBJETO:</strong> OBJETO, objeto, descricao, descrição, objeto_contrato</li>
            <li>• <strong>DATA DA ASSINATURA:</strong> DATA DA ASSINATURA, data_assinatura, assinatura, data_contrato</li>
            <li>• <strong>PRAZO:</strong> PRAZO, prazo, prazo_contrato, duracao</li>
            <li>• <strong>UNID. PRAZO:</strong> UNID. PRAZO, unidade_prazo, unid_prazo, unidade, periodo</li>
                <li>• <strong>VALOR DO CONTRATO:</strong> VALOR DO CONTRATO, valor_contrato, valor, valor_total</li>
                <li>• <strong>VENCIMENTO:</strong> VENCIMENTO, vencimento, data_vencimento, data_fim, vigencia_fim</li>
                <li>• <strong>STATUS:</strong> STATUS, status, situacao, situação</li>
                <li>• <strong>GESTOR DO CONTRATO:</strong> GESTOR DO CONTRATO, gestor_contrato, gestor, responsavel</li>
                <li>• <strong>FISCAL TÉCNICO:</strong> FISCAL TÉCNICO, fiscal_tecnico, fiscal_tecnico</li>
                <li>• <strong>FISCAL ADMINISTRATIVO:</strong> FISCAL ADMINISTRATIVO, fiscal_administrativo, fiscal_admin</li>
                <li>• <strong>SUPLENTE:</strong> SUPLENTE, suplente, substituto</li>
                <li>• <strong>OBSERVAÇÕES:</strong> OBSERVAÇÕES, observacoes, observações, obs</li>
              </ul>
        </div>
      </div>

      {/* Dicas */}
      <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5" />
          Dicas Importantes
        </h3>
        <ul className="list-disc list-inside text-green-800 dark:text-green-200 space-y-2 text-sm">
          <li>Formatos aceitos: .xlsx (Excel 2007+) e .xls (Excel 97-2003)</li>
          <li>A primeira linha DEVE conter os nomes das colunas</li>
          <li>Datas podem estar em diversos formatos (01/01/2025, 2025-01-01, etc.)</li>
          <li>Valores podem ter formatação monetária (R$ 1.000,00 ou 1000.00)</li>
          <li>Tamanho máximo do arquivo: 10MB</li>
          <li>Linhas vazias são automaticamente ignoradas</li>
          <li>O sistema é flexível com os nomes das colunas (veja lista ao lado)</li>
          <li>Todos os campos são opcionais</li>
        </ul>
      </div>

      {/* Exemplo de Download */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Precisa de um modelo? Baixe nosso template de exemplo:
        </p>
        <a
          href="/api/templates/excel"
          download="template-contratos.xlsx"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <ClipboardDocumentListIcon className="h-5 w-5" />
          Baixar Template Excel
        </a>
      </div>
    </div>
  );
}

