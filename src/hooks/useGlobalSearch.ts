'use client';

import { useState, useEffect } from 'react';

export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => {
      setIsOpen(true);
    };

    const handleCloseSearch = () => {
      setIsOpen(false);
    };

    // Escutar eventos customizados para abrir/fechar busca
    window.addEventListener('openGlobalSearch', handleOpenSearch);
    window.addEventListener('closeGlobalSearch', handleCloseSearch);

    return () => {
      window.removeEventListener('openGlobalSearch', handleOpenSearch);
      window.removeEventListener('closeGlobalSearch', handleCloseSearch);
    };
  }, []);

  const openSearch = () => {
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openSearch,
    closeSearch
  };
}


