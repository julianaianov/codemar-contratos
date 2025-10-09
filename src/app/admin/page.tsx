'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  DocumentArrowUpIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdminStats {
  users: {
    total: number;
    active: number;
    admins: number;
  };
  imports: {
    total: number;
    successful: number;
    failed: number;
    processing: number;
  };
  contracts: {
    total: number;
    processed: number;
  };
  storage: {
    pdf_files: number;
    total_size: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Por enquanto, vamos simular dados até implementar a autenticação
      const mockStats: AdminStats = {
        users: { total: 5, active: 4, admins: 2 },
        imports: { total: 25, successful: 20, failed: 2, processing: 3 },
        contracts: { total: 150, processed: 145 },
        storage: { pdf_files: 15, total_size: '45.2 MB' }
      };
      
      setStats(mockStats);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar estatísticas do dashboard');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie usuários, importações e monitore o sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuários */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.users.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.users.active || 0} ativos, {stats?.users.admins || 0} admins
                </p>
              </div>
            </div>
          </div>

          {/* Importações */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DocumentArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Importações</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.imports.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.imports.successful || 0} sucesso, {stats?.imports.failed || 0} falharam
                </p>
              </div>
            </div>
          </div>

          {/* Contratos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contratos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.contracts.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.contracts.processed || 0} processados
                </p>
              </div>
            </div>
          </div>

          {/* Armazenamento */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Cog6ToothIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Armazenamento</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.storage.total_size || '0 MB'}
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.storage.pdf_files || 0} arquivos PDF
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu de Administração */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gerenciar Usuários */}
          <Link 
            href="/admin/usuarios"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
                Gerenciar Usuários
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Criar, editar e gerenciar usuários do sistema. Controle de permissões e status.
            </p>
          </Link>

          {/* Relatórios */}
          <Link 
            href="/admin/relatorios"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
                Relatórios
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize estatísticas detalhadas de importações, contratos e uso do sistema.
            </p>
          </Link>

          {/* Configurações */}
          <Link 
            href="/admin/configuracoes"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <Cog6ToothIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
                Configurações
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Configurações gerais do sistema, parâmetros e preferências administrativas.
            </p>
          </Link>
        </div>

        {/* Acesso Rápido */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/importacao"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-900 dark:text-white">Importar Arquivos</span>
            </Link>
            <Link 
              href="/consulta/contratos"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-gray-900 dark:text-white">Consultar Contratos</span>
            </Link>
            <Link 
              href="/importacao/historico"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-gray-900 dark:text-white">Histórico de Importações</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
