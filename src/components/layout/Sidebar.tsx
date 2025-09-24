"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  HeartIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Financeiro', href: '/financeiro', icon: CurrencyDollarIcon },
  { name: 'Tributário', href: '/tributario', icon: ChartBarIcon },
  { name: 'Educação', href: '/educacao', icon: AcademicCapIcon },
  { name: 'Saúde', href: '/saude', icon: HeartIcon },
  { name: 'Recursos Humanos', href: '/recursos-humanos', icon: UsersIcon },
  { name: 'Patrimonial', href: '/patrimonial', icon: BuildingOfficeIcon },
  { name: 'Relatórios', href: '/relatorios', icon: ClipboardDocumentListIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Implementar logout
    router.push('/login');
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 text-white shadow-lg transform transition-transform duration-300 ease-in-out bg-secondary-900 dark:bg-[#0f172a] border-r border-transparent dark:border-secondary-800',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-secondary-900 lg:hidden">
          <div className={clsx('flex items-center', collapsed ? 'justify-center' : '')}>
            <img src="/logo-codemar.svg" alt="CODEMAR" className={clsx('h-10 w-10', collapsed ? '' : 'h-14 w-14')} />
            {!collapsed && (
              <span className="ml-3 text-lg font-semibold text-white">e-Cidade Dashboard</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className={clsx('mt-8', collapsed ? 'px-2' : 'px-4')}>
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'relative group flex items-center py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 active:bg-white/30',
                    collapsed ? 'justify-center' : 'px-3',
                    isActive ? 'bg-white/90 text-blue-900 shadow-sm dark:bg-white/20 dark:text-white' : 'text-white/90 hover:bg-white/20 hover:text-white'
                  )}
                  onClick={onClose}
                >
                  {!collapsed && (
                    <span
                      className={clsx(
                        'absolute left-0 top-0 h-full w-1.5 rounded-r-md transition-opacity duration-200 bg-gradient-brand',
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                      )}
                    />
                  )}
                  <item.icon
                    className={clsx(
                      'h-5 w-5 flex-shrink-0 transition-colors duration-200',
                      collapsed ? '' : 'mr-3',
                      isActive ? 'text-blue-700' : 'text-white/80 group-hover:text-white'
                    )}
                  />
                  {!collapsed && (
                    <span className="transition-colors duration-200">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={clsx('absolute bottom-0 left-0 right-0 border-t border-white/20', collapsed ? 'p-2' : 'p-4')}>
          <button
            onClick={handleLogout}
            className={clsx(
              'w-full flex items-center text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-colors duration-200',
              collapsed ? 'justify-center py-2' : 'px-3 py-2'
            )}
          >
            <ArrowRightOnRectangleIcon className={clsx('h-5 w-5 text-white/70', collapsed ? '' : 'mr-3')} />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </div>
    </>
  );
};
