import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '@/types/ecidade';

interface BarChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  className,
}) => {
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data.labels.map((label, index) => ({
          name: label,
          ...data.datasets.reduce((acc, dataset, datasetIndex) => ({
            ...acc,
            [dataset.label]: dataset.data[index],
          }), {}),
        }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => formatTooltipValue(value)}
            stroke="#6b7280"
            fontSize={12}
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
          {showLegend && <Legend />}
          {data.datasets.map((dataset, index) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

