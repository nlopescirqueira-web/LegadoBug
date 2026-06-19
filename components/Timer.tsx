'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  ChevronDown,
  Plus,
  X,
  RotateCcw,
  Clock,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '@/context/StudyContext';
import { cn } from '@/lib/utils';

export default function Timer() {
  const {
    todayTotalSeconds = 0,
    weeklyTotalSeconds = 0,
    allTimeSeconds = 0,
    formatSeconds,
    stopwatchActive = false,
    stopwatchSessionSeconds = 0,
    toggleStopwatch = () => {},
    resetStopwatch = () => {},
    activeSubject = 'Geral',
    setActiveSubject = () => {},
    subjects = [],
    addSubject = async () => {},
    deleteSubject = async () => {},
    dailySubjectsData = []
  } = useStudy();

  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const subjectTotalSeconds = useMemo(() => {
    const sub = dailySubjectsData.find(s => s.name === activeSubject);
    const base = sub ? sub.seconds : 0;
    return base + (stopwatchActive ? stopwatchSessionSeconds : 0);
  }, [dailySubjectsData, activeSubject, stopwatchActive, stopwatchSessionSeconds]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      await addSubject(newSubject.trim());
      setActiveSubject(newSubject.trim());
      setNewSubject('');
      setShowSubjectMenu(false);
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, subjectToDelete: string) => {
    e.stopPropagation();
    await deleteSubject(subjectToDelete);
    if (activeSubject === subjectToDelete) {
      const remaining = subjects.filter(s => s !== subjectToDelete);
      setActiveSubject(remaining[0] || '');
    }
  };

  const formatTimerTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCompact = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return '0m';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl space-y-8">

        {/* Main Timer Section */}
        <div className="flex flex-col items-center space-y-10 py-8">

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className={cn("w-2.5 h-2.5 rounded-full", stopwatchActive ? "bg-[#3B82F6] animate-pulse" : "bg-white/20")} />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">
              {stopwatchActive ? 'Estudando' : 'Pausado'}
            </span>
          </div>

          {/* Subject Selector */}
          <div className="relative w-full max-w-xs">
            <button
              onClick={() => setShowSubjectMenu(!showSubjectMenu)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all border",
                stopwatchActive
                  ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]"
                  : "bg-white/[0.03] border-white/10 text-white hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} className="opacity-60" />
                <span className="font-bold text-sm tracking-tight truncate">{activeSubject}</span>
              </div>
              <ChevronDown size={16} className={cn("opacity-60 transition-transform", showSubjectMenu ? "rotate-180" : "")} />
            </button>

            <AnimatePresence>
              {showSubjectMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="max-h-52 overflow-y-auto no-scrollbar p-1.5 space-y-0.5">
                    {subjects.map((s) => (
                      <div key={s} className="group flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors">
                        <button
                          onClick={() => { setActiveSubject(s); setShowSubjectMenu(false); }}
                          className={cn(
                            "flex-1 text-left px-4 py-2.5 text-sm font-semibold transition-colors",
                            s === activeSubject ? "text-[#3B82F6]" : "text-white/70 hover:text-white"
                          )}
                        >
                          {s}
                        </button>
                        <button
                          onClick={(e) => handleDeleteSubject(e, s)}
                          className="p-2 mr-1 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddSubject} className="p-2.5 bg-white/[0.03] flex gap-2 border-t border-white/5">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Nova disciplina..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50"
                    />
                    <button type="submit" className="w-8 h-8 flex-shrink-0 bg-[#3B82F6] text-white rounded-lg hover:opacity-80 transition flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Big Timer Display */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#3B82F6]/70 font-bold">Sessão Atual</p>
            <div className="flex justify-center items-center min-h-[100px] sm:min-h-[140px]">
              <span
                className={cn(
                  "text-6xl sm:text-7xl md:text-8xl font-black tracking-tight tabular-nums leading-none select-none transition-colors",
                  stopwatchActive ? "text-white" : "text-white/40"
                )}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatTimerTime(stopwatchSessionSeconds)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetStopwatch}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
              title="Resetar"
            >
              <RotateCcw size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleStopwatch}
              className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative overflow-hidden",
                stopwatchActive
                  ? "bg-white/10 border-2 border-white/20 text-white hover:bg-white/15"
                  : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              )}
            >
              <div className="relative z-10">
                {stopwatchActive
                  ? <Pause size={32} fill="currentColor" />
                  : <Play size={32} className="ml-1" fill="currentColor" />
                }
              </div>
              {stopwatchActive && (
                <motion.div
                  className="absolute inset-0 bg-[#3B82F6]/10"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>

            <div className="w-12 h-12" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-white/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Total Hoje</span>
            </div>
            <p className="text-lg font-black text-white tabular-nums">{formatSeconds(todayTotalSeconds)}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-[#3B82F6]/50" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{activeSubject}</span>
            </div>
            <p className="text-lg font-black text-[#3B82F6] tabular-nums">{formatSeconds(subjectTotalSeconds)}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-white/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Semanal</span>
            </div>
            <p className="text-lg font-black text-white/70 tabular-nums">{formatCompact(weeklyTotalSeconds)}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-white/30" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Total Geral</span>
            </div>
            <p className="text-lg font-black text-white/70 tabular-nums">{formatCompact(allTimeSeconds)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
