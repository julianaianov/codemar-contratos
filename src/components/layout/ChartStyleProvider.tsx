'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface ChartStyleContextValue {
  neon: boolean;
  gradient: boolean;
  colors: string[];
  perChartColors: Record<string, string[]>;
  setNeon: (v: boolean) => void;
  setGradient: (v: boolean) => void;
  setColors: (v: string[]) => void;
  setChartColors: (key: string, v: string[]) => void;
  clearChartColors: (key: string) => void;
  getColorsForChart: (key?: string) => string[];
}

// Paleta ampla e vibrante para evitar repetição de cores entre muitas categorias
const DEFAULT_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F472B6', '#84CC16', '#F97316', '#14B8A6',
  '#EAB308', '#22C55E', '#FB7185', '#6366F1', '#0EA5E9', '#A78BFA', '#34D399', '#D946EF', '#F43F5E', '#65A30D',
  '#FBBF24', '#3B82F6', '#059669', '#F87171', '#C084FC', '#38BDF8', '#FCD34D', '#1D4ED8', '#DC2626', '#9333EA'
];

const ChartStyleContext = createContext<ChartStyleContextValue | undefined>(undefined);

export const useChartStyle = (): ChartStyleContextValue => {
  const ctx = useContext(ChartStyleContext);
  if (!ctx) throw new Error('useChartStyle must be used within ChartStyleProvider');
  return ctx;
};

export const ChartStyleProvider: React.FC<{ children: React.ReactNode }>
  = ({ children }) => {
  const [neon, setNeon] = useState<boolean>(true);
  const [gradient, setGradient] = useState<boolean>(true);
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [perChartColors, setPerChartColors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('chart-style');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.neon === 'boolean') setNeon(parsed.neon);
        if (typeof parsed.gradient === 'boolean') setGradient(parsed.gradient);
        if (Array.isArray(parsed.colors)) setColors(parsed.colors);
        if (parsed.perChartColors && typeof parsed.perChartColors === 'object') setPerChartColors(parsed.perChartColors);
      } catch {}
    }
    // Se não houver cores salvas, usar padrão azul
    setColors((prev) => (prev && prev.length ? prev : DEFAULT_COLORS));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('chart-style', JSON.stringify({ neon, gradient, colors, perChartColors }));
  }, [neon, gradient, colors, perChartColors]);

  const setChartColors = (key: string, v: string[]) => {
    setPerChartColors((prev) => ({ ...prev, [key]: v }));
  };

  const clearChartColors = (key: string) => {
    setPerChartColors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getColorsForChart = (key?: string): string[] => {
    if (!key) return colors;
    return perChartColors[key] && perChartColors[key].length ? perChartColors[key] : colors;
  };

  const value = useMemo(
    () => ({
      neon,
      gradient,
      colors,
      perChartColors,
      setNeon,
      setGradient,
      setColors,
      setChartColors,
      clearChartColors,
      getColorsForChart,
    }),
    [neon, gradient, colors, perChartColors]
  );

  return (
    <ChartStyleContext.Provider value={value}>{children}</ChartStyleContext.Provider>
  );
};


