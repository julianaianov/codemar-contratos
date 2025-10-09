'use client';

import React from 'react';
import { DocumentTextIcon, ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import FileUpload from '@/components/importacao/FileUpload';

export default function ImportacaoCSVPage() {
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
          <DocumentTextIcon className="h-8 w-8 text-purple-500" />
          Importar Arquivo CSV
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Faça upload de arquivos CSV (valores separados por vírgula) contendo dados de contratos
        </p>
      </div>

      {/* Componente de Upload */}
      <FileUpload
        acceptedFormats=".csv"
        fileType="csv"
      />

      {/* Informações sobre o formato */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estrutura Esperada */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <InformationCircleIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estrutura do CSV
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            A primeira linha deve conter os cabeçalhos, separados por vírgula:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-gray-700 dark:text-gray-300">{`numero,objeto,contratado,valor,data_inicio
001/2025,Serviços de limpeza,Empresa XYZ,150000.00,01/01/2025
002/2025,Materiais de escritório,Empresa ABC,50000.00,15/01/2025
003/2025,Manutenção de TI,TI Solutions,80000.00,01/02/2025`}</pre>
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
            <li>• <strong>Número:</strong> numero, numero_contrato, nº contrato, numero contrato</li>
            <li>• <strong>Objeto:</strong> objeto, descricao, descrição</li>
            <li>• <strong>Contratante:</strong> contratante, orgao, órgão</li>
            <li>• <strong>Contratado:</strong> contratado, fornecedor, empresa</li>
            <li>• <strong>CNPJ:</strong> cnpj, cnpj_contratado, cnpj contratado</li>
            <li>• <strong>Valor:</strong> valor, valor_contrato, valor contrato</li>
            <li>• <strong>Data Início:</strong> data_inicio, inicio, vigencia_inicio, data inicio</li>
            <li>• <strong>Data Fim:</strong> data_fim, fim, vigencia_fim, data fim</li>
            <li>• <strong>Modalidade:</strong> modalidade</li>
            <li>• <strong>Status:</strong> status, situacao, situação</li>
            <li>• <strong>Tipo:</strong> tipo, tipo_contrato, tipo contrato</li>
            <li>• <strong>Secretaria:</strong> secretaria, unidade</li>
            <li>• <strong>Fonte:</strong> fonte_recurso, fonte, fonte recurso</li>
            <li>• <strong>Observações:</strong> observacoes, observações, obs</li>
          </ul>
        </div>
      </div>

      {/* Dicas */}
      <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5" />
          Dicas Importantes
        </h3>
        <ul className="list-disc list-inside text-purple-800 dark:text-purple-200 space-y-2 text-sm">
          <li>Os valores devem ser separados por vírgula (,)</li>
          <li>Se um valor contém vírgula, coloque-o entre aspas: "valor, com vírgula"</li>
          <li>A primeira linha DEVE conter os nomes das colunas</li>
          <li>O sistema detecta automaticamente a codificação (UTF-8, ISO-8859-1, Windows-1252)</li>
          <li>Datas podem estar em diversos formatos (01/01/2025, 2025-01-01, etc.)</li>
          <li>Valores podem ter pontuação (1.000,00 ou 1000.00)</li>
          <li>Tamanho máximo do arquivo: 10MB</li>
          <li>Linhas vazias são automaticamente ignoradas</li>
          <li>O sistema é flexível com os nomes das colunas</li>
          <li>Todos os campos são opcionais</li>
        </ul>
      </div>

      {/* Exemplo de Download */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Precisa de um modelo? Baixe nosso template de exemplo:
        </p>
        <a
          href="/api/templates/csv"
          download="template-contratos.csv"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <DocumentTextIcon className="h-5 w-5" />
          Baixar Template CSV
        </a>
      </div>
    </div>
  );
}

