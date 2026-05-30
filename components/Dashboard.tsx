'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  Timer, 
  Play, 
  Pause,
  RotateCcw, 
  GraduationCap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Award,
  AlertTriangle,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { 
    weeklyData, 
    subjectsData, 
    dailySubjectsData,
    todayTotalSeconds,
    formatFriendlyTime,
    allTimeSeconds,
    weeklyTotalSeconds,
    weeklyGoalHours,
    updateWeeklyGoalHours,
    studiedDays, 
    totalHours, 
    weeklyTotalHours,
    formatTotalTime, 
    formatSeconds,
    stopwatchActive,
    stopwatchAccumulated,
    isStudying,
    totalStudyTime,
    streak,
    daysSinceLastStudy,
    getRank,
    getRankIcon,
    getNextRank,
    getRankProgress,
    dailyHistory
  } = useStudy();
  const { user, isLoading: isAuthLoading } = useAuth();

  const topSubjects = useMemo(() => {
    const _live = totalStudyTime;
    const activeSub = localStorage.getItem('activeSubject') || 'Português';
    
    const liveData = [...dailySubjectsData];
    
    if (stopwatchActive && stopwatchAccumulated > 0) {
      const idx = liveData.findIndex(s => s.name === activeSub);
      if (idx >= 0) {
        liveData[idx] = { ...liveData[idx], seconds: liveData[idx].seconds + stopwatchAccumulated };
      } else {
        liveData.push({ name: activeSub, seconds: stopwatchAccumulated });
      }
    }

    return liveData
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 4);
  }, [dailySubjectsData, totalStudyTime, stopwatchActive, stopwatchAccumulated]);

  const getDayOfYear = useCallback((date?: Date) => {
    const now = date || new Date();
    // Get Brasilia date parts
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour12: false
    }).formatToParts(now);
    
    const map: any = {};
    parts.forEach(p => map[p.type] = p.value);
    
    const year = parseInt(map.year);
    const month = parseInt(map.month) - 1;
    const day = parseInt(map.day);
    
    const brDate = new Date(Date.UTC(year, month, day));
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    return Math.floor((brDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const currentDay = useMemo(() => getDayOfYear(), [getDayOfYear]);
  const days = useMemo(() => Array.from({ length: 365 }, (_, i) => i + 1), []);

  const studiedDaysWithToday = useMemo(() => {
    const combined = [...studiedDays];
    if ((todayTotalSeconds > 0 || isStudying) && !combined.includes(currentDay)) {
      combined.push(currentDay);
    }
    return combined;
  }, [studiedDays, todayTotalSeconds, currentDay, isStudying]);

  const [viewDate, setViewDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    
    const calendarDays = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year: year,
        isCurrentMonth: false
      });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }
    
    // Next month padding
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        day: i,
        month: month + 1,
        year: year,
        isCurrentMonth: false
      });
    }
    
    return calendarDays;
  }, [viewDate]);

  const monthName = useMemo(() => {
    return viewDate.toLocaleString('pt-BR', { month: 'long' });
  }, [viewDate]);

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const monthlyTotalSeconds = useMemo(() => {
    let total = 0;
    calendarData.forEach(data => {
      if (data.isCurrentMonth) {
        const dateObj = new Date(data.year, data.month, data.day);
        const dayOfYear = getDayOfYear(dateObj);
        
        const recordedSeconds = dailyHistory[dayOfYear] || 0;
        
        // Check if this cell is today in Brasilia
        const now = new Date();
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
        const cellStr = `${data.year}-${(data.month + 1).toString().padStart(2, '0')}-${data.day.toString().padStart(2, '0')}`;
        
        if (cellStr === todayStr) {
          total += Math.max(recordedSeconds, todayTotalSeconds);
        } else {
          total += recordedSeconds;
        }
      }
    });
    return total;
  }, [calendarData, dailyHistory, getDayOfYear, todayTotalSeconds]);

  const dailyGoalHours = weeklyGoalHours / 7;
  
  const weeklyStats = useMemo(() => {
    const totalHours = weeklyTotalSeconds / 3600;
    const daysPassed = new Date().getDay() || 7; // 1-7
    const averageHours = totalHours / daysPassed;
    const projection = averageHours * 7;
    const percentage = (totalHours / weeklyGoalHours) * 100;
    
    let status = { label: 'RISCO ALTO', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (percentage >= 80) {
      status = { label: 'CONSISTENTE', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    } else if (percentage >= 50) {
      status = { label: 'IRREGULAR', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    }

    const studiedCount = weeklyData.filter(d => d.value > 0).length;
    let diagnosis = "Análise tática em andamento...";
    if (studiedCount === 0) {
      diagnosis = "Nenhuma atividade detectada no período.";
    } else if (studiedCount <= 2 && totalHours > 0) {
      diagnosis = "Concentração de estudo em poucos dias detectada.";
    } else if (percentage < 30) {
      diagnosis = "Ritmo crítico: Volume de estudo muito abaixo do operacional.";
    } else if (percentage < 60) {
      diagnosis = "Padrão inconsistente: Aporte diário irregular.";
    } else if (percentage >= 90) {
      diagnosis = "Excelente performance: Ritmo de aprovação detectado.";
    } else {
      diagnosis = "Frequência estável sob supervisão.";
    }

    return { totalHours, projection, percentage, status, diagnosis, daysPassed };
  }, [weeklyTotalSeconds, weeklyData, weeklyGoalHours]);

  const nextRank = useMemo(() => getNextRank(allTimeSeconds), [getNextRank, allTimeSeconds]);
  const rankProgress = useMemo(() => getRankProgress(allTimeSeconds), [getRankProgress, allTimeSeconds]);

  const weekContext = useMemo(() => {
    const now = new Date();
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const currentDayName = dayNames[now.getDay()];
    
    // Calculate Monday of current week
    const monday = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    // Remaining days in the week (including today)
    const dayNum = now.getDay() === 0 ? 7 : now.getDay();
    const remainingDays = 7 - dayNum + 1;
    
    return {
      currentDayName,
      range: `${formatDate(monday)} a ${formatDate(sunday)}`,
      remainingDays,
      isMidWeek: remainingDays < 7,
      today: formatDate(now)
    };
  }, []);

  const [showCorrectionSuggest, setShowCorrectionSuggest] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const handleOpenGoalModal = () => {
    setGoalInput(weeklyGoalHours.toString());
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = () => {
    const val = parseInt(goalInput);
    if (!isNaN(val) && val > 0) {
      updateWeeklyGoalHours(val);
      setIsGoalModalOpen(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RotateCcw className="text-[#3B82F6] w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Header / Hero Section */}
        <header className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-[#0A0A0A] to-[#050505] border border-white/5 p-6 sm:p-12">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3B82F6_0%,transparent_70%)]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] sm:text-xs font-bold uppercase tracking-widest"
              >
                <Zap size={10} className="sm:w-3 sm:h-3" fill="currentColor" />
                Status: Operacional
              </motion.div>
              
              <div className="space-y-1">
                <h1 className="text-xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
                  Trincheira do <span className="text-[#3B82F6]">Legado</span>
                </h1>
                <p className="text-white/70 font-medium text-sm sm:text-lg">
                  Bem-vindo de volta, <span className="text-white font-bold">{user?.name}</span>. Sua missão continua.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 w-full md:w-auto justify-between md:justify-start">
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#3B82F6] font-black italic">Cronômetro Geral</p>
                <div className="flex flex-col items-end">
                  <p className="text-xl sm:text-2xl font-black text-white tabular-nums leading-none tracking-tight">
                    {formatFriendlyTime(todayTotalSeconds)}
                  </p>
                  <p className="text-[9px] text-white/40 font-bold mt-1 uppercase tracking-wider">Total Acumulado Hoje</p>
                </div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-white/10" />
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl border border-white/20 overflow-hidden bg-white/5 shadow-2xl shrink-0">
                {user?.photo ? (
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
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-black text-white/70">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Quick Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<Zap className="text-red-500" />} 
            label="Frequência" 
            value={
              streak > 0 
                ? `${streak} ${streak === 1 ? 'Dia' : 'Dias'} no foco` 
                : `${daysSinceLastStudy} ${daysSinceLastStudy === 1 ? 'Dia' : 'Dias'} sem estudar`
            } 
            subValue={
              daysSinceLastStudy > 0 && streak === 0
                ? "⚠️ Isso reduz sua chance de aprovação"
                : streak > 0 
                  ? "A constância é o caminho da vitória!" 
                  : "Mantenha a guarda alta. Comece hoje!"
            }
            isStreak
          />
          <StatCard 
            icon={<Target className="text-blue-400" />} 
            label="Acumulado na Semana" 
            value={formatTotalTime(weeklyTotalSeconds)} 
            subValue={`Total desde Segunda • Meta: ${weeklyGoalHours}h`}
            onClick={handleOpenGoalModal}
            customAction={
              <button className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-1 rounded-md hover:bg-[#3B82F6]/20 transition-all border border-[#3B82F6]/20">
                Ajustar Meta Horária
              </button>
            }
          />
          <StatCard 
            icon={
              <div className="relative w-6 h-6">
                <Image 
                  src={getRankIcon(allTimeSeconds)} 
                  alt="Rank" 
                  fill 
                  priority
                  loading="eager"
                  className="object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
            } 
            label="Nível" 
            value={getRank(allTimeSeconds)} 
            subValue={nextRank ? `Próximo: ${nextRank.name}` : 'Nível Máximo'}
            progress={rankProgress.progress}
            progressLabel={rankProgress.remainingSeconds ? `${formatSeconds(rankProgress.remainingSeconds)} para subir` : undefined}
          />
          <StatCard 
            icon={<CalendarIcon className="text-purple-400" />} 
            label="Data" 
            value={new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} 
            subValue="Calendário Militar"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Weekly Chart Card */}
            <section className="bg-[#0A0A0A] border border-white/5 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 space-y-6 sm:space-y-8 relative group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Atividade Semanal</h2>
                    <div className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border animate-pulse", weeklyStats.status.color, weeklyStats.status.bg, weeklyStats.status.border)}>
                      {weeklyStats.status.label}
                    </div>
                  </div>
                  <p className="text-[#3B82F6] text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                    <Activity size={12} />
                    {weeklyStats.diagnosis}
                  </p>
                </div>
                <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                  <div className="flex items-baseline gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 scale-90 sm:scale-100 origin-right">
                    <p className="text-sm sm:text-base font-black text-white tabular-nums leading-none">
                      {formatTotalTime(weeklyTotalSeconds)}
                    </p>
                    <p className="text-[10px] font-bold text-white/40 tabular-nums uppercase tracking-tighter">
                      / {weeklyGoalHours}h
                    </p>
                  </div>
                  <p className="text-[7px] sm:text-[9px] uppercase tracking-[0.2em] text-[#3B82F6] font-black mt-2">Status Operacional Semana</p>
                </div>
              </div>

              <div className="h-[250px] sm:h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF3366" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#881122" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                      domain={[0, Math.max(3, dailyGoalHours * 1.5, ...weeklyData.map(d => d.value))]}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ 
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#fff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ padding: 0 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = Number(payload[0].value);
                          const isLow = val < dailyGoalHours;
                          return (
                            <div className="bg-[#0A0A0A] border border-white/10 p-3 rounded-xl shadow-2xl">
                              <p className="text-[10px] uppercase tracking-widest font-black text-white/50 mb-1">{label}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-[#3B82F6]">{formatSeconds(Math.floor(val * 3600))}</span>
                              </div>
                              {isLow && (
                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-tight mt-1 flex items-center gap-1">
                                  <AlertTriangle size={10} /> Abaixo da meta operacional
                                </p>
                              )}
                              {!isLow && (
                                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight mt-1 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Alvo atingido
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine 
                      y={dailyGoalHours > 0 ? dailyGoalHours : 3.5} 
                      stroke="#3B82F6" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                      strokeOpacity={0.8}
                      label={{ 
                        value: 'MISSÃO DIÁRIA', 
                        position: 'insideTopLeft', 
                        fill: '#3B82F6', 
                        fontSize: 10, 
                        fontWeight: 900,
                        offset: 10,
                        className: "drop-shadow-sm"
                      }} 
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    >
                      {weeklyData.map((entry, index) => {
                        const isLow = entry.value > 0 && entry.value < dailyGoalHours;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.value === 0 ? 'rgba(255,255,255,0.03)' : (isLow ? 'url(#lowGradient)' : 'url(#barGradient)')} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/5 gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp size={12} className="text-[#3B82F6]" />
                    Performance: <span className="text-white/80">Top {(100 - (streak * 2 + weeklyStats.percentage / 10)).toFixed(1)}% dos alunos</span>
                  </p>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowCorrectionSuggest(!showCorrectionSuggest)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-[#3B82F6]/10 border border-white/10 hover:border-[#3B82F6]/30 rounded-xl transition-all duration-300 active:scale-95"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Corrigir Semana</span>
                    <ArrowUpRight size={14} className="text-[#3B82F6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <AnimatePresence>
                    {showCorrectionSuggest && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-4 w-64 bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 blur-3xl pointer-events-none" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B82F6] mb-3">Protocolo de Ajuste</h4>
                        <div className="space-y-4 relative z-10">
                          <div className="space-y-1.5">
                            <p className="text-[11px] text-white/90 font-bold italic leading-relaxed">
                              &quot;Detectamos queda de ritmo. Inicie uma sessão de 40min agora para manter a inércia.&quot;
                            </p>
                            <button className="text-[9px] text-[#3B82F6] font-black uppercase tracking-widest hover:underline">
                              Adicionar à agenda
                            </button>
                          </div>
                          <div className="w-full h-px bg-white/5" />
                          <div>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-tight">Sugerido para Amanhã:</p>
                            <p className="text-xs font-black text-white mt-1">2 Sessões Extras (90min)</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Top Subjects Grid */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tight">Foco por Disciplina</h2>
                <button className="text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                  Ver Todas <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailySubjectsData.length > 0 ? (
                  topSubjects.map((subject, i) => (
                    <motion.div 
                      key={subject.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl hover:border-[#3B82F6]/30 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#3B82F6]/10 transition-colors">
                        <GraduationCap size={20} className="text-white/70 group-hover:text-[#3B82F6] transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-[#3B82F6] transition-colors">{subject.name}</h3>
                        <p className="text-[10px] text-white/80 uppercase font-bold tracking-wider">Hoje: {formatSeconds(subject.seconds)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (subject.seconds / (todayTotalSeconds || 1)) * 100)}%` }}
                        className="h-full bg-[#3B82F6]"
                      />
                    </div>
                  </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                    <p className="text-white/20 font-medium italic">Nenhuma atividade registrada hoje.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Calendar Section */}
            <section className="bg-[#0A0A0A] border border-white/5 rounded-3xl sm:rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-[#3B82F6] sm:w-4 sm:h-4" />
                  <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-widest">Consistência</h2>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">{monthName} {viewDate.getFullYear()}</span>
                  <div className="flex gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/90 hover:text-white">
                      <ChevronLeft size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/90 hover:text-white">
                      <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-[7px] sm:text-[8px] font-black text-white/70 text-center uppercase">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((data, i) => {
                  const dateObj = new Date(data.year, data.month, data.day);
                  const dayOfYear = getDayOfYear(dateObj);
                  
                  const now = new Date();
                  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
                  const cellStr = `${data.year}-${(data.month + 1).toString().padStart(2, '0')}-${data.day.toString().padStart(2, '0')}`;
                  
                  const isToday = cellStr === todayStr;
                  const isPast = !isToday && dateObj < now;
                  const isFuture = !isToday && dateObj > now;

                  const recordedSeconds = dailyHistory[dayOfYear] || 0;
                  const displaySeconds = isToday ? Math.max(recordedSeconds, todayTotalSeconds) : recordedSeconds;
                  const isStudied = displaySeconds > 0;

                  let bgColor = "bg-transparent border border-white/5";
                  let textColor = "text-white/50";

                  if (data.isCurrentMonth) {
                    textColor = "text-white/95";
                    if (isStudied) {
                      bgColor = "bg-[#3B82F6]/20 border border-[#3B82F6]/30";
                      textColor = "text-[#3B82F6]";
                    } else if (isPast || isToday) {
                      bgColor = "bg-rose-500/10 border border-rose-500/20";
                      textColor = "text-rose-400/60";
                    }
                  } else {
                    textColor = "text-white/40";
                  }

                  return (
                    <div 
                      key={i}
                      className={cn(
                        "aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center transition-all duration-300",
                        bgColor,
                        textColor,
                        isToday && !isStudied && "border-[#3B82F6]/50"
                      )}
                    >
                      <span className="text-[9px] sm:text-[10px] font-black">{data.day}</span>
                      {displaySeconds > 0 && data.isCurrentMonth && (
                        <span className="text-[6px] sm:text-[7px] font-bold opacity-95">
                          {Math.floor(displaySeconds / 3600)}h{Math.floor((displaySeconds % 3600) / 60)}m
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white/90">Missão Cumprida</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white/90">Falta de Combate</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                      <Clock size={12} className="text-[#3B82F6] sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/90 leading-tight">Total Acumulado</span>
                      <span className="block text-[6px] sm:text-[8px] font-bold text-white/90 uppercase tracking-tighter">No mês selecionado</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-[#3B82F6]">{formatSeconds(monthlyTotalSeconds)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Daily Order / Quote */}
            <section className="p-8 rounded-[2rem] bg-gradient-to-br from-[#FF0033]/10 to-transparent border border-[#FF0033]/10 italic text-white/90 text-sm leading-relaxed relative group overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award size={120} />
              </div>
              &quot;A disciplina é a alma de um exército. Torna grandes os pequenos contingentes, proporciona êxito aos fracos e estima a todos.&quot;
              <p className="mt-4 not-italic font-black text-[10px] uppercase tracking-widest text-[#FF0033]">Ordem do Dia</p>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 blur-[60px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#3B82F6]/10 rounded-2xl">
                  <Target className="text-[#3B82F6]" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white line-clamp-1">Meta Semanal</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#3B82F6] font-black">
                    {weekContext.currentDayName} • {weekContext.range}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Status da Missão</p>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-black text-white">{formatTotalTime(weeklyTotalSeconds)}</span>
                  <span className="text-[10px] font-bold text-white/60">de {weeklyGoalHours}h planejado</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-[#3B82F6] rounded-full" 
                    style={{ width: `${Math.min(100, (weeklyTotalSeconds / (weeklyGoalHours * 3600)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#3B82F6] font-black">Horas por Semana (Total)</label>
                  <input 
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[#3B82F6]/50 outline-none transition-colors"
                  />
                  <div className="space-y-1 mt-3">
                    <p className="text-[10px] text-white/40 font-medium italic">
                      Dica: Para bater {goalInput || '0'}h em {weekContext.remainingDays} {weekContext.remainingDays === 1 ? 'dia' : 'dias'} restantes (até domingo):
                    </p>
                    <div className="flex items-center gap-2 text-[#3B82F6]">
                      <ArrowUpRight size={12} />
                      <span className="text-xs font-black uppercase tracking-tight">
                        {(Math.round((parseInt(goalInput || '0') - (weeklyTotalSeconds / 3600)) / weekContext.remainingDays * 10) / 10).toFixed(1)}h por dia
                      </span>
                      <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Ajuste Militar</span>
                    </div>
                  </div>
                </div>

                {weekContext.isMidWeek && (
                  <div className="p-4 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/10">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Activity size={14} className="text-[#3B82F6]" />
                      </div>
                      <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                        Você está iniciando a meta em uma <span className="text-white font-bold">{weekContext.currentDayName}</span>. 
                        O sistema calculou que você tem <span className="text-[#3B82F6] font-black">{weekContext.remainingDays} dias</span> para cumprir a missão até domingo.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsGoalModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-white/70 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors border border-white/5"
                  >
                    Abortar
                  </button>
                  <button 
                    onClick={handleSaveGoal}
                    className="flex-1 px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#2563EB] transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
                  >
                    Consolidar Meta
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, progress, progressLabel, isStreak, onClick, customAction }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  subValue: string,
  progress?: number,
  progressLabel?: string,
  isStreak?: boolean,
  onClick?: () => void,
  customAction?: React.ReactNode
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group relative overflow-hidden flex flex-col justify-between h-full",
        isStreak && "hover:border-[#FF0033]/30",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div>
        {onClick && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-white/40" />
          </div>
        )}
        {isStreak && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0033]/5 blur-[60px] pointer-events-none group-hover:bg-[#FF0033]/10 transition-all" />
        )}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className={cn(
            "p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform",
            isStreak && "bg-[#FF0033]/10 text-[#FF0033]"
          )}>
            {icon}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/90 font-black">{label}</span>
        </div>
        <div className="relative z-10">
          <p className={cn(
            "text-2xl font-black text-white",
            isStreak && "text-[#FF0033]"
          )}>{value}</p>
          <p className="text-xs text-white/90 font-medium">{subValue}</p>
          
          {progress !== undefined && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest">
                <span className="text-white/70">Progresso XP</span>
                <span className="text-[#3B82F6]">{Math.floor(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#3B82F6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              {progressLabel && (
                <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest text-right">{progressLabel}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {customAction && (
        <div className="mt-4 relative z-10">
          {customAction}
        </div>
      )}
    </div>
  );
}
