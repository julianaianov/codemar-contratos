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
import { IndividualColorBarChart } from './IndividualColorBarChart';

interface BarChartProps {
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
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
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
  horizontal = false,
}) => {
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Verificar se devemos usar cores individuais (quando há muitas cores na paleta)
  const useIndividualColors = colors.length > 5;

  // Se usar cores individuais, usar componente customizado
  if (useIndividualColors) {
    return (
      <IndividualColorBarChart
        data={data}
        title={title}
        height={height}
        showLegend={showLegend}
        showGrid={showGrid}
        colors={colors}
        className={className}
        gradient={gradient}
        neon={neon}
        chartKey={chartKey}
      />
    );
  }

  return (
    <div className={`w-full h-full overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={data?.labels?.map((label, index) => ({
            name: label,
            ...data.datasets?.reduce((acc, dataset, datasetIndex) => ({
              ...acc,
              [dataset.label]: dataset.data[index],
            }), {}),
          })) || []} 
          margin={horizontal ? { top: 10, right: 60, left: 10, bottom: 10 } : { top: 40, right: 30, left: 60, bottom: 80 }}
          layout={horizontal ? "horizontal" : "vertical"}
          barCategoryGap="20%"
        >
          {gradient && (
            <defs>
              {data?.datasets?.map((ds, i) => (
                <linearGradient id={`barGradient-${i}`} key={i} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0.2} />
                </linearGradient>
              ))}
              {neon && (
                <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              )}
            </defs>
          )}
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-300 dark:text-gray-600" />}
          {horizontal ? (
            <>
              <XAxis 
                type="number"
                tickFormatter={(value) => formatTooltipValue(value)}
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-200"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-200"
                fontSize={11}
                width={60}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey="name" 
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-200"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => formatTooltipValue(value)}
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-200"
                fontSize={12}
              />
            </>
          )}
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
          {data?.datasets?.map((dataset, index) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={gradient ? `url(#barGradient-${index})` : colors[index % colors.length]}
              radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              filter={neon ? 'url(#barGlow)' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

