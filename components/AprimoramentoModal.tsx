'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Timer, Target, RotateCcw, Pause, Play, CheckCircle2, ChevronRight, Sparkles, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useImprovement } from '@/context/ImprovementContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AprimoramentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AprimoramentoModal({ isOpen, onClose }: AprimoramentoModalProps) {
  const { 
    isActive, 
    isCompleted, 
    settings, 
    elapsedTime, 
    answers, 
    currentHitsInWindow, 
    totalAnswered,
    startImprovement,
    stopImprovement,
    resetImprovement
  } = useImprovement();

  const [formName, setFormName] = useState(settings.name);
  const [formHits, setFormHits] = useState(settings.targetHits);
  const [formTotal, setFormTotal] = useState(settings.windowSize);
  const [formCorrection, setFormCorrection] = useState(settings.addCorrectionTime);

  // Sync form with settings when modal is opened and not active
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && !isActive && settings) {
      setFormName(settings.name);
      setFormHits(settings.targetHits);
      setFormTotal(settings.windowSize);
      setFormCorrection(settings.addCorrectionTime);
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!formName.trim()) return;
    
    startImprovement({
      name: formName,
      targetHits: formHits,
      windowSize: formTotal,
      addCorrectionTime: formCorrection,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-zinc-900"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0055FF]/10 rounded-lg flex items-center justify-center text-[#0055FF]">
              <Trophy size={18} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-800">
              {isCompleted ? 'Aprimoramento concluído!' : isActive ? 'Configuração do Aprimoramento' : 'Configuração do Aprimoramento'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[80vh] no-scrollbar">
          {!isActive && !isCompleted ? (
            // Configuration Mode
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Nome do Aprimoramento <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Matemática - Operações Fundamentais"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#0055FF] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Acertos Necessários</label>
                  <input 
                    type="number"
                    value={formHits}
                    onChange={(e) => setFormHits(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#0055FF] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total de Questões</label>
                  <input 
                    type="number"
                    value={formTotal}
                    onChange={(e) => setFormTotal(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#0055FF] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <button
                  onClick={() => setFormCorrection(!formCorrection)}
                  className={cn(
                    "w-5 h-5 rounded border transition-colors flex items-center justify-center",
                    formCorrection ? "bg-[#0055FF] border-[#0055FF] text-white" : "border-zinc-300 bg-white"
                  )}
                >
                  {formCorrection && <CheckCircle2 size={12} strokeWidth={4} />}
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-700">Adicionar tempo de correção</span>
                  <p className="text-[10px] text-zinc-400 font-medium leading-tight">
                    Se marcado, o aprimoramento também calculará o tempo médio entre responder e marcar que corrigiu a questão.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-800 text-center leading-relaxed">
                  O aprimoramento será concluído quando, nas <span className="font-bold underline text-[#0055FF] italic">últimas {formTotal} respostas</span>, tiver pelo menos <span className="font-bold underline text-[#0055FF] italic">{formHits} acertos</span>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors uppercase tracking-widest"
                >
                  Fechar
                </button>
                <button 
                  onClick={handleStart}
                  disabled={!formName.trim()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest shadow-xl active:scale-95",
                    formName.trim() 
                      ? "bg-[#0055FF] hover:bg-[#0044DD] text-white shadow-blue-500/20" 
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <Play size={14} fill="currentColor" />
                  Iniciar Aprimoramento
                </button>
              </div>
            </div>
          ) : isActive && !isCompleted ? (
            // In-Progress Mode
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-[#0055FF] uppercase tracking-tighter italic">Aprimoramento em progresso...</h3>
                  <div className="px-3 py-1 bg-blue-100 text-[#3B82F6] text-[10px] font-black uppercase tracking-wider rounded-lg animate-pulse">
                    Em andamento
                  </div>
                </div>
                <p className="text-sm text-zinc-400 font-medium">Responda às questões normalmente. O sistema contabiliza automaticamente.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Questão Atual</span>
                  <span className="text-4xl font-black text-zinc-800">{totalAnswered + 1}</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cronômetro</span>
                  <span className="text-4xl font-black text-zinc-800 tabular-nums">{formatTime(elapsedTime)}</span>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Progresso</span>
                  <p className="text-sm font-bold text-zinc-700">
                    {currentHitsInWindow} de {settings.targetHits} acertos necessários nas últimas {settings.windowSize} respostas
                  </p>
                </div>
                <div className="h-4 bg-zinc-200 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  {Array.from({ length: settings.windowSize }).map((_, idx) => {
                    const ans = answers.slice(-settings.windowSize)[idx];
                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          ans ? (ans.isCorrect ? "bg-emerald-500" : "bg-red-500") : "bg-zinc-300"
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Legenda</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Correto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Incorreto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-300" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pendente</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 block">Status</span>
                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                  Você já tem {currentHitsInWindow} acerto(s). Faltam {Math.max(0, settings.targetHits - currentHitsInWindow)} acerto(s) para concluir. 
                  {answers.length < settings.windowSize ? ` Ainda há ${settings.windowSize - answers.length} questão(ões) dentro da janela configurada.` : " Você está na janela fixa."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetImprovement}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
                  >
                    <RotateCcw size={14} />
                    Reiniciar
                  </button>
                  <button 
                    onClick={stopImprovement}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
                  >
                    <Pause size={14} />
                    Pausar
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors uppercase tracking-widest"
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={stopImprovement}
                    className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#0055FF] text-[#0055FF] hover:bg-blue-50 rounded-xl text-xs font-bold transition-all uppercase tracking-widest active:scale-95"
                  >
                    <Target size={14} />
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Conclusion Mode
            <div className="flex flex-col items-center text-center space-y-8 py-4">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-32 h-32 flex items-center justify-center relative"
                >
                  <Image 
                    src="https://nbmvpsigfqmuipcfanug.supabase.co/storage/v1/object/public/Imagens-Questoes/MEDALHAA.png" 
                    alt="Medalha de Aprimoramento"
                    className="object-contain drop-shadow-2xl"
                    fill
                    priority
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white"
                >
                  <Sparkles size={16} />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-zinc-800 uppercase italic tracking-tighter">Aprimoramento concluído!</h3>
                <p className="text-sm text-zinc-400 font-medium">Você atingiu o aprimoramento <span className="text-zinc-800 font-bold italic">{settings.name}</span> com sucesso.</p>
              </div>

              <div className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl p-8 space-y-4">
                <div className="grid grid-cols-2 gap-y-4 text-left">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome</span>
                    <span className="text-xl font-black text-[#0055FF]">{settings.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tempo Total</span>
                    <span className="text-xl font-black text-[#0055FF]">{formatTime(elapsedTime)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total de Tentativas</span>
                    <span className="text-xl font-black text-[#0055FF]">{totalAnswered}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tempo Médio por Tentativa</span>
                    <span className="text-xl font-black text-[#0055FF]">
                      {totalAnswered > 0 ? formatTime(Math.floor(elapsedTime / totalAnswered)) : '00:00:00'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  stopImprovement();
                  onClose();
                }}
                className="w-full bg-[#0055FF] hover:bg-[#0044DD] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
