'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QueryClient, QueryClientProvider } from 'react-query';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile overlay
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

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
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={!sidebarCollapsed || sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Header 
          onMenuClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              setSidebarCollapsed(!sidebarCollapsed);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          leftPadded={!sidebarCollapsed}
        />
        <div className={`${!sidebarCollapsed ? 'lg:pl-64' : 'lg:pl-0'} pt-[68px]`}>
          <main className="p-4 sm:p-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}


