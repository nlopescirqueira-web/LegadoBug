'use client';

import React, { useState } from 'react';
import { X, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import SmartImport from './SmartImport';
import { useStudy } from '@/context/StudyContext';

interface AdminQuestionsProps {
  onClose: () => void;
}

export default function AdminQuestions({ onClose }: AdminQuestionsProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { refreshTotalQuestions } = useStudy();

  const handleResetDatabase = async () => {
    if (!window.confirm('ALERTA NUCLEAR: Isso apagará ABSOLUTAMENTE TUDO (Questões, Respostas, Comentários). Você perderá inclusive suas questões manuais. Deseja zerar tudo?')) {
      return;
    }

    setIsResetting(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Apagar respostas (estatísticas de acerto)
      await supabase.from('question_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // 2. Apagar comentários
      await supabase.from('question_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // 3. Apagar todas as questões
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      // Garantir que o cache local saiba do reset
      localStorage.setItem('questions_last_reset', new Date().toISOString());
      
      refreshTotalQuestions();
      setSuccess(true);
      alert('TUDO FOI APAGADO! O sistema agora está 100% limpo.');
    } catch (err: any) {
      setError('Erro no reset: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleKeepOnlyAPMBB = async () => {
    if (!window.confirm('Deseja apagar TUDO e manter APENAS focado nas questões APMBB que você adicionou?')) {
      return;
    }

    setIsResetting(true);
    try {
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .not('org', 'ilike', 'APMBB');

      if (deleteError) throw deleteError;

      // Also ensure we don't have null orgs
      await supabase.from('questions').delete().is('org', null);

      refreshTotalQuestions();
      alert('Limpeza concluída! Agora só existem as questões APMBB no seu banco.');
    } catch (err: any) {
      setError('Erro na limpeza: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
                <Sparkles className="text-[#3B82F6]" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tight text-white">IA SMART IMPORT</h2>
                <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">SISTEMA INTELIGENTE DE QUESTÕES</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {error && <span className="text-red-500 text-[10px] font-bold animate-pulse">{error}</span>}
            
            <button
              type="button"
              onClick={handleKeepOnlyAPMBB}
              disabled={isResetting}
              className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-xl border border-amber-500/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              title="MANTER APENAS SUAS QUESTÕES APMBB"
            >
              <Trash2 size={14} />
              Limpar (Manter APMBB)
            </button>

            <button
              type="button"
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-xl border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              title="ZERAR TODO O BANCO"
            >
              <Trash2 size={14} />
              Reset Nuclear (Zerar Tudo)
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <SmartImport onComplete={() => {
            refreshTotalQuestions();
            if (onClose) onClose();
          }} />
        </div>
      </motion.div>
    </div>
  );
}
