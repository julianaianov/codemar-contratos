'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { usePatrimonialMetrics } from '@/hooks/useECidadeData';

export default function PatrimonialPage() {
  const { data: metrics } = usePatrimonialMetrics();

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patrimonial</h1>
        <p className="mt-2 text-gray-600">Bens, licitações e valores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card><CardContent><div className="text-sm text-gray-500">Bens</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_bens ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Valor Total</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.valor_total_bens ?? 0)}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Licitações</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_licitacoes ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Valor Licitações</div><div className="text-2xl sm:text-3xl font-bold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(metrics?.valor_total_licitacoes ?? 0)}</div></CardContent></Card>
      </div>
    </>
  );
}


