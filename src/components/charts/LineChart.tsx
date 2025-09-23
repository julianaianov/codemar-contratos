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
import { TimeSeriesData } from '@/types/ecidade';

interface LineChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  strokeWidth?: number;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
  strokeWidth = 2,
  className,
}) => {
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatXAxisLabel = (label: string) => {
    return new Date(label).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => formatTooltipValue(value)}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip
            formatter={(value: number) => [formatTooltipValue(value), 'Valor']}
            labelFormatter={(label) => formatXAxisLabel(label)}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors[0]}
            strokeWidth={strokeWidth}
            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

