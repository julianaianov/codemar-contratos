'use client';

import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function Home() {
  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Municipal</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Visão geral da gestão municipal em tempo real</p>
      </div>
      <DashboardOverview />
    </>
  );
}

