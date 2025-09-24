import React from 'react';
import { motion } from 'framer-motion';
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

  const getChangeStyles = () => {
    switch (changeType) {
      case 'positive':
        return {
          // Verde sólido em ambos os modos
          text: 'text-green-900 dark:text-white',
          bg: 'bg-green-500 dark:bg-green-600',
          ring: 'ring-green-500 dark:ring-green-400',
          gradient: '',
        };
      case 'negative':
        return {
          // Vermelho sólido em ambos os modos
          text: 'text-red-900 dark:text-white',
          bg: 'bg-red-500 dark:bg-red-600',
          ring: 'ring-red-500 dark:ring-red-400',
          gradient: '',
        };
      default:
        return {
          text: 'text-gray-700 dark:text-gray-300',
          bg: 'bg-gray-100 dark:bg-white/10',
          ring: 'ring-gray-200 dark:ring-white/20',
          gradient: '',
        };
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-700 dark:text-green-300" />;
    }
    if (changeType === 'negative') {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-700 dark:text-red-300" />;
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

  const changeStyles = getChangeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={clsx('group relative overflow-hidden hover:shadow-lg transition-all duration-200 rounded-xl dark:bg-secondary-800 dark:border-secondary-700', className)}>
        <span className="pointer-events-none absolute inset-x-0 -top-1 h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-brand" />
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate">{title}</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-2 leading-7 whitespace-nowrap text-[clamp(18px,2.2vw,22px)]">
                {formatValue(value)}
              </p>
              {change !== undefined && (
                <motion.div
                  key={`badge-${title}`}
                  initial={{ opacity: 0, scale: 0.85, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 0.8 }}
                  className={clsx(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ring-1 shadow-sm',
                    changeStyles.bg,
                    changeStyles.text,
                    changeStyles.ring,
                    changeStyles.gradient
                  )}
                >
                  {getChangeIcon()}
                  <span className="ml-1">{formatChange(change)}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">vs mês anterior</span>
                </motion.div>
              )}
            </div>
            {icon && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-80 transition-opacity bg-gradient-brand" />
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-blue-300 flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
                    {icon}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
