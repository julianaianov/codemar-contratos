"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  MapIcon,
  ShieldCheckIcon,
  TruckIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  DocumentPlusIcon,
  DocumentCheckIcon,
  PencilSquareIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  CogIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

const navigation = [
  { name: 'Transparência', href: '/', icon: EyeIcon },
  { name: 'Todos os Apps', href: '/apps', icon: Squares2X2Icon },
  { name: 'Consulta', href: '/consulta/contratos', icon: MagnifyingGlassIcon },
  { name: 'Importação', href: '/importacao', icon: ArrowDownTrayIcon },
  { name: 'Cadastros', href: '/cadastros', icon: FolderIcon },
  { name: 'Mapa de Contratos', href: '/mapa-contratos', icon: MapIcon },
  { name: 'Fiscalização', href: '/fiscalizacao', icon: ShieldCheckIcon },
  { name: 'Fornecimento', href: '/fornecimento', icon: TruckIcon },
  { name: 'PNCP', href: '/pncp', icon: GlobeAltIcon },
  { name: 'Riscos', href: '/riscos', icon: ExclamationTriangleIcon },
  { name: 'Geração de Contratos', href: '/geracao-contratos', icon: DocumentPlusIcon },
  { name: 'Ata Registro de Preço', href: '/ata-registro-preco', icon: DocumentCheckIcon },
  { name: 'Assinatura Eletrônica', href: '/assinatura-eletronica', icon: PencilSquareIcon },
  { name: 'Terceirização', href: '/tercerizacao', icon: UserGroupIcon },
  { name: 'Relatórios', href: '/relatorios', icon: DocumentChartBarIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Implementar logout
    router.push('/login');
  };

  const isItemActive = (item: any) => {
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
          'fixed inset-y-0 left-0 z-50 text-white shadow-lg transform transition-transform duration-300 ease-in-out bg-[#0091ff] dark:bg-[#0f172a] border-r border-transparent dark:border-secondary-800 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className={clsx('', collapsed ? 'px-2' : 'px-4')}>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = isItemActive(item);
                
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
        </div>

        {/* Rodapé Fixo */}
        <div className="border-t border-white/20 mt-auto flex-shrink-0">
          <div className={clsx('p-2', collapsed ? 'px-2' : 'px-3')}>
            {/* Logo */}
            <div className="flex items-center justify-center mb-2">
              <img
                src="/logo-codemar.png"
                alt="CODEMAR"
                className={clsx('rounded hidden dark:block', collapsed ? 'h-6 w-6' : 'h-10 w-10')}
              />
              <img
                src="/logo-codemar-branca.png"
                alt="CODEMAR"
                className={clsx('rounded block dark:hidden', collapsed ? 'h-6 w-6' : 'h-10 w-10')}
              />
            </div>
            
            {/* Botão Sair */}
            <button
              onClick={handleLogout}
              className={clsx(
                'w-full flex items-center text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-colors duration-200',
                collapsed ? 'justify-center py-1' : 'px-3 py-1'
              )}
            >
              <ArrowRightOnRectangleIcon className={clsx('h-4 w-4 text-white/70', collapsed ? '' : 'mr-2')} />
              {!collapsed && 'Sair'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
