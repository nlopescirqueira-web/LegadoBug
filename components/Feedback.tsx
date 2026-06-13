'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquare, AlertTriangle, Search, Loader2, Trash2, Filter,
  ChevronDown, Send, X, BookOpen, Target, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface FeedbackEntry {
  id: string;
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
  question?: {
    text: string;
    subject: string;
    topic: string;
    org: string;
    year: string;
  } | null;
}

const ERRO_PREFIX = '[ERRO] ';

export default function Feedback() {
  const { user, isAdmin } = useAuth();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'todos' | 'erros' | 'comentarios'>('todos');
  const [searchText, setSearchText] = useState('');
  const [showNewReport, setShowNewReport] = useState(false);
  const [reportQuestionSearch, setReportQuestionSearch] = useState('');
  const [reportQuestions, setReportQuestions] = useState<any[]>([]);
  const [selectedReportQuestion, setSelectedReportQuestion] = useState<any | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState<'erro' | 'feedback'>('feedback');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_comments')
        .select(`
          *,
          profiles:user_id (
            name,
            photo_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      if (data && data.length > 0) {
        const questionIds = [...new Set(data.map(d => d.question_id))];
        const { data: questions } = await supabase
          .from('questions')
          .select('id, text, subject, topic, org, year')
          .in('id', questionIds);

        const qMap = new Map((questions || []).map(q => [q.id, q]));
        const enriched = data.map(d => ({
          ...d,
          question: qMap.get(d.question_id) || null,
        }));
        setEntries(enriched);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const searchQuestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setReportQuestions([]); return; }
    try {
      const { data } = await supabase
        .from('questions')
        .select('id, text, subject, org, year')
        .ilike('text', `%${query.trim()}%`)
        .limit(10);
      setReportQuestions(data || []);
    } catch { setReportQuestions([]); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => searchQuestions(reportQuestionSearch), 300);
    return () => clearTimeout(timeout);
  }, [reportQuestionSearch, searchQuestions]);

  const handleSubmitReport = async () => {
    if (!user || !selectedReportQuestion || !reportText.trim()) return;
    setSubmitting(true);
    try {
      const finalText = reportType === 'erro' ? `${ERRO_PREFIX}${reportText.trim()}` : reportText.trim();
      const { error } = await supabase
        .from('question_comments')
        .insert([{
          question_id: selectedReportQuestion.id,
          user_id: user.id,
          text: finalText,
        }]);
      if (error) throw error;
      setReportText('');
      setSelectedReportQuestion(null);
      setReportQuestionSearch('');
      setShowNewReport(false);
      await fetchFeedback();
    } catch (err: any) {
      alert('Erro ao enviar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await supabase.from('question_comments').delete().eq('id', id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = entries.filter(e => {
    const isError = e.text.startsWith(ERRO_PREFIX);
    if (filterType === 'erros' && !isError) return false;
    if (filterType === 'comentarios' && isError) return false;
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      const matchText = e.text.toLowerCase().includes(s);
      const matchUser = (e.profiles?.name || '').toLowerCase().includes(s);
      const matchQuestion = (e.question?.text || '').toLowerCase().includes(s);
      const matchSubject = (e.question?.subject || '').toLowerCase().includes(s);
      if (!matchText && !matchUser && !matchQuestion && !matchSubject) return false;
    }
    return true;
  });

  const errorCount = entries.filter(e => e.text.startsWith(ERRO_PREFIX)).length;
  const commentCount = entries.length - errorCount;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2 text-white">Feedback & Erros</h1>
        <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Comentários e reportes de erro das questões</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-white">{entries.length}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total</p>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-[#3B82F6]">{commentCount}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Comentários</p>
        </div>
        <div className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-red-400">{errorCount}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Erros</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar por texto, usuário ou matéria..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'comentarios', 'erros'] as const).map(type => (
            <button key={type} onClick={() => setFilterType(type)} className={cn(
              "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
              filterType === type
                ? type === 'erros' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
            )}>
              {type === 'todos' ? 'Todos' : type === 'erros' ? 'Erros' : 'Feedback'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewReport(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#3B82F6] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6]/90 transition-all shrink-0"
        >
          <Send size={14} /> Novo
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <MessageSquare size={40} className="mx-auto text-white/10" />
          <p className="text-white/30 text-sm">Nenhum feedback encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const isError = entry.text.startsWith(ERRO_PREFIX);
            const displayText = isError ? entry.text.slice(ERRO_PREFIX.length) : entry.text;
            const canDelete = isAdmin || entry.user_id === user?.id;
            return (
              <div key={entry.id} className={cn(
                "p-4 rounded-2xl border transition-all",
                isError ? "bg-red-500/5 border-red-500/10" : "bg-white/[0.02] border-white/5"
              )}>
                <div className="flex items-start gap-3">
                  {/* User avatar */}
                  <div className="relative w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                    {entry.profiles?.photo_url ? (
                      <Image src={entry.profiles.photo_url} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] font-bold text-white/40">{(entry.profiles?.name || '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{entry.profiles?.name || 'Usuário'}</span>
                      {isError && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={10} /> Erro
                        </span>
                      )}
                      <span className="text-[10px] text-white/30 font-mono">
                        {new Date(entry.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Comment text */}
                    <p className="text-sm text-white/80 leading-relaxed">{displayText}</p>

                    {/* Question context */}
                    {entry.question && (
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-start gap-2">
                        <BookOpen size={12} className="text-white/30 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-white/50 line-clamp-2">{entry.question.text}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {entry.question.subject && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{entry.question.subject}</span>}
                            {entry.question.org && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{entry.question.org}</span>}
                            {entry.question.year && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{entry.question.year}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="p-1.5 text-white/10 hover:text-red-500 transition-all shrink-0"
                    >
                      {deleting === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Report / Feedback Modal */}
      <AnimatePresence>
        {showNewReport && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-black uppercase tracking-tighter text-white">Novo Feedback</h2>
                <button onClick={() => { setShowNewReport(false); setSelectedReportQuestion(null); setReportText(''); setReportQuestionSearch(''); }}
                  className="p-2 text-white/40 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Tipo</label>
                  <div className="flex gap-2">
                    <button onClick={() => setReportType('feedback')} className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                      reportType === 'feedback' ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30" : "bg-white/5 text-white/40 border-white/5"
                    )}>
                      <MessageSquare size={14} className="inline mr-2" />Feedback
                    </button>
                    <button onClick={() => setReportType('erro')} className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                      reportType === 'erro' ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-white/5 text-white/40 border-white/5"
                    )}>
                      <AlertTriangle size={14} className="inline mr-2" />Reportar Erro
                    </button>
                  </div>
                </div>

                {/* Question search */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Questão</label>
                  {selectedReportQuestion ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2">
                      <BookOpen size={14} className="text-[#3B82F6] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 line-clamp-2">{selectedReportQuestion.text}</p>
                        <div className="flex gap-1.5 mt-1">
                          {selectedReportQuestion.subject && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{selectedReportQuestion.subject}</span>}
                          {selectedReportQuestion.org && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{selectedReportQuestion.org}</span>}
                        </div>
                      </div>
                      <button onClick={() => setSelectedReportQuestion(null)} className="text-white/30 hover:text-white transition-all shrink-0"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          value={reportQuestionSearch}
                          onChange={e => setReportQuestionSearch(e.target.value)}
                          placeholder="Buscar questão pelo enunciado..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                      {reportQuestions.length > 0 && (
                        <div className="bg-[#121212] border border-white/10 rounded-xl max-h-48 overflow-y-auto space-y-1 p-2">
                          {reportQuestions.map(q => (
                            <button key={q.id} onClick={() => { setSelectedReportQuestion(q); setReportQuestions([]); setReportQuestionSearch(''); }}
                              className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-all">
                              <p className="text-xs text-white/80 line-clamp-2">{q.text}</p>
                              <div className="flex gap-1.5 mt-1">
                                {q.subject && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{q.subject}</span>}
                                {q.org && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{q.org}</span>}
                                {q.year && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{q.year}</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    {reportType === 'erro' ? 'Descreva o erro encontrado' : 'Seu comentário'}
                  </label>
                  <textarea
                    value={reportText}
                    onChange={e => setReportText(e.target.value)}
                    placeholder={reportType === 'erro' ? 'Ex: A alternativa correta está marcada como B mas deveria ser D...' : 'Escreva seu feedback sobre a questão...'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none h-28 transition-all"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3 shrink-0">
                <button
                  onClick={() => { setShowNewReport(false); setSelectedReportQuestion(null); setReportText(''); setReportQuestionSearch(''); }}
                  className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={!selectedReportQuestion || !reportText.trim() || submitting}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                    reportType === 'erro' ? "bg-red-500 text-white hover:bg-red-500/90" : "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90"
                  )}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
