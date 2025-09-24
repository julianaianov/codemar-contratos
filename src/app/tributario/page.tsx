'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { useIPTU, useISSQN, useArrecadacaoChart } from '@/hooks/useECidadeData';

export default function TributarioPage() {
  const [filters, setFilters] = useState<any>();
  const { data: iptu } = useIPTU(filters);
  const { data: issqn } = useISSQN(filters);
  const { data: arrecadacaoChart } = useArrecadacaoChart(filters);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão Tributária</h1>
        <p className="mt-2 text-gray-600">Acompanhamento de IPTU, ISSQN e arrecadação</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Arrecadação por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={arrecadacaoChart || { labels: [], datasets: [] }} height={320} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição da Arrecadação</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={arrecadacaoChart || { labels: [], datasets: [] }} height={320} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}


