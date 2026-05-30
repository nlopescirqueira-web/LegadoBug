'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import { useRouter } from 'next/navigation';
import SmartImport from '@/components/SmartImport';

export default function BulkPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { refreshTotalQuestions } = useStudy();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading) return null;
  if (!isAdmin) return null;

  return (
    <div className="p-8 md:p-20 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Gerador de Questões em Massa</h1>
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl">
          <SmartImport onComplete={() => {
            refreshTotalQuestions();
          }} />
        </div>
      </div>
    </div>
  );
}
