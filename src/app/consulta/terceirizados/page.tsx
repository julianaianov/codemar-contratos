'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function TerceirizadosPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terceirizados
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gestão de contratos terceirizados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terceirizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Módulo em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
