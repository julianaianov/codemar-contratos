'use client';

import { useState, useEffect } from 'react';

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar se o chat estava aberto na sessão anterior
    const wasOpen = localStorage.getItem('chat-widget-open');
    if (wasOpen === 'true') {
      setIsOpen(true);
    }

    // Escutar evento para abrir chat do header
    const handleOpenChat = () => {
      setIsOpen(true);
      localStorage.setItem('chat-widget-open', 'true');
    };

    window.addEventListener('openChatWidget', handleOpenChat);

    return () => {
      window.removeEventListener('openChatWidget', handleOpenChat);
    };
  }, []);

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('chat-widget-open', newState.toString());
  };

  const openChat = () => {
    setIsOpen(true);
    localStorage.setItem('chat-widget-open', 'true');
  };

  const closeChat = () => {
    setIsOpen(false);
    localStorage.setItem('chat-widget-open', 'false');
  };

  return {
    isOpen,
    toggleChat,
    openChat,
    closeChat
  };
}
