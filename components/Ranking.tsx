'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Clock, 
  RefreshCw, 
  Trophy, 
  Medal, 
  Target, 
  Shield, 
  Zap, 
  Activity,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';

const PodiumItem = React.memo(({ user, isFirst, isSecond, onlineUserIds, studyingUserIds, getRank, getRankIcon }: {
  user: any,
  isFirst: boolean,
  isSecond: boolean,
  onlineUserIds: string[],
  studyingUserIds: string[],
  getRank: (seconds: number) => string,
  getRankIcon: (seconds: number) => string
}) => {
  const isThird = !isFirst && !isSecond;
  
  return (
    <div className={cn(
      "flex flex-col items-center flex-1 relative",
      isFirst ? "z-30 scale-110 sm:scale-100" : "z-10"
    )}>
      <div className={cn(
        "relative mb-2 sm:mb-4 transition-all duration-700",
        isFirst ? "w-24 h-24 sm:w-48 sm:h-48" : "w-20 h-20 sm:w-36 sm:h-36"
      )}>
        {/* Outer Ring Animation */}
        {isFirst && (
          <motion.div 
            className="absolute inset-[-12px] border border-[#D4AF37]/20 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Circular Border Container */}
        <div className={cn(
          "relative w-full h-full rounded-full p-1 sm:p-1.5 flex items-center justify-center shadow-2xl",
          isFirst ? "bg-gradient-to-b from-[#FFD700] via-[#D4AF37] to-[#FFD700]" : 
          isSecond ? "bg-gradient-to-b from-[#C0C0C0] to-[#708090]" : 
          "bg-gradient-to-b from-[#CD7F32] to-[#8B4513]"
        )}>
          <div className="relative w-full h-full rounded-full bg-[#0A0A0A] overflow-hidden flex items-center justify-center border-2 border-black/40">
            {user.photo && (user.photo.startsWith('http') || user.photo.startsWith('/')) ? (
              <Image 
                src={user.photo} 
                alt={user.name} 
                fill 
                priority={isFirst || isSecond}
                className="object-cover transition-all duration-500" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-white/90 text-xl sm:text-4xl font-black">
                {user.name?.charAt(0).toUpperCase() || 'S'}
              </span>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Online Status Indicator */}
          {onlineUserIds.includes(user.email) && (
            <div className={cn(
              "absolute top-2 right-2 w-3 h-3 sm:w-5 sm:h-5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20",
              studyingUserIds.includes(user.email) && "animate-pulse"
            )} />
          )}
        </div>
        
        {/* Rank Badge */}
        <div className={cn(
          "absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 px-3 sm:px-6 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center justify-center text-[8px] sm:text-xs font-black text-white border border-white/20 shadow-xl skew-x-[-10deg]",
          isFirst ? "bg-[#D4AF37] text-black" : isSecond ? "bg-[#C0C0C0] text-black" : "bg-[#CD7F32] text-black"
        )}>
          <span className="skew-x-[10deg] flex items-center gap-0.5 sm:gap-1">
            {isFirst && <Trophy size={10} className="sm:w-3 sm:h-3" />}
            {user.rank}º <span className="hidden sm:inline">LUGAR</span>
          </span>
        </div>
      </div>

      <div className="text-center mt-2 sm:mt-4 w-full px-1">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <p className={cn(
            "font-black text-[10px] sm:text-xl text-white tracking-tight truncate max-w-[70px] sm:max-w-[220px] uppercase",
            isFirst && "text-[#D4AF37]"
          )}>
            {user.name}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className={cn(
            "text-[9px] sm:text-lg font-black font-mono tracking-tighter mt-0.5",
            isFirst ? "text-[#D4AF37]" : "text-white/95"
          )}>
            {user.time}
          </p>
          <div className="flex items-center gap-1 text-[7px] sm:text-[10px] text-white/95 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
            <div className="relative w-2.5 h-2.5 sm:w-3 sm:h-3">
              <Image 
                src={getRankIcon(user.totalSeconds)} 
                alt="Rank" 
                fill 
                priority={isFirst || isSecond}
                className="object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="truncate max-w-[60px] sm:max-w-none">{getRank(user.totalSeconds)}</span>
          </div>
          <div className="h-[1px] w-4 sm:w-8 bg-white/30 mt-1" />
        </div>
      </div>
    </div>
  );
});

PodiumItem.displayName = 'PodiumItem';

const RankingRow = React.memo(({ user, isMe, onlineUserIds, studyingUserIds, i, isLast, getRank, getRankIcon }: { 
  user: any, 
  isMe: boolean, 
  onlineUserIds: string[], 
  studyingUserIds: string[],
  i: number,
  isLast: boolean,
  getRank: (seconds: number) => string,
  getRankIcon: (seconds: number) => string
}) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 sm:gap-8 p-3 sm:p-6 transition-all duration-300 hover:bg-white/[0.02] relative group",
        !isLast && "border-b border-white/5",
        isMe && "bg-[#3B82F6]/5 border-l-2 border-l-[#3B82F6]"
      )}
    >
      {/* Rank Number */}
      <div className="w-6 sm:w-12 text-center">
        <span className={cn(
          "font-black text-xs sm:text-xl font-mono",
          isMe ? "text-[#3B82F6]" : "text-white group-hover:text-white transition-colors"
        )}>
          {user.rank.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Avatar */}
      <div className="relative w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#0A0A0A] flex items-center justify-center font-bold text-xs sm:text-base overflow-hidden border border-white/10 group-hover:border-white/20 transition-all shrink-0">
        {user.photo && (user.photo.startsWith('http') || user.photo.startsWith('/')) ? (
          <Image 
            src={user.photo} 
            alt={user.name} 
            fill 
            priority={i < 5}
            className="object-cover transition-all duration-500" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-white/50 font-black">
            {user.name?.charAt(0).toUpperCase() || 'S'}
          </span>
        )}
        
        {onlineUserIds.includes(user.email) && (
          <div className={cn(
            "absolute bottom-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border border-black rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10",
            studyingUserIds.includes(user.email) && "animate-pulse"
          )} />
        )}
      </div>

      {/* Name & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <p className={cn(
            "font-black text-xs sm:text-lg truncate uppercase tracking-tight",
            isMe ? "text-[#3B82F6]" : "text-white group-hover:text-white transition-colors"
          )}>
            {user.name}
          </p>
          {isMe && (
            <span className="text-[7px] sm:text-[9px] bg-[#3B82F6] text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest skew-x-[-10deg] shrink-0">
              VOCÊ
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
          <div className="flex items-center gap-1 text-[7px] sm:text-[10px] text-white/90 font-bold uppercase tracking-widest truncate">
            <div className="relative w-2 h-2 sm:w-2.5 sm:h-2.5">
              <Image 
                src={getRankIcon(user.totalSeconds)} 
                alt="Rank" 
                fill 
                priority={i < 5}
                className="object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="truncate">{getRank(user.totalSeconds)}</span>
          </div>
          {studyingUserIds.includes(user.email) && (
            <div className="flex items-center gap-1 text-[7px] sm:text-[10px] text-emerald-500 font-black uppercase tracking-widest animate-pulse shrink-0">
              <Zap size={8} fill="currentColor" className="sm:w-2.5 sm:h-2.5" />
              <span className="hidden sm:inline">EM MISSÃO</span>
              <span className="sm:hidden">MISSÃO</span>
            </div>
          )}
        </div>
      </div>

      {/* Time */}
      <div className="text-right shrink-0">
        <p className={cn(
          "font-black text-sm sm:text-2xl font-mono tracking-tighter leading-none",
          isMe ? "text-[#3B82F6]" : "text-white"
        )}>
          {user.time}
        </p>
        <p className="text-[7px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/90 font-black mt-0.5 sm:mt-1">Tempo Líquido</p>
      </div>
    </div>
  );
});

RankingRow.displayName = 'RankingRow';

export default function Ranking() {
  const { 
    getGlobalRanking, 
    formatSeconds, 
    fetchRanking, 
    onlineCount, 
    onlineUserIds, 
    studyingUserIds,
    isRankingLoading,
    isStudying,
    getRank,
    getRankIcon
  } = useStudy();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'diario' | 'semanal' | 'geral'>('diario');
  const [countdown, setCountdown] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch ranking on mount
  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRanking(true);
    setIsRefreshing(false);
  };

  // Update countdown to Brasília midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const brasiliaFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      const parts = brasiliaFormatter.formatToParts(now);
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const s = parseInt(parts.find(p => p.type === 'second')?.value || '0');
      
      const secondsInDay = 24 * 3600;
      const currentSeconds = h * 3600 + m * 60 + s;
      let remaining = secondsInDay - currentSeconds;
      
      if (remaining < 0) remaining = 0;
      
      const rh = Math.floor(remaining / 3600);
      const rm = Math.floor((remaining % 3600) / 60);
      const rs = remaining % 60;
      
      setCountdown(`${rh.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Force re-render every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentRanking = getGlobalRanking(tab).map((entry, index) => {
    const isMe = currentUser?.id === entry.email;
    const seconds = entry.seconds;
    
    return {
      rank: index + 1,
      name: entry.name,
      email: entry.email,
      time: formatSeconds(seconds),
      avatar: entry.name.charAt(0).toUpperCase(),
      photo: entry.photo || (isMe ? currentUser?.photo : null),
      seconds: seconds,
      totalSeconds: entry.totalSeconds
    };
  });

  const podium = currentRanking.slice(0, 3);
  const fullList = currentRanking;
  const myEntry = currentRanking.find(r => r.email === currentUser?.id);

  const displayPodium = [
    podium[1] ? { ...podium[1], position: 'second' } : null,
    podium[0] ? { ...podium[0], position: 'first' } : null,
    podium[2] ? { ...podium[2], position: 'third' } : null,
  ].map(item => item?.name ? item : null);

  const nextRankEntry = myEntry && myEntry.rank > 1 ? currentRanking[myEntry.rank - 2] : null;
  const secondsToNext = (nextRankEntry && myEntry) ? Math.max(0, nextRankEntry.seconds - myEntry.seconds) : 0;
  const timeToNext = formatSeconds(secondsToNext);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8 border-b border-white/5 pb-8 sm:pb-12">
          <div className="space-y-3 sm:space-y-4 w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
              <Target size={10} fill="currentColor" />
              Quadro de Honra
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
              Ranking de <span className="text-[#3B82F6]">Elite</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse",
                  onlineCount > 0 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-zinc-500"
                )} />
                <span className="text-[9px] sm:text-[10px] font-black text-white/90 uppercase tracking-widest">
                  {onlineCount} OPERACIONAIS ONLINE
                </span>
              </div>
              <div className="hidden sm:block h-3 w-[1px] bg-white/10" />
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-[#3B82F6] uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                <RefreshCw size={10} className={cn(isRefreshing && "animate-spin")} />
                Sincronizar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-[#0A0A0A] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] w-full md:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-white/90 shrink-0">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-white/90 font-black mb-0.5 sm:mb-1">Reset da Missão</p>
              <p className="text-xl sm:text-2xl font-black font-mono text-white leading-none">{countdown}</p>
            </div>
          </div>
        </header>

        {/* Tabs Section */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="flex bg-[#0A0A0A] p-1 rounded-xl sm:rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {(['diario', 'semanal', 'geral'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] rounded-lg sm:rounded-xl transition-all relative whitespace-nowrap",
                  tab === t 
                    ? "bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(0,85,255,0.2)]" 
                    : "text-white/90 hover:text-white/100"
                )}
              >
                {t === 'diario' ? 'Diário' : t === 'semanal' ? 'Semanal' : 'Geral'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 text-white/95 w-full sm:w-auto justify-center sm:justify-start">
            <Users size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{currentRanking.length} Candidatos</span>
          </div>
        </div>

        {/* Podium Section */}
        <div className="relative py-6 sm:py-12">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-[#3B82F6]/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
          
          <div className="flex items-end justify-center gap-2 sm:gap-12 min-h-[200px] sm:min-h-[420px] w-full px-2 sm:px-4">
            {displayPodium.map((user, i) => {
              if (!user) return <div key={`empty-${i}`} className="hidden sm:block w-36" />;
              
              return (
                <PodiumItem 
                  key={user.email}
                  user={user}
                  isFirst={user.rank === 1}
                  isSecond={user.rank === 2}
                  onlineUserIds={onlineUserIds}
                  studyingUserIds={studyingUserIds}
                  getRank={getRank}
                  getRankIcon={getRankIcon}
                />
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Your Stats */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#3B82F6]">Seu Desempenho</h2>
            
            {myEntry ? (
              <div className="bg-[#0A0A0A] border border-[#3B82F6]/20 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 relative overflow-hidden group">
                <div className={cn(
                  "absolute top-0 right-0 p-4 sm:p-6 opacity-5 group-hover:opacity-10 transition-opacity",
                  myEntry.rank === 1 ? "text-[#FF0033]" : "text-[#3B82F6]"
                )}>
                  <Award size={80} className="sm:w-[100px] sm:h-[100px]" />
                </div>

                <div className="space-y-4 sm:space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-3xl shadow-2xl skew-x-[-5deg] shrink-0",
                      myEntry.rank === 1 ? "bg-[#FF0033]" : "bg-[#3B82F6]"
                    )}>
                      {myEntry.rank}º
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-black text-white/95 uppercase tracking-widest">Posição Atual</p>
                      <p className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Você</p>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-[8px] sm:text-[10px] font-black text-white/95 uppercase tracking-widest">Tempo de Foco</p>
                    <p className={cn(
                      "text-3xl sm:text-5xl font-black font-mono tracking-tighter leading-none",
                      "text-[#3B82F6]",
                      isStudying && "animate-pulse"
                    )}>
                      {myEntry.time}
                    </p>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t border-white/5 flex justify-between items-center">
                    <div className={cn(
                      "flex items-center gap-2",
                      "text-[#3B82F6]"
                    )}>
                      <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Top 5% da Elite</span>
                    </div>
                    <div className="text-[8px] sm:text-[10px] font-black text-white/95 uppercase tracking-widest">
                      {tab === 'diario' ? 'Hoje' : tab === 'semanal' ? 'Semanal' : 'Geral'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-center space-y-4">
                <Shield size={32} className="mx-auto text-white/70 sm:w-10 sm:h-10" />
                <p className="text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-widest">Inicie sua missão para aparecer no ranking</p>
              </div>
            )}

            <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-white/5 border border-white/5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 text-[#3B82F6]">
                <Medal size={18} className="sm:w-5 sm:h-5" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  {myEntry?.rank === 1 ? 'Liderança Absoluta' : 'Objetivo Tático'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white/90 leading-relaxed">
                {myEntry?.rank === 1 ? (
                  <>Você é o <span className="text-[#FF0033]">01</span> do ranking. Mantenha a disciplina para não ser ultrapassado.</>
                ) : (nextRankEntry && myEntry) ? (
                  <>Faltam apenas <span className="text-white">{timeToNext}</span> de foco para você assumir a <span className="text-[#3B82F6]">{myEntry.rank - 1}ª posição</span>.</>
                ) : (
                  <>Inicie sua missão agora e conquiste seu lugar no <span className="text-[#3B82F6]">Quadro de Honra</span>.</>
                )}
              </p>
            </div>
          </div>

          {/* Right: Full Ranking List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end px-1 sm:px-0">
              <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#3B82F6]">Classificação Completa</h2>
              <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-white/95 uppercase tracking-widest">
                <Activity size={10} className="sm:w-3 sm:h-3" />
                <span>Dados em Tempo Real</span>
              </div>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
              {fullList.length > 0 ? (
                <div className="divide-y divide-white/5 overflow-x-auto no-scrollbar">
                  <div className="min-w-[300px]">
                    {fullList.map((user, i) => (
                      <RankingRow 
                        key={user.email}
                        user={user}
                        isMe={user.email === currentUser?.id}
                        onlineUserIds={onlineUserIds}
                        studyingUserIds={studyingUserIds}
                        i={i}
                        isLast={i === fullList.length - 1}
                        getRank={getRank}
                        getRankIcon={getRankIcon}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 sm:p-20 text-center space-y-4">
                  <Target size={32} className="mx-auto text-white/70 sm:w-10 sm:h-10" />
                  <p className="text-[10px] sm:text-xs font-black text-white/95 uppercase tracking-[0.3em]">Nenhum registro tático encontrado</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
