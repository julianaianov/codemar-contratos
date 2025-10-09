'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  Cog6ToothIcon,
  ServerIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SystemStatus {
  database: 'online' | 'offline';
  storage: 'available' | 'full';
  ocr_service: 'available' | 'unavailable';
  pdf_processing: 'active' | 'inactive';
}

interface SystemSettings {
  max_file_size: number;
  allowed_file_types: string[];
  ocr_enabled: boolean;
  auto_processing: boolean;
  backup_enabled: boolean;
}

export default function AdminConfigPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    storage: 'available',
    ocr_service: 'available',
    pdf_processing: 'active'
  });
  
  const [settings, setSettings] = useState<SystemSettings>({
    max_file_size: 20,
    allowed_file_types: ['xml', 'xlsx', 'xls', 'csv', 'pdf'],
    ocr_enabled: true,
    auto_processing: true,
    backup_enabled: true
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
    fetchSettings();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      // Simular verificação de status
      setTimeout(() => {
        setSystemStatus({
          database: 'online',
          storage: 'available',
          ocr_service: 'available',
          pdf_processing: 'active'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      // Por enquanto, usar configurações padrão
      // Implementar chamada à API quando necessário
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      // Implementar chamada à API para salvar configuração
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'online' || status === 'available' || status === 'active') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'online' || status === 'available' || status === 'active') {
      return 'Online';
    }
    return 'Offline';
  };

  const getStatusColor = (status: string) => {
    if (status === 'online' || status === 'available' || status === 'active') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
              Configurações do Sistema
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gerencie configurações gerais e monitore o status do sistema
            </p>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ServerIcon className="h-6 w-6 text-blue-600" />
            Status do Sistema
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Verificando status...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <DatabaseIcon className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Banco de Dados</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.database)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.database)}`}>
                      {getStatusText(systemStatus.database)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ServerIcon className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Armazenamento</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.storage)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.storage)}`}>
                      {getStatusText(systemStatus.storage)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <DocumentTextIcon className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Serviço OCR</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.ocr_service)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.ocr_service)}`}>
                      {getStatusText(systemStatus.ocr_service)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600 mr-4" />
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Processamento PDF</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.pdf_processing)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemStatus.pdf_processing)}`}>
                      {getStatusText(systemStatus.pdf_processing)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações de Arquivo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Configurações de Arquivo
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tamanho Máximo de Arquivo (MB)
                </label>
                <input
                  type="number"
                  value={settings.max_file_size}
                  onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipos de Arquivo Permitidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['xml', 'xlsx', 'xls', 'csv', 'pdf'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowed_file_types.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateSetting('allowed_file_types', [...settings.allowed_file_types, type]);
                          } else {
                            updateSetting('allowed_file_types', settings.allowed_file_types.filter(t => t !== type));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 uppercase">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Configurações de Processamento */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Configurações de Processamento
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    OCR Habilitado
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Permite processamento de PDFs escaneados
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ocr_enabled}
                    onChange={(e) => updateSetting('ocr_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Processamento Automático
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Processa arquivos automaticamente após upload
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_processing}
                    onChange={(e) => updateSetting('auto_processing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Backup Automático
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cria backups automáticos dos dados
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.backup_enabled}
                    onChange={(e) => updateSetting('backup_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Informações do Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Versão do Sistema</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">v1.0.0</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">09/01/2025</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ambiente</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Desenvolvimento</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Suporte</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">admin@codemar.com.br</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
