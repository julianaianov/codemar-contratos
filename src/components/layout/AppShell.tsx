'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QueryClient, QueryClientProvider } from 'react-query';
import GlobalAISearch from '@/components/ai/GlobalAISearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import ChatWidget from '@/components/ai/ChatWidget';
import { useChatWidget } from '@/hooks/useChatWidget';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile overlay
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const { isOpen: isSearchOpen, closeSearch } = useGlobalSearch();
  const { isOpen: isChatOpen, toggleChat } = useChatWidget();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
        />
        <Header 
          onMenuClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              setSidebarCollapsed(!sidebarCollapsed);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          leftPaddingClass={sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
        />
        <div className={`${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} pt-[80px]`}>
          <main className="p-2 sm:p-3 md:p-4 bg-transparent">
            <div className="mx-auto w-full max-w-full overflow-x-hidden">{children}</div>
          </main>
        </div>

        {/* Global AI Search Modal */}
        <GlobalAISearch isOpen={isSearchOpen} onClose={closeSearch} />
        
        {/* Chat Widget */}
        <ChatWidget isOpen={isChatOpen} onToggle={toggleChat} />
      </div>
    </QueryClientProvider>
  );
}