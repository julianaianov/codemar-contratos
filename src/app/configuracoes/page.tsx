'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useChartStyle } from '@/components/layout/ChartStyleProvider';

export default function ConfiguracoesPage() {
  const { colors, setColors, gradient, setGradient, neon, setNeon } = useChartStyle();

  const PALETTES: Record<string, string[]> = {
    Azul: ['#0ea5e9', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe'],
    Verde: ['#10b981', '#22c55e', '#34d399', '#86efac', '#bbf7d0'],
    Vermelho: ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca'],
    Roxo: ['#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'],
    Coloridos: ['#ff0040', '#ff7a00', '#ffe600', '#7bd500', '#00a3ff', '#0033ff', '#00d92f'],
  };

  const handlePaletteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setColors(PALETTES[key] || colors);
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">Preferências do dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle>Paleta dos Gráficos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paleta</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={handlePaletteChange}
                  defaultValue="Azul"
                >
                  {Object.keys(PALETTES).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pré-visualização</label>
                <div className="flex gap-2 items-center flex-wrap">
                  {colors.map((c, i) => (
                    <span key={i} className="h-6 w-6 rounded border" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input id="toggle-gradient" type="checkbox" checked={gradient} onChange={(e) => setGradient(e.target.checked)} />
                <label htmlFor="toggle-gradient" className="text-sm text-gray-700">Habilitar degradê</label>
              </div>

              <div className="flex items-center gap-3">
                <input id="toggle-neon" type="checkbox" checked={neon} onChange={(e) => setNeon(e.target.checked)} />
                <label htmlFor="toggle-neon" className="text-sm text-gray-700">Brilho neon</label>
              </div>
            </div>
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


