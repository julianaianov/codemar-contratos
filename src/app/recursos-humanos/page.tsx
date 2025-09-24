'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useServidores, useFolhaPagamento, useRHMetrics } from '@/hooks/useECidadeData';

export default function RHPage() {
  const { data: metrics } = useRHMetrics();

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recursos Humanos</h1>
        <p className="mt-2 text-gray-600">Servidores, folha e indicadores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card><CardContent><div className="text-sm text-gray-500">Servidores</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_servidores ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Ativos</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.servidores_ativos ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Total da Folha</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.total_folha ?? 0)}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Média Salarial</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.media_salario ?? 0)}</div></CardContent></Card>
      </div>
    </>
  );
}


