"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/layout/ThemeProvider';
import { clsx } from 'clsx';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
  leftPaddingClass?: string; // e.g., 'lg:pl-64' or 'lg:pl-16'
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, leftPaddingClass = 'lg:pl-64' }) => {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleOpenGlobalSearch = () => {
    const event = new CustomEvent('openGlobalSearch');
    window.dispatchEvent(event);
  };

  return (
    <header className={`text-white shadow-sm border-b border-transparent fixed top-0 inset-x-0 z-40 ${leftPaddingClass} bg-[#0091ff] dark:bg-[#111827]`}>
      <div className="flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="p-1.5 sm:p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 flex-shrink-0"
          >
            <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="ml-2 sm:ml-4 lg:ml-0 flex items-center min-w-0">
            <Image
              src={theme === 'dark' ? '/logo-contratos.png' : '/contrato-claro.png'}
              alt="CODEMAR Contratos"
              width={112}
              height={112}
              className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 flex-shrink-0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 text-sm rounded-md bg-white/10 hover:bg-white/20 text-white"
            aria-label="Alternar tema"
            title={`Tema: ${theme === 'dark' ? 'Escuro' : 'Claro'}`}
          >
            <span className="text-sm sm:text-base">{theme === 'dark' ? '☾' : '☀'}</span>
          </button>
          
                    {/* AI Search Button */}
                    <button
                      onClick={handleOpenGlobalSearch}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors duration-200"
                      title="Busca Inteligente (Ctrl+K)"
                    >
                      <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline text-xs sm:text-sm">Busca IA</span>
                      <span className="hidden lg:inline text-xs opacity-70">Ctrl+K</span>
                    </button>

          {/* Notifications */}
          <button className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md">
            <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#0091ff]"
            >
              <UserCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0" />
              <span className="ml-1 sm:ml-2 text-white font-medium text-xs sm:text-sm truncate max-w-12 sm:max-w-16 md:max-w-none hidden xs:inline">Usuário</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Meu Perfil
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Configurações
                </a>
                <div className="border-t border-gray-100"></div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sair
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Linha inferior com degradê */}
      <div className="h-1 w-full bg-gradient-brand" />
    </header>
  );
};

