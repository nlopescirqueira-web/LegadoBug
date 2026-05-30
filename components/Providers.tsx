'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { StudyProvider } from '@/context/StudyContext';
import { ImprovementProvider } from '@/context/ImprovementContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StudyProvider>
          <ImprovementProvider>
            {children}
          </ImprovementProvider>
        </StudyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
