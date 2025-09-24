'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { useUnidadesSaude, useAtendimentos, useSaudeMetrics, useRelatorioSaude } from '@/hooks/useECidadeData';

export default function SaudePage() {
  const { data: metrics } = useSaudeMetrics();
  const { data: relatorio } = useRelatorioSaude();

  const serie = relatorio?.demanda || [];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saúde</h1>
        <p className="mt-2 text-gray-600">Atendimentos, unidades e indicadores de saúde pública</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card><CardContent><div className="text-sm text-gray-500">Unidades</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_unidades ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Atendimentos</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_atendimentos ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Médicos</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_medicos ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Enfermeiros</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_enfermeiros ?? '-'}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Demanda por Mês</CardTitle></CardHeader>
        <CardContent>
          <LineChart data={serie} height={320} title="Atendimentos" />
        </CardContent>
      </Card>
    </>
  );
}


