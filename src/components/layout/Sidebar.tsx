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
  ChevronDownIcon,
  EyeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

const navigation = [
  { name: 'Transparência', href: '/', icon: EyeIcon },
  { 
    name: 'Consulta', 
    href: '/consulta', 
    icon: DocumentTextIcon,
    submenu: [
      { name: 'Contratos', href: '/consulta/contratos', icon: ClipboardDocumentListIcon },
      { name: 'Instrumentos de Cobrança', href: '/consulta/cobranca', icon: CreditCardIcon },
      { name: 'Terceirizados', href: '/consulta/terceirizados', icon: UserGroupIcon },
    ]
  },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = () => {
    // Implementar logout
    router.push('/login');
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: any) => {
    if (item.submenu) {
      return item.submenu.some((subItem: any) => pathname === subItem.href);
    }
    return pathname === item.href;
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
          'fixed inset-y-0 left-0 z-50 text-white shadow-lg transform transition-transform duration-300 ease-in-out bg-[#0091ff] dark:bg-[#0f172a] border-r border-transparent dark:border-secondary-800',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-[#0091ff] dark:bg-[#0f172a] lg:hidden">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-white">Menu</span>
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
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.name);
              
              if (item.submenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => !collapsed && toggleExpanded(item.name)}
                      className={clsx(
                        'relative group flex items-center py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 active:bg-white/30 w-full',
                        collapsed ? 'justify-center' : 'px-3',
                        isActive ? 'bg-white/90 text-blue-900 shadow-sm dark:bg-white/20 dark:text-white' : 'text-white/90 hover:bg-white/20 hover:text-white'
                      )}
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
                        <>
                          <span className="transition-colors duration-200 flex-1 text-left">{item.name}</span>
                          <ChevronDownIcon
                            className={clsx(
                              'h-4 w-4 transition-transform duration-200',
                              isExpanded ? 'rotate-180' : ''
                            )}
                          />
                        </>
                      )}
                    </button>
                    
                    {!collapsed && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={clsx(
                                'flex items-center py-2 px-3 text-sm rounded-md transition-colors duration-200',
                                isSubActive 
                                  ? 'bg-white/20 text-white' 
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              )}
                              onClick={onClose}
                            >
                              <subItem.icon className="h-4 w-4 mr-3" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
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
          
          {/* Logo abaixo de Configurações */}
          <div className={clsx('flex items-center justify-center', collapsed ? 'mt-4' : 'mt-6')}>
            <img
              src="/logo-codemar.png"
              alt="CODEMAR"
              className={clsx('rounded hidden dark:block', collapsed ? 'h-10 w-10' : 'h-16 w-16')}
            />
            <img
              src="/logo-codemar-branca.png"
              alt="CODEMAR"
              className={clsx('rounded block dark:hidden', collapsed ? 'h-10 w-10' : 'h-16 w-16')}
            />
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
