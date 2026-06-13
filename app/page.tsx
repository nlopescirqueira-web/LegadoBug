'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Timer from '@/components/Timer';
import Ranking from '@/components/Ranking';
import Questions from '@/components/Questions';
import Profile from '@/components/Profile';
import Settings from '@/components/Settings';
import Flashcards from '@/components/Flashcards';
import Performance from '@/components/Performance';
import Schedule from '@/components/Schedule';
import Tutorial from '@/components/Tutorial';
import Simulados from '@/components/Simulados';
import Feedback from '@/components/Feedback';
import AuthPage from '@/components/AuthPage';
import { AnimatePresence, motion } from 'motion/react';
import { StudyProvider } from '@/context/StudyContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ImprovementProvider, useImprovement } from '@/context/ImprovementContext';
import ImprovementWidget from '@/components/ImprovementWidget';
import AprimoramentoModal from '@/components/AprimoramentoModal';

export default function Home() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { isModalOpen, setIsModalOpen } = useImprovement();
  const [activeTab, setActiveTab] = useState('painel');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <TabContent activeTab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>

      <ImprovementWidget onOpenDetails={() => setIsModalOpen(true)} />
      <AprimoramentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}

function TabContent({ activeTab }: { activeTab: string }) {
  const { isAdmin } = useAuth();
  
  switch (activeTab) {
    case 'painel':
      return <Dashboard />;
    case 'cronometro':
      return <Timer />;
    case 'ranking':
      return <Ranking />;
    case 'questoes':
      return <Questions />;
    case 'flashcards':
      return <Flashcards />;
    case 'desempenho':
      return <Performance />;
    case 'cronograma':
      return <Schedule />;
    case 'simulados':
      return <Simulados />;
    case 'feedback':
      return <Feedback />;
    case 'tutorial':
      return isAdmin ? <Tutorial /> : <Dashboard />;
    case 'perfil':
      return <Profile />;
    case 'configuracoes':
      return <Settings />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-black/50 dark:text-white/50">
          Seção em desenvolvimento: {activeTab}
        </div>
      );
  }
}
