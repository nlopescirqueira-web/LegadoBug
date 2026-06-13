'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquare, AlertTriangle, Search, Loader2, Trash2,
  Send, X, BookOpen, Flag, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface UnifiedEntry {
  id: string;
  source: 'comment' | 'report';
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_name: string;
  user_photo: string | null;
  report_type?: string;
  report_status?: string;
  question_text?: string;
  question_subject?: string;
  question_org?: string;
  question_year?: string;
}

export default function Feedback() {
  const { user, isAdmin } = useAuth();
  const [entries, setEntries] = useState<UnifiedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'todos' | 'erros' | 'comentarios'>('todos');
  const [searchText, setSearchText] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const [commentsRes, reportsRes] = await Promise.all([
        supabase
          .from('question_comments')
          .select(`*, profiles:user_id (name, photo_url)`)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('question_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      const comments = commentsRes.data || [];
      const reports = reportsRes.data || [];

      const allQuestionIds = [
        ...new Set([
          ...comments.map(c => c.question_id),
          ...reports.map(r => r.question_id),
        ])
      ];

      let qMap = new Map<string, any>();
      if (allQuestionIds.length > 0) {
        const { data: questions } = await supabase
          .from('questions')
          .select('id, text, subject, topic, org, year')
          .in('id', allQuestionIds);
        qMap = new Map((questions || []).map(q => [q.id, q]));
      }

      const reportUserIds = [...new Set(reports.map(r => r.user_id).filter(Boolean))];
      let profileMap = new Map<string, any>();
      if (reportUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .in('id', reportUserIds);
        profileMap = new Map((profiles || []).map(p => [p.id, p]));
      }

      const unified: UnifiedEntry[] = [];

      for (const c of comments) {
        const q = qMap.get(c.question_id);
        unified.push({
          id: c.id,
          source: 'comment',
          question_id: c.question_id,
          user_id: c.user_id,
          text: c.text,
          created_at: c.created_at,
          user_name: c.profiles?.name || 'Usuário',
          user_photo: c.profiles?.photo_url || null,
          question_text: q?.text,
          question_subject: q?.subject,
          question_org: q?.org,
          question_year: q?.year,
        });
      }

      for (const r of reports) {
        const q = qMap.get(r.question_id);
        const profile = profileMap.get(r.user_id);
        unified.push({
          id: r.id,
          source: 'report',
          question_id: r.question_id,
          user_id: r.user_id || '',
          text: r.description || '',
          created_at: r.created_at,
          user_name: profile?.name || r.reported_by || 'Usuário',
          user_photo: profile?.photo_url || null,
          report_type: r.report_type,
          report_status: r.status,
          question_text: r.question_text || q?.text,
          question_subject: r.question_subject || q?.subject,
          question_org: q?.org,
          question_year: q?.year,
        });
      }

      unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setEntries(unified);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleDelete = async (entry: UnifiedEntry) => {
    setDeleting(entry.id);
    try {
      const table = entry.source === 'report' ? 'question_reports' : 'question_comments';
      await supabase.from(table).delete().eq('id', entry.id);
      setEntries(prev => prev.filter(e => e.id !== entry.id));
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleResolveReport = async (entry: UnifiedEntry) => {
    setResolvingId(entry.id);
    try {
      const newStatus = entry.report_status === 'resolved' ? 'pending' : 'resolved';
      await supabase.from('question_reports').update({ status: newStatus }).eq('id', entry.id);
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, report_status: newStatus } : e));
    } catch (err) {
      console.error('Error resolving:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = entries.filter(e => {
    if (filterType === 'erros' && e.source !== 'report') return false;
    if (filterType === 'comentarios' && e.source !== 'comment') return false;
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      const matchText = e.text.toLowerCase().includes(s);
      const matchUser = e.user_name.toLowerCase().includes(s);
      const matchQuestion = (e.question_text || '').toLowerCase().includes(s);
      const matchSubject = (e.question_subject || '').toLowerCase().includes(s);
      const matchType = (e.report_type || '').toLowerCase().includes(s);
      if (!matchText && !matchUser && !matchQuestion && !matchSubject && !matchType) return false;
    }
    return true;
  });

  const reportCount = entries.filter(e => e.source === 'report').length;
  const commentCount = entries.filter(e => e.source === 'comment').length;
  const pendingReports = entries.filter(e => e.source === 'report' && e.report_status !== 'resolved').length;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2 text-white">Feedback & Erros</h1>
        <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Todos os comentários e reportes de erro das questões</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-white">{entries.length}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total</p>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-[#3B82F6]">{commentCount}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Comentários</p>
        </div>
        <div className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-red-400">{reportCount}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Erros</p>
        </div>
        <div className="bg-white/[0.02] border border-amber-500/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-amber-400">{pendingReports}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Pendentes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar por texto, usuário, matéria ou tipo..."
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
            const isReport = entry.source === 'report';
            const isResolved = entry.report_status === 'resolved';
            return (
              <div key={`${entry.source}-${entry.id}`} className={cn(
                "p-4 rounded-2xl border transition-all",
                isReport
                  ? isResolved ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                  : "bg-white/[0.02] border-white/5"
              )}>
                <div className="flex items-start gap-3">
                  {/* User avatar */}
                  <div className="relative w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                    {entry.user_photo ? (
                      <Image src={entry.user_photo} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] font-bold text-white/40">{entry.user_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{entry.user_name}</span>
                      {isReport ? (
                        <>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1",
                            isResolved ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                          )}>
                            {isResolved ? <><CheckCircle2 size={10} /> Resolvido</> : <><Flag size={10} /> Erro</>}
                          </span>
                          {entry.report_type && (
                            <span className="text-[9px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">{entry.report_type}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MessageSquare size={10} /> Feedback
                        </span>
                      )}
                      <span className="text-[10px] text-white/30 font-mono">
                        {new Date(entry.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Text */}
                    {entry.text && <p className="text-sm text-white/80 leading-relaxed">{entry.text}</p>}

                    {/* Question context */}
                    {entry.question_text && (
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-start gap-2">
                        <BookOpen size={12} className="text-white/30 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-white/50 line-clamp-2">{entry.question_text}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {entry.question_subject && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{entry.question_subject}</span>}
                            {entry.question_org && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{entry.question_org}</span>}
                            {entry.question_year && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{entry.question_year}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {isReport && isAdmin && (
                      <button
                        onClick={() => handleResolveReport(entry)}
                        disabled={resolvingId === entry.id}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          isResolved ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10"
                        )}
                        title={isResolved ? 'Marcar como pendente' : 'Marcar como resolvido'}
                      >
                        {resolvingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(entry)}
                        disabled={deleting === entry.id}
                        className="p-1.5 text-white/10 hover:text-red-500 transition-all"
                      >
                        {deleting === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
