'use client';

import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { RealDataDashboard } from '@/components/dashboard/RealDataDashboard';

export default function Home() {
  const [useRealData, setUseRealData] = React.useState(false);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Municipal</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Visão geral da gestão municipal em tempo real</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useRealData}
                onChange={(e) => setUseRealData(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Usar dados reais do e-Cidade</span>
            </label>
          </div>
        </div>
      </div>
      {useRealData ? <RealDataDashboard /> : <DashboardOverview />}
    </>
  );
}