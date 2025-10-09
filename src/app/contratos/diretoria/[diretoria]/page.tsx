'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContratosDashboard } from '@/components/contratos/ContratosDashboard';
import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function DashboardDiretoriaPage() {
  const params = useParams();
  const router = useRouter();
  const diretoria = decodeURIComponent(params.diretoria as string);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/contratos/stats?diretoria=${encodeURIComponent(diretoria)}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [diretoria]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header da Diretoria */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div>
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {diretoria}
                  </h1>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Dashboard de contratos da diretoria
                </p>
              </div>
            </div>

            {!loading && stats && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total de Contratos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.vigentes}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Vigentes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(stats.valor_total)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Valor Total
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard com filtro pré-aplicado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContratosDashboard initialFilter={{ diretoria }} />
      </div>
    </div>
  );
}

