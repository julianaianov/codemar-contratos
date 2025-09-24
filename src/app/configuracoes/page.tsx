'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function ConfiguracoesPage() {
  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">Preferências do dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle>Preferências de Tema</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Em breve</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Integrações</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Em breve</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


