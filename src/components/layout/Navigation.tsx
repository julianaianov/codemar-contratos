'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  HeartIcon,
  BriefcaseIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Receitas', href: '/receitas', icon: CurrencyDollarIcon },
  { name: 'Despesas', href: '/despesas', icon: ChartBarIcon },
  { name: 'Pessoal', href: '/pessoal', icon: UsersIcon },
  { name: 'Contratos', href: '/contratos', icon: DocumentTextIcon },
  { name: 'Patrimônio', href: '/patrimonio', icon: BuildingOfficeIcon },
  { name: 'Educação', href: '/educacao', icon: AcademicCapIcon },
  { name: 'Saúde', href: '/saude', icon: HeartIcon },
  { name: 'Obras', href: '/obras', icon: BriefcaseIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200">
      <div className="px-4 py-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">e-Cidade</h1>
            <p className="text-sm text-gray-500">Portal de Transparência</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};



