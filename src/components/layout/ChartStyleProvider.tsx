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

const DEFAULT_COLORS = ['#00a3ff', '#0033ff', '#4f8cff', '#72b0ff', '#a3c8ff'];

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


