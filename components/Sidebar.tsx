'use client';

import React from 'react';
import Image from 'next/image';
import { 
  PlayCircle,
  LayoutDashboard, 
  Timer, 
  Trophy, 
  BookOpen, 
  Layers,
  TrendingUp,
  Calendar,
  User, 
  Settings,
  LogOut,
  Shield,
  Award,
  Star,
  Medal,
  Crown,
  Zap,
  Target,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const { getRank, getRankIcon, getRankProgress, allTimeSeconds } = useStudy();
  
  const currentRank = getRank(allTimeSeconds);
  const currentRankIcon = getRankIcon(allTimeSeconds);
  const rankProgress = getRankProgress(allTimeSeconds);

  const getRankInsignia = (rank: string) => {
    return (
      <div className="relative w-3 h-3">
        <Image 
          src={currentRankIcon} 
          alt={rank} 
          fill 
          priority
          loading="eager"
          className="object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  const menuItems = [
    { id: 'painel', label: 'Painel', icon: LayoutDashboard },
    { id: 'cronometro', label: 'Cronômetro', icon: Timer },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'questoes', label: 'Questões', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'simulados', label: 'Simulados', icon: Target },
    { id: 'desempenho', label: 'Desempenho', icon: TrendingUp },
    { id: 'cronograma', label: 'Cronograma', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'tutorial', label: 'Tutorial', icon: PlayCircle },
  ];

  const footerItems = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#050505] border-r border-white/10 flex-col h-screen fixed left-0 top-0 transition-colors duration-300 overflow-y-auto no-scrollbar">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 overflow-hidden rounded-lg flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.imgur.com/Ww70Xrl.jpeg"
              alt="Legado Militar Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Legado Militar</h1>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menuItems
            .filter(item => item.id !== 'tutorial' || isAdmin)
            .map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-[#3B82F6]/10 text-[#3B82F6]" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-[#3B82F6] rounded-r-full"
                />
              )}
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-[#3B82F6]" : "text-white/50 group-hover:text-white"
              )} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {user && (
            <div className="px-4 py-4 mb-2 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                  {user.photo && (user.photo.startsWith('http') || user.photo.startsWith('/')) ? (
                    <Image 
                      src={user.photo} 
                      alt={user.name} 
                      fill 
                      priority
                      loading="eager"
                      className="object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white/40">{user.name?.charAt(0).toUpperCase() || 'S'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {getRankInsignia(currentRank)}
                    <p className="text-[9px] text-[#3B82F6] font-black uppercase tracking-[0.2em] truncate">{currentRank}</p>
                  </div>
                  <p className="text-sm font-bold text-white truncate leading-tight">{user.name}</p>
                </div>
              </div>

              {/* Sidebar XP Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] uppercase font-black tracking-widest">
                  <span className="text-white/20">Progresso XP</span>
                  <span className="text-[#3B82F6]">{Math.floor(rankProgress.progress)}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#3B82F6]"
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {footerItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-[#3B82F6]/10 text-[#3B82F6]" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTabFooter"
                  className="absolute left-0 w-1 h-6 bg-[#3B82F6] rounded-r-full"
                />
              )}
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-[#3B82F6]" : "text-white/50 group-hover:text-white"
              )} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#FF0033]/70 hover:text-[#FF0033] hover:bg-[#FF0033]/5 transition-all duration-200 group"
          >
            <LogOut size={20} />
            <span className="font-bold">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-white/10 flex flex-col z-50 backdrop-blur-lg transition-colors duration-300">
        {/* Mobile XP Bar */}
        <div className="h-1 w-full bg-white/5 overflow-hidden">
          <motion.div 
            className="h-full bg-[#3B82F6]"
            initial={{ width: 0 }}
            animate={{ width: `${rankProgress.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="px-2 py-2 flex items-center overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1 min-w-full px-2">
            {[...menuItems, ...footerItems]
              .filter(item => item.id !== 'tutorial' || isAdmin)
              .map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 flex-shrink-0 min-w-[72px]",
                  activeTab === item.id 
                    ? "text-white bg-white/5" 
                    : "text-white/40"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  activeTab === item.id ? "text-white" : "text-white/40"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
            ))}
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-red-500/70 active:text-red-500 active:bg-red-500/5 transition-all duration-200 flex-shrink-0 min-w-[72px]"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Sair</span>
            </button>
          </div>
        </div>
    </nav>
    </>
  );
}
