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
  donut?: boolean;
  neon?: boolean;
  chartKey?: string;
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
  donut = true,
  neon = true,
  chartKey,
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          {neon && (
            <defs>
              <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={donut ? Math.max(innerRadius, outerRadius * 0.5) : innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            filter={neon ? 'url(#pieGlow)' : undefined}
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
              align="center"
              content={(props: any) => {
                // Alinhar cores da legenda com as do gráfico
                const payload = (props?.payload || []) as Array<{ value: string; color: string; dataKey?: string; payload?: any; }>; 
                return (
                  <div className="w-full px-2 py-1">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                      {payload.map((entry, idx) => (
                        <li key={idx} className="flex items-center gap-2 min-w-0">
                          <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color || colors[idx % colors.length] }} />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 whitespace-normal break-words leading-snug" title={entry.value}>
                            {entry.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};




