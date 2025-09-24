'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface ChartStyleContextValue {
  neon: boolean;
  gradient: boolean;
  colors: string[];
  setNeon: (v: boolean) => void;
  setGradient: (v: boolean) => void;
  setColors: (v: string[]) => void;
}

const DEFAULT_COLORS = ['#00a3ff', '#0033ff', '#00d92f', '#ff7a00', '#ff0040'];

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('chart-style');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.neon === 'boolean') setNeon(parsed.neon);
        if (typeof parsed.gradient === 'boolean') setGradient(parsed.gradient);
        if (Array.isArray(parsed.colors)) setColors(parsed.colors);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('chart-style', JSON.stringify({ neon, gradient, colors }));
  }, [neon, gradient, colors]);

  const value = useMemo(() => ({ neon, gradient, colors, setNeon, setGradient, setColors }), [neon, gradient, colors]);

  return (
    <ChartStyleContext.Provider value={value}>{children}</ChartStyleContext.Provider>
  );
};


