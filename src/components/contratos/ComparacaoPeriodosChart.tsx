'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ComparacaoPeriodosChartProps {
  periodos?: string[];
  empenhado?: number[];
  liquidado?: number[];
  pago?: number[];
  loading?: boolean;
}

export const ComparacaoPeriodosChart: React.FC<ComparacaoPeriodosChartProps> = ({
  periodos = [],
  empenhado = [],
  liquidado = [],
  pago = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  // Converter dados para o formato esperado pelo Recharts
  const chartData = periodos.map((periodo, index) => ({
    periodo,
    empenhado: empenhado[index] || 0,
    liquidado: liquidado[index] || 0,
    pago: pago[index] || 0,
  }));

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="w-full h-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
          <defs>
            <linearGradient id="empenhadoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="liquidadoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pagoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="periodo" 
            stroke="#6b7280"
            fontSize={10}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            tickFormatter={(value) => formatTooltipValue(value)}
            stroke="#6b7280"
            fontSize={10}
            tick={{ fontSize: 10 }}
            width={50}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatTooltipValue(value), name]}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="empenhado"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            fill="url(#empenhadoGradient)"
          />
          <Line
            type="monotone"
            dataKey="liquidado"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            fill="url(#liquidadoGradient)"
          />
          <Line
            type="monotone"
            dataKey="pago"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
            fill="url(#pagoGradient)"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

