'use client';

import React, { useState } from 'react';
import { 
  Squares2X2Icon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  MapIcon,
  ShieldCheckIcon,
  TruckIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  DocumentPlusIcon,
  DocumentCheckIcon,
  PencilSquareIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  UsersIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  ScaleIcon,
  CalculatorIcon,
  BanknotesIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AppsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const allApps = [
    // Transparência
    { 
      name: 'Portal de Transparência', 
      href: '/', 
      icon: EyeIcon, 
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      category: 'Portal',
      description: 'Acesso público aos dados'
    },
    
    // Consultas
    { 
      name: 'Consultas', 
      href: '/consulta', 
      icon: MagnifyingGlassIcon, 
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      category: 'Consultas',
      description: 'Consultar contratos, cobrança e terceirizados'
    },
    { 
      name: 'Consulta de Contratos', 
      href: '/consulta/contratos', 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      category: 'Consultas',
      description: 'Consultar contratos cadastrados'
    },
    { 
      name: 'Instrumentos de Cobrança', 
      href: '/consulta/cobranca', 
      icon: CreditCardIcon, 
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      category: 'Consultas',
      description: 'Consultar instrumentos de cobrança'
    },
    { 
      name: 'Terceirizados', 
      href: '/consulta/terceirizados', 
      icon: UsersIcon, 
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      category: 'Consultas',
      description: 'Consultar terceirizados'
    },

    // Importação
    { 
      name: 'Importação', 
      href: '/importacao', 
      icon: ArrowDownTrayIcon, 
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      category: 'Importação',
      description: 'Importar dados de diversas fontes'
    },
    { 
      name: 'Importar XML', 
      href: '/importacao/xml', 
      icon: DocumentTextIcon, 
      gradient: 'from-sky-400 via-blue-500 to-indigo-500',
      category: 'Importação',
      description: 'Importar arquivos XML'
    },
    { 
      name: 'Importar Contratos', 
      href: '/importacao/contratos', 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-teal-400 via-cyan-500 to-blue-500',
      category: 'Importação',
      description: 'Importação em lote de contratos'
    },
    { 
      name: 'Importar Fornecedores', 
      href: '/importacao/fornecedores', 
      icon: TruckIcon, 
      gradient: 'from-purple-500 via-indigo-500 to-blue-500',
      category: 'Importação',
      description: 'Importar cadastro de fornecedores'
    },

    // Cadastros
    { 
      name: 'Cadastros', 
      href: '/cadastros', 
      icon: FolderIcon, 
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      category: 'Cadastros',
      description: 'Gerenciar cadastros do sistema'
    },
    { 
      name: 'Cadastro de Fornecedores', 
      href: '/cadastros/fornecedores', 
      icon: TruckIcon, 
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      category: 'Cadastros',
      description: 'Gerenciar fornecedores'
    },
    { 
      name: 'Cadastro de Contratos', 
      href: '/cadastros/contratos', 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-blue-400 via-sky-500 to-cyan-500',
      category: 'Cadastros',
      description: 'Gerenciar contratos'
    },
    { 
      name: 'Cadastro de Órgãos', 
      href: '/cadastros/orgaos', 
      icon: BuildingOfficeIcon, 
      gradient: 'from-purple-400 via-violet-500 to-indigo-500',
      category: 'Cadastros',
      description: 'Gerenciar órgãos'
    },
    { 
      name: 'Unidades Gestoras', 
      href: '/cadastros/unidades-gestoras', 
      icon: BuildingOfficeIcon, 
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      category: 'Cadastros',
      description: 'Gerenciar unidades gestoras'
    },

    // Gestão de Contratos
    { 
      name: 'Mapa de Contratos', 
      href: '/mapa-contratos', 
      icon: MapIcon, 
      gradient: 'from-rose-400 via-red-500 to-pink-600',
      category: 'Gestão',
      description: 'Visualização geográfica'
    },
    { 
      name: 'Geração de Contratos', 
      href: '/geracao-contratos', 
      icon: DocumentPlusIcon, 
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      category: 'Gestão',
      description: 'Criar novos contratos'
    },
    { 
      name: 'Ata Registro de Preço', 
      href: '/ata-registro-preco', 
      icon: DocumentCheckIcon, 
      gradient: 'from-lime-400 via-green-500 to-emerald-600',
      category: 'Gestão',
      description: 'Gerenciar atas de registro'
    },

    // Fiscalização
    { 
      name: 'Fiscalização', 
      href: '/fiscalizacao', 
      icon: ShieldCheckIcon, 
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      category: 'Fiscalização',
      description: 'Gestão de fiscalização de contratos'
    },
    { 
      name: 'Vistorias', 
      href: '/fiscalizacao/vistorias', 
      icon: EyeIcon, 
      gradient: 'from-sky-400 via-cyan-500 to-blue-500',
      category: 'Fiscalização',
      description: 'Agendar e realizar vistorias'
    },
    { 
      name: 'Ocorrências', 
      href: '/fiscalizacao/ocorrencias', 
      icon: ExclamationTriangleIcon, 
      gradient: 'from-red-400 via-rose-500 to-pink-500',
      category: 'Fiscalização',
      description: 'Registrar ocorrências'
    },
    { 
      name: 'Relatórios de Fiscalização', 
      href: '/fiscalizacao/relatorios', 
      icon: DocumentChartBarIcon, 
      gradient: 'from-emerald-400 via-green-500 to-teal-500',
      category: 'Fiscalização',
      description: 'Gerar relatórios'
    },

    // Fornecimento
    { 
      name: 'Fornecimento', 
      href: '/fornecimento', 
      icon: TruckIcon, 
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      category: 'Fornecimento',
      description: 'Gestão de fornecimento'
    },
    { 
      name: 'Pedidos', 
      href: '/fornecimento/pedidos', 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      category: 'Fornecimento',
      description: 'Gerenciar pedidos'
    },
    { 
      name: 'Entregas', 
      href: '/fornecimento/entregas', 
      icon: DocumentCheckIcon, 
      gradient: 'from-teal-400 via-green-500 to-emerald-500',
      category: 'Fornecimento',
      description: 'Acompanhar entregas'
    },
    { 
      name: 'Acompanhamento', 
      href: '/fornecimento/acompanhamento', 
      icon: ChartBarIcon, 
      gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
      category: 'Fornecimento',
      description: 'Monitorar fornecimentos'
    },

    // PNCP
    { 
      name: 'PNCP', 
      href: '/pncp', 
      icon: GlobeAltIcon, 
      gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
      category: 'PNCP',
      description: 'Portal Nacional de Contratações Públicas'
    },
    { 
      name: 'Enviar ao PNCP', 
      href: '/pncp/enviar', 
      icon: ArrowDownTrayIcon, 
      gradient: 'from-blue-400 via-cyan-500 to-teal-500',
      category: 'PNCP',
      description: 'Enviar dados ao portal'
    },
    { 
      name: 'Consultar PNCP', 
      href: '/pncp/consultar', 
      icon: EyeIcon, 
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      category: 'PNCP',
      description: 'Consultar dados no PNCP'
    },
    { 
      name: 'Histórico PNCP', 
      href: '/pncp/historico', 
      icon: DocumentTextIcon, 
      gradient: 'from-purple-400 via-indigo-500 to-blue-500',
      category: 'PNCP',
      description: 'Ver histórico de envios'
    },

    // Riscos
    { 
      name: 'Riscos', 
      href: '/riscos', 
      icon: ExclamationTriangleIcon, 
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      category: 'Riscos',
      description: 'Gestão de riscos contratuais'
    },
    { 
      name: 'Mapa de Riscos', 
      href: '/riscos/mapa', 
      icon: MapIcon, 
      gradient: 'from-rose-400 via-red-500 to-orange-500',
      category: 'Riscos',
      description: 'Visualizar riscos'
    },
    { 
      name: 'Avaliação de Riscos', 
      href: '/riscos/avaliacao', 
      icon: ShieldCheckIcon, 
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      category: 'Riscos',
      description: 'Avaliar riscos'
    },
    { 
      name: 'Plano de Mitigação', 
      href: '/riscos/mitigacao', 
      icon: DocumentCheckIcon, 
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      category: 'Riscos',
      description: 'Planos de mitigação'
    },

    // Assinatura Eletrônica
    { 
      name: 'Assinatura Eletrônica', 
      href: '/assinatura-eletronica', 
      icon: PencilSquareIcon, 
      gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
      category: 'Assinatura',
      description: 'Gestão de assinaturas eletrônicas'
    },
    { 
      name: 'Documentos Pendentes', 
      href: '/assinatura-eletronica/pendentes', 
      icon: DocumentTextIcon, 
      gradient: 'from-yellow-400 via-amber-500 to-orange-500',
      category: 'Assinatura',
      description: 'Documentos para assinar'
    },
    { 
      name: 'Documentos Assinados', 
      href: '/assinatura-eletronica/assinados', 
      icon: DocumentCheckIcon, 
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      category: 'Assinatura',
      description: 'Documentos assinados'
    },
    { 
      name: 'Enviar para Assinatura', 
      href: '/assinatura-eletronica/enviar', 
      icon: ArrowDownTrayIcon, 
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
      category: 'Assinatura',
      description: 'Enviar documentos'
    },

    // Terceirização
    { 
      name: 'Terceirização', 
      href: '/tercerizacao', 
      icon: UserGroupIcon, 
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      category: 'Terceirização',
      description: 'Gestão de terceirização'
    },
    { 
      name: 'Gestão de Terceirizados', 
      href: '/tercerizacao/terceirizados', 
      icon: UsersIcon, 
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      category: 'Terceirização',
      description: 'Gerenciar terceirizados'
    },
    { 
      name: 'Contratos de Terceirização', 
      href: '/tercerizacao/contratos', 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-teal-400 via-cyan-500 to-blue-500',
      category: 'Terceirização',
      description: 'Contratos terceirizados'
    },
    { 
      name: 'Folha de Ponto', 
      href: '/tercerizacao/folha-ponto', 
      icon: DocumentTextIcon, 
      gradient: 'from-purple-400 via-violet-500 to-indigo-500',
      category: 'Terceirização',
      description: 'Controle de ponto'
    },

    // Relatórios
    { 
      name: 'Relatórios', 
      href: '/relatorios', 
      icon: DocumentChartBarIcon, 
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      category: 'Relatórios',
      description: 'Relatórios gerenciais'
    },
    { 
      name: 'Relatórios de Contratos', 
      href: '/relatorios/contratos', 
      icon: ClipboardDocumentListIcon, 
      gradient: 'from-blue-400 via-sky-500 to-cyan-500',
      category: 'Relatórios',
      description: 'Relatórios de contratos'
    },
    { 
      name: 'Relatórios de Fornecedores', 
      href: '/relatorios/fornecedores', 
      icon: TruckIcon, 
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      category: 'Relatórios',
      description: 'Relatórios de fornecedores'
    },
    { 
      name: 'Relatórios de Fiscalização', 
      href: '/relatorios/fiscalizacao', 
      icon: ShieldCheckIcon, 
      gradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
      category: 'Relatórios',
      description: 'Relatórios de fiscalização'
    },
    { 
      name: 'Relatórios Financeiros', 
      href: '/relatorios/financeiro', 
      icon: CurrencyDollarIcon, 
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      category: 'Relatórios',
      description: 'Relatórios financeiros'
    },

    // Financeiro
    { 
      name: 'Gestão Financeira', 
      href: '/financeiro', 
      icon: CurrencyDollarIcon, 
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      category: 'Financeiro',
      description: 'Gestão financeira'
    },
    { 
      name: 'Receitas', 
      href: '/receitas', 
      icon: BanknotesIcon, 
      gradient: 'from-lime-400 via-green-500 to-emerald-500',
      category: 'Financeiro',
      description: 'Gestão de receitas'
    },
    { 
      name: 'Tributário', 
      href: '/tributario', 
      icon: CalculatorIcon, 
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      category: 'Financeiro',
      description: 'Gestão tributária'
    },

    // RH
    { 
      name: 'Recursos Humanos', 
      href: '/recursos-humanos', 
      icon: UserGroupIcon, 
      gradient: 'from-fuchsia-500 via-purple-600 to-indigo-600',
      category: 'RH',
      description: 'Gestão de RH'
    },

    // Configurações
    { 
      name: 'Configurações', 
      href: '/configuracoes', 
      icon: CogIcon, 
      gradient: 'from-slate-400 via-gray-500 to-zinc-600',
      category: 'Sistema',
      description: 'Configurações do sistema'
    },
  ];

  const filteredApps = allApps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(allApps.map(app => app.category)));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Squares2X2Icon className="h-8 w-8 text-blue-500" />
          Todos os Aplicativos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Acesse todos os módulos e funcionalidades do sistema
        </p>
      </div>

      {/* Busca */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aplicativos..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
          />
        </div>
      </div>

      {/* Apps por Categoria */}
      {categories.map(category => {
        const categoryApps = filteredApps.filter(app => app.category === category);
        if (categoryApps.length === 0) return null;

        return (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {categoryApps.map((app) => (
                <Link
                  key={app.href}
                  href={app.href}
                  className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105 hover:border-transparent relative overflow-hidden"
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${app.gradient} mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl relative`}>
                    <app.icon className="h-8 w-8 text-white drop-shadow-lg" />
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{
                           boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                         }}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center mb-1 relative z-10">
                    {app.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2 relative z-10">
                    {app.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <Squares2X2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum aplicativo encontrado
          </p>
        </div>
      )}
    </div>
  );
}

