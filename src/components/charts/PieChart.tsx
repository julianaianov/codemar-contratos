import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartData } from '@/types/ecidade';

interface PieChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  showLegend?: boolean;
  colors?: string[];
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
  className,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number, total: number) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  // Transformar dados para o formato do PieChart
  const pieData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0]?.data[index] || 0,
  }));

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              formatTooltipValue(value),
              name,
              formatPercentage(value, total)
            ]}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

