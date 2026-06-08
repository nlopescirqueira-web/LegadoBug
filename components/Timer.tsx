'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  ChevronDown,
  Plus,
  X,
  Shield,
  RotateCcw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '@/context/StudyContext';
import { cn } from '@/lib/utils';

export default function Timer() {
  const {
    todayTotalSeconds = 0,
    weeklyTotalSeconds = 0,
    allTimeSeconds = 0,
    formatSeconds = (s: number) => `${s}s`,
    stopwatchActive = false,
    stopwatchAccumulated = 0,
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
    return base + stopwatchAccumulated;
  }, [dailySubjectsData, activeSubject, stopwatchAccumulated]);

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
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCompact = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-12">

        {/* Top Stats Bar */}
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", stopwatchActive ? "bg-[#3B82F6] animate-pulse" : "bg-white/20")} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/95">
              {stopwatchActive ? 'Estudando' : 'Pausado'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Semanal</p>
              <p className="text-sm font-black text-white/60 tabular-nums">{formatCompact(weeklyTotalSeconds)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Total Geral</p>
              <p className="text-sm font-black text-white/60 tabular-nums">{formatCompact(allTimeSeconds)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Subject Control */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#3B82F6]">Disciplina</h2>
              <div className="relative">
                <button
                  onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                  className="w-full flex items-center justify-between p-5 bg-[#0A0A0A] border border-white/10 rounded-2xl hover:border-[#3B82F6]/50 transition-all group"
                >
                  <span className="font-bold text-lg tracking-tight truncate pr-2">{activeSubject}</span>
                  <ChevronDown size={18} className={cn("text-white/80 transition-transform", showSubjectMenu ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {showSubjectMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                      <div className="max-h-60 overflow-y-auto scrollbar-hide p-2 space-y-1">
                        {subjects.map((s) => (
                          <div
                            key={s}
                            className="group flex items-center justify-between w-full hover:bg-white/5 rounded-xl transition-colors"
                          >
                            <button
                              onClick={() => {
                                setActiveSubject(s);
                                setShowSubjectMenu(false);
                              }}
                              className="flex-1 text-left px-4 py-3 text-sm font-bold text-white/90 hover:text-white transition-colors"
                            >
                              {s}
                            </button>
                            <button
                              onClick={(e) => handleDeleteSubject(e, s)}
                              className="p-2 mr-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddSubject} className="p-3 bg-white/5 flex gap-2 border-t border-white/5">
                        <input
                          type="text"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder="Nova Disciplina..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all"
                        />
                        <button
                          type="submit"
                          className="w-8 h-8 flex-shrink-0 bg-[#3B82F6] text-white rounded-lg hover:opacity-80 transition-colors flex items-center justify-center"
                        >
                          <Plus size={16} />
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-3">
              <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Esta Sessão</span>
                  <span className="text-sm font-black text-white tabular-nums">{formatSeconds(stopwatchSessionSeconds)}</span>
                </div>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{activeSubject} (Hoje)</span>
                  <span className="text-sm font-black text-[#3B82F6] tabular-nums">{formatSeconds(subjectTotalSeconds)}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#3B82F6]"
                    animate={{ width: `${Math.min(100, (subjectTotalSeconds / 3600) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Main Timer Display */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-12 py-12">
            <div className="relative w-full flex flex-col items-center">
              <div className="relative z-10 text-center space-y-6 w-full px-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.6em] text-[#3B82F6] font-black">Total Hoje</p>
                  <div className="h-[1px] w-12 bg-[#3B82F6]/30 mx-auto" />
                </div>

                <div className="flex justify-center items-center w-full min-h-[120px] sm:min-h-[160px]">
                  <span
                    className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight tabular-nums text-white leading-none select-none"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatTimerTime(todayTotalSeconds)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetStopwatch}
                className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/5 transition-all"
                title="Resetar"
              >
                <RotateCcw size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleStopwatch}
                className={cn(
                  "w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden",
                  stopwatchActive
                    ? "bg-white/5 border border-white/20 text-white"
                    : "bg-[#3B82F6] text-white"
                )}
              >
                <div className="relative z-10">
                  {stopwatchActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} className="ml-1" fill="currentColor" />}
                </div>

                {stopwatchActive && (
                  <motion.div
                    className="absolute inset-0 bg-[#3B82F6]/10"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <div className="w-12 h-12 flex items-center justify-center text-white/5">
                <Shield size={20} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
