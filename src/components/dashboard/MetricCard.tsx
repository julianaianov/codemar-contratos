import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { clsx } from 'clsx';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
  loading = false,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val);
    }
    return val;
  };

  const formatChange = (changeValue: number) => {
    const sign = changeValue >= 0 ? '+' : '';
    return `${sign}${changeValue.toFixed(1)}%`;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <ArrowTrendingUpIcon className="w-4 h-4" />;
    }
    if (changeType === 'negative') {
      return <ArrowTrendingDownIcon className="w-4 h-4" />;
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={clsx('animate-pulse', className)}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={clsx('hover:shadow-lg transition-shadow duration-200', className)}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <div className={clsx('flex items-center text-sm', getChangeColor())}>
                {getChangeIcon()}
                <span className="ml-1">{formatChange(change)}</span>
                <span className="ml-1 text-gray-500">vs mês anterior</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
