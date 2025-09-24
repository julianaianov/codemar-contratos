'use client';

import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { RealDataDashboard } from '@/components/dashboard/RealDataDashboard';

export default function Home() {
  const [useRealData, setUseRealData] = React.useState(true);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear().toString());

  const availableYears = ['2025', '2024', '2023', '2022', '2021'];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Municipal</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Visão geral da gestão municipal em tempo real</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="year-select" className="text-sm text-gray-600 dark:text-gray-300">
                Exercício:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-secondary-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
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
      <DashboardOverview filters={{ exercicio: selectedYear }} />
    </>
  );
}