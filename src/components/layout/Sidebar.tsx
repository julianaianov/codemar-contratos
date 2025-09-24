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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0091ff] text-white shadow-lg transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-64'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-[#0091ff]">
          <div className="flex items-center">
            <img src="/logo-codemar.svg" alt="CODEMAR" className="h-14 w-14" />
            <span className="ml-3 text-lg font-semibold text-white">e-Cidade Dashboard</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive ? 'bg-white/80 text-blue-900' : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-700' : 'text-white/70 group-hover:text-white'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-white/70" />
            Sair
          </button>
        </div>
      </div>
    </>
  );
};
