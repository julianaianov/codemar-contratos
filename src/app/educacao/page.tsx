'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { useEscolas, useAlunos, useEducacaoMetrics, useRelatorioEducacao } from '@/hooks/useECidadeData';

export default function EducacaoPage() {
  const { data: metrics } = useEducacaoMetrics();
  const { data: relatorio } = useRelatorioEducacao();

  const chart = relatorio?.matriculas || { labels: [], datasets: [] };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Educação</h1>
        <p className="mt-2 text-gray-600">Matrículas, evasão e indicadores educacionais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card><CardContent><div className="text-sm text-gray-500">Escolas</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_escolas ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Alunos</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_alunos ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Professores</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_professores ?? '-'}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-gray-500">Turmas</div><div className="text-2xl sm:text-3xl font-bold">{metrics?.total_turmas ?? '-'}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Matrículas por Ano</CardTitle></CardHeader>
        <CardContent>
          <BarChart data={chart} height={320} />
        </CardContent>
      </Card>
    </>
  );
}


