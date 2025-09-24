"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
  leftPadded?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, leftPadded = true }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className={`bg-[#0091ff] text-white shadow-sm border-b border-transparent fixed top-0 inset-x-0 z-40 ${leftPadded ? 'lg:pl-64' : 'lg:pl-0'}`}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="ml-4 lg:ml-0 flex items-center">
            <Image src="/logo-codemar.svg" alt="CODEMAR" width={56} height={56} className="h-14 w-14" />
            <h1 className="ml-3 text-xl font-semibold text-white">Dashboard e-Cidade</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-white/80" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-md leading-5 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:placeholder-white focus:ring-1 focus:ring-white focus:border-white sm:text-sm"
              />
            </div>
          </div>

          {/* Notifications */}
          <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md">
            <BellIcon className="w-6 h-6" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#0091ff]"
            >
              <UserCircleIcon className="w-8 h-8 text-white/80" />
              <span className="ml-2 text-white font-medium">Usuário</span>
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

