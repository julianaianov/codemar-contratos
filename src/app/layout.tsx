import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { ChartStyleProvider } from '@/components/layout/ChartStyleProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Contratos CODEMAR',
  description: 'Sistema de gestão de contratos da CODEMAR',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider>
          <ChartStyleProvider>
            <AppShell>{children}</AppShell>
          </ChartStyleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}




