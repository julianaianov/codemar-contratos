import React from 'react';
import { ChartData } from '@/types/ecidade';

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
  
  // Calcular dimensões do gráfico responsivas
  const chartWidth = Math.max(1200, data.labels.length * 40); // Aumentar espaço por label
  const chartHeight = height - 120;
  const barSpacing = 20; // Aumentar espaçamento entre barras
  const barWidth = Math.max(20, (chartWidth / data.labels.length) - barSpacing);
  
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}
      <div className="overflow-x-auto w-full">
        <svg width={chartWidth} height={height} viewBox={`0 0 ${chartWidth} ${height + 50}`} className="min-w-full">
          <defs>
            {/* Gradientes para cada barra */}
            {dataset.data.map((_, index) => (
              <linearGradient id={`gradient-${index}`} key={index} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                <stop offset="50%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.4} />
              </linearGradient>
            ))}
            {neon && (
              <filter id="barGlowIntense" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Grid */}
          {showGrid && (
            <g>
              {/* Linhas horizontais */}
              {Array.from({ length: 6 }, (_, i) => {
                const y = 50 + (chartHeight / 5) * i;
                return (
                  <line
                    key={`h-${i}`}
                    x1={50}
                    y1={y}
                    x2={chartWidth - 50}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-300 dark:text-gray-600"
                    strokeDasharray="3,3"
                  />
                );
              })}
            </g>
          )}

          {/* Barras */}
          {dataset.data.map((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const barAreaWidth = chartWidth / data.labels.length;
            const x = 50 + barAreaWidth * index + (barAreaWidth - barWidth) / 2; // Centralizar barra na área
            const y = 50 + chartHeight - barHeight;
            const color = colors[index % colors.length];
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={gradient ? `url(#gradient-${index})` : color}
                  filter={neon ? 'url(#barGlowIntense)' : undefined}
                  rx="4"
                  ry="4"
                />
              </g>
            );
          })}

          {/* Labels do eixo X */}
          {data.labels.map((label, index) => {
            const x = 50 + (chartWidth / data.labels.length) * index + (chartWidth / data.labels.length) / 2;
            const y = 50 + chartHeight + 30; // Aumentar espaço para labels
            
            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                className="text-xs fill-current text-gray-600 dark:text-gray-200"
                transform={`rotate(-45, ${x}, ${y})`}
              >
                {label}
              </text>
            );
          })}

          {/* Labels do eixo Y */}
          {Array.from({ length: 6 }, (_, i) => {
            const value = (maxValue / 5) * (5 - i);
            const y = 50 + (chartHeight / 5) * i;
            
            return (
              <text
                key={i}
                x={40}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-current text-gray-600 dark:text-gray-200"
              >
                {formatTooltipValue(value)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};