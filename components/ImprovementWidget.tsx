'use client';

import React from 'react';
import { Trophy, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useImprovement } from '@/context/ImprovementContext';

interface ImprovementWidgetProps {
  onOpenDetails: () => void;
}

export default function ImprovementWidget({ onOpenDetails }: ImprovementWidgetProps) {
  const { 
    isActive, 
    isCompleted, 
    settings, 
    elapsedTime, 
    currentHitsInWindow, 
    totalAnswered,
    stopImprovement
  } = useImprovement();

  if (!isActive) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-[55] w-72 bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-blue-100/50 p-4 flex items-center justify-between border-b border-blue-100">
          <div className="flex items-center gap-2 text-zinc-900 font-bold">
            <Trophy size={16} className="text-[#3B82F6]" />
            <span className="text-xs uppercase tracking-tight">Aprimoramento</span>
          </div>
          <button 
            onClick={stopImprovement}
            className="p-1 hover:bg-blue-200/50 rounded-full text-zinc-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="px-2 py-1 bg-blue-100 text-[#3B82F6] text-[9px] font-black uppercase tracking-wider rounded-md">
              Em andamento
            </div>
            <div className="text-sm font-black text-zinc-800 tabular-nums tracking-tight">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className="text-[10px] font-medium text-zinc-400">
            {settings.name || '-'}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-lg font-black text-zinc-800">{currentHitsInWindow}/{settings.targetHits}</span>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Acertos</span>
            </div>
            
            <button
              onClick={onOpenDetails}
              className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-1"
            >
              Ver detalhes
            </button>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="bg-emerald-500 p-3 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-white">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Aprimoramento concluído!</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
