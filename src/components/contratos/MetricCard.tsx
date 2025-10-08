'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'orange' | 'yellow' | 'blue' | 'indigo' | 'purple';
  loading?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

const colorClasses = {
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  orange: 'bg-orange-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  blue: 'bg-blue-500 text-white',
  indigo: 'bg-indigo-500 text-white',
  purple: 'bg-purple-500 text-white',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
  loading = false,
  onClick,
  clickable = false
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 dark:bg-secondary-900 dark:border-secondary-800 p-6 shadow-md rounded-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${colorClasses[color]} p-3 sm:p-4 rounded-lg shadow-md ${clickable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium opacity-90 mb-1 truncate">
            {title}
          </h3>
          <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
            {value.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs opacity-90 truncate">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0 ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
};
