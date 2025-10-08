import React from 'react';
import { ChartData } from '@/types/ecidade';
import { ResponsiveContainer } from 'recharts';

interface IndividualColorBarChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  className?: string;
  gradient?: boolean;
  neon?: boolean;
  chartKey?: string;
}

export const IndividualColorBarChart: React.FC<IndividualColorBarChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  className,
  gradient = true,
  neon = true,
  chartKey,
}) => {
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!data?.datasets?.[0] || !data?.labels) {
    return <div className="text-center text-gray-500">Nenhum dado disponível</div>;
  }

  const dataset = data.datasets[0];
  const maxValue = Math.max(...dataset.data);
  
  // Usar o mesmo sistema do BarChart tradicional - ResponsiveContainer
  const chartData = data?.labels?.map((label, index) => ({
    name: label,
    value: dataset.data[index],
  })) || [];

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <svg width="100%" height={height}>
          <defs>
            {/* Gradientes para cada barra */}
            {dataset.data.map((_, index) => (
              <linearGradient id={`gradient-${index}`} key={index} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.2} />
              </linearGradient>
            ))}
            {neon && (
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Renderizar usando o mesmo sistema do BarChart tradicional */}
          {chartData.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 100);
            const barWidth = Math.max(20, (100 / chartData.length) * 0.8);
            const x = (100 / chartData.length) * index + (100 / chartData.length) * 0.1;
            const y = 50 + (height - 100) - barHeight;
            const color = colors[index % colors.length];
            
            return (
              <g key={index}>
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${barWidth}%`}
                  height={barHeight}
                  fill={gradient ? `url(#gradient-${index})` : color}
                  filter={neon ? 'url(#neonGlow)' : undefined}
                  rx="4"
                  ry="4"
                />
              </g>
            );
          })}
        </svg>
      </ResponsiveContainer>
    </div>
  );
};