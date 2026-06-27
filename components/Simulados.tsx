'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Markdown from 'react-markdown';
import {
  BookOpen, Search, Filter, ChevronDown, Loader2, Plus, Check, CheckCircle2, XCircle,
  HelpCircle, Calendar, Clock, Play, Pause, ChevronLeft, ChevronRight, Trophy,
  Sparkles, AlertTriangle, BarChart3, Scissors, X, FileText, Users, Settings2,
  Trash2, Eye, EyeOff, Pencil, Video, BrainCircuit, GraduationCap, Target,
  ListOrdered, Save, ArrowRight, RotateCcw, Building2, Medal, Crown, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import SmartImport from './SmartImport';
import QuestionDiscussion from './QuestionDiscussion';

interface SimuladoQuestion {
  id: string;
  question_id: string;
  order_index: number;
  subject_group: string;
}

interface Simulado {
  id: string;
  title: string;
  description: string;
  concurso: string;
  total_time_minutes: number;
  available_from: string;
  available_until: string | null;
  created_at: string;
  created_by: string;
  is_published: boolean;
  questions: SimuladoQuestion[];
}

interface SimuladoAttempt {
  id: string;
  simulado_id: string;
  user_id: string;
  started_at: string;
  finished_at: string | null;
  answers: Record<string, number>;
  score: number | null;
  total_questions: number;
  correct_answers: number;
}

const normalizeString = (s: any): string => {
  if (s === null || s === undefined) return '';
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
};

export default function Simulados() {
  const { user, isAdmin } = useAuth();
  const { recordQuestionAnswer } = useStudy();

  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'solve' | 'result'>('list');
  const [selectedSimulado, setSelectedSimulado] = useState<Simulado | null>(null);

  // Create/Edit state
  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    description: '',
    concurso: '',
    total_time_minutes: 180,
    available_from: new Date().toISOString().split('T')[0],
    available_until: '',
    is_published: false,
  });
  const [editQuestions, setEditQuestions] = useState<{ question: any; subject_group: string }[]>([]);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [showSmartImport, setShowSmartImport] = useState(false);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSubject, setPickerSubject] = useState('');
  const [pickerOrg, setPickerOrg] = useState('');
  const [pickerYear, setPickerYear] = useState('');
  const [pickerVideo, setPickerVideo] = useState<'' | 'com' | 'sem'>('');

  // Solve state
  const [solveAnswers, setSolveAnswers] = useState<Record<string, number>>({});
  const [solveCurrentIdx, setSolveCurrentIdx] = useState(0);
  const [solveTimeLeft, setSolveTimeLeft] = useState(0);
  const [solveRunning, setSolveRunning] = useState(false);
  const [solveFinished, setSolveFinished] = useState(false);
  const [solveQuestions, setSolveQuestions] = useState<any[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<SimuladoAttempt | null>(null);
  const [cutOptions, setCutOptions] = useState<Record<string, number[]>>({});
  const [attempts, setAttempts] = useState<SimuladoAttempt[]>([]);
  const [simuladoRanking, setSimuladoRanking] = useState<{ user_id: string; name: string; photo_url: string | null; score: number; correct_answers: number; total_questions: number; finished_at: string }[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!solveRunning || solveTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setSolveTimeLeft(prev => {
        if (prev <= 1) {
          setSolveRunning(false);
          handleFinishSimulado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solveRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch simulados
  const fetchSimulados = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulados(data || []);
    } catch (err: any) {
      if (err.message?.includes('does not exist') || err.code === '42P01') {
        setSimulados([]);
      } else {
        console.error('Error fetching simulados:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttempts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('simulado_attempts')
        .select('*')
        .eq('user_id', user.id);
      setAttempts(data || []);
    } catch (err) {
      console.error('Error fetching attempts:', err);
    }
  }, [user]);

  const fetchAllQuestions = useCallback(async () => {
    try {
      const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      setAllQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  }, []);

  const fetchSimuladoRanking = useCallback(async (simuladoId: string) => {
    setLoadingRanking(true);
    try {
      const { data: allAttempts } = await supabase
        .from('simulado_attempts')
        .select('user_id, score, correct_answers, total_questions, finished_at')
        .eq('simulado_id', simuladoId)
        .not('finished_at', 'is', null)
        .order('score', { ascending: false });

      if (!allAttempts || allAttempts.length === 0) { setSimuladoRanking([]); return; }

      const userIds = [...new Set(allAttempts.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const ranked = allAttempts.map(a => {
        const profile = profileMap.get(a.user_id);
        return {
          user_id: a.user_id,
          name: profile?.name || 'Usuário',
          photo_url: profile?.photo_url || null,
          score: a.score || 0,
          correct_answers: a.correct_answers || 0,
          total_questions: a.total_questions || 0,
          finished_at: a.finished_at!,
        };
      });
      ranked.sort((a, b) => b.score - a.score || new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime());
      setSimuladoRanking(ranked);
    } catch (err) {
      console.error('Error fetching ranking:', err);
      setSimuladoRanking([]);
    } finally {
      setLoadingRanking(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulados();
    fetchAttempts();
  }, [fetchSimulados, fetchAttempts]);

  // Get status of a simulado for current user
  const getStatus = (sim: Simulado) => {
    const attempt = attempts.find(a => a.simulado_id === sim.id);
    if (attempt?.finished_at) return 'concluido';
    if (attempt) return 'em_andamento';
    const now = new Date();
    const from = new Date(sim.available_from);
    if (now < from) return 'agendado';
    return 'pendente';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido': return { text: 'Concluído', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'em_andamento': return { text: 'Em Andamento', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'agendado': return { text: 'Agendado', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      default: return { text: 'Pendente', color: 'text-white/60 bg-white/5 border-white/10' };
    }
  };

  // Save simulado
  const handleSaveSimulado = async () => {
    if (!editForm.title.trim()) { alert('Título obrigatório'); return; }
    if (editQuestions.length === 0) { alert('Adicione pelo menos uma questão'); return; }

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      concurso: editForm.concurso.trim(),
      total_time_minutes: editForm.total_time_minutes,
      available_from: editForm.available_from,
      available_until: editForm.available_until || null,
      is_published: editForm.is_published,
      created_by: user?.id,
      questions: editQuestions.map((eq, idx) => ({
        question_id: eq.question.id,
        order_index: idx,
        subject_group: eq.subject_group || eq.question.subject || 'Geral',
      })),
    };

    try {
      if (editForm.id) {
        const { error } = await supabase.from('simulados').update(payload).eq('id', editForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('simulados').insert(payload);
        if (error) throw error;
      }
      await fetchSimulados();
      setActiveView('list');
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    }
  };

  // Start simulado
  const handleStartSimulado = async (sim: Simulado) => {
    const existingAttempt = attempts.find(a => a.simulado_id === sim.id);

    // Fetch full question data
    const questionIds = (sim.questions || []).map(q => q.question_id);
    if (questionIds.length === 0) { alert('Este simulado não possui questões.'); return; }

    const { data: questionData } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    if (!questionData || questionData.length === 0) { alert('Questões não encontradas.'); return; }

    const ordered = (sim.questions || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(sq => {
        const fullQ = questionData.find(q => q.id === sq.question_id);
        return fullQ ? { ...fullQ, subject_group: sq.subject_group } : null;
      })
      .filter(Boolean);

    setSolveQuestions(ordered);

    if (existingAttempt?.finished_at) {
      setCurrentAttempt(existingAttempt);
      setSolveAnswers(existingAttempt.answers || {});
      setSelectedSimulado(sim);
      fetchSimuladoRanking(sim.id);
      setActiveView('result');
      return;
    }

    setSolveCurrentIdx(0);
    setSolveTimeLeft(sim.total_time_minutes * 60);
    setSolveFinished(false);
    setCutOptions({});
    setSelectedSimulado(sim);

    if (existingAttempt) {
      setSolveAnswers(existingAttempt.answers || {});
      setCurrentAttempt(existingAttempt);
    } else {
      setSolveAnswers({});
      const { data: newAttempt } = await supabase
        .from('simulado_attempts')
        .insert({
          simulado_id: sim.id,
          user_id: user?.id,
          answers: {},
          total_questions: ordered.length,
          correct_answers: 0,
        })
        .select()
        .single();
      setCurrentAttempt(newAttempt);
    }

    setSolveRunning(true);
    setActiveView('solve');
  };

  // Finish simulado
  const handleFinishSimulado = async () => {
    setSolveRunning(false);
    setSolveFinished(true);

    const totalQ = solveQuestions.length;
    let correct = 0;
    let answered = 0;

    solveQuestions.forEach(q => {
      const userAnswer = solveAnswers[q.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        answered++;
        const isCorrect = userAnswer === q.correct_option_index;
        if (isCorrect) correct++;
        recordQuestionAnswer(q.id, isCorrect, q.subject, q.topic, userAnswer);
      }
    });

    const score = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

    if (currentAttempt) {
      await supabase
        .from('simulado_attempts')
        .update({
          answers: solveAnswers,
          finished_at: new Date().toISOString(),
          score,
          correct_answers: correct,
          total_questions: totalQ,
        })
        .eq('id', currentAttempt.id);
    }

    setCurrentAttempt(prev => prev ? { ...prev, score, correct_answers: correct, total_questions: totalQ, finished_at: new Date().toISOString(), answers: solveAnswers } : prev);
    await fetchAttempts();
    if (selectedSimulado) fetchSimuladoRanking(selectedSimulado.id);
    setActiveView('result');
  };

  // Delete simulado
  const handleDeleteSimulado = async (id: string) => {
    if (!confirm('Deseja excluir este simulado permanentemente?')) return;
    try {
      await supabase.from('simulado_attempts').delete().eq('simulado_id', id);
      await supabase.from('simulados').delete().eq('id', id);
      await fetchSimulados();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  // Open edit
  const handleEditSimulado = async (sim: Simulado) => {
    setEditForm({
      id: sim.id,
      title: sim.title,
      description: sim.description || '',
      concurso: sim.concurso || '',
      total_time_minutes: sim.total_time_minutes,
      available_from: sim.available_from?.split('T')[0] || '',
      available_until: sim.available_until?.split('T')[0] || '',
      is_published: sim.is_published,
    });

    const questionIds = (sim.questions || []).map(q => q.question_id);
    if (questionIds.length > 0) {
      const { data } = await supabase.from('questions').select('*').in('id', questionIds);
      const ordered = (sim.questions || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(sq => {
          const fullQ = (data || []).find(q => q.id === sq.question_id);
          return fullQ ? { question: fullQ, subject_group: sq.subject_group } : null;
        })
        .filter(Boolean) as { question: any; subject_group: string }[];
      setEditQuestions(ordered);
    } else {
      setEditQuestions([]);
    }

    await fetchAllQuestions();
    setActiveView('edit');
  };

  const handleNewSimulado = async () => {
    setEditForm({
      id: '',
      title: '',
      description: '',
      concurso: '',
      total_time_minutes: 180,
      available_from: new Date().toISOString().split('T')[0],
      available_until: '',
      is_published: false,
    });
    setEditQuestions([]);
    await fetchAllQuestions();
    setActiveView('create');
  };

  // Picker helpers
  const pickerFiltered = useMemo(() => {
    const selectedIds = new Set(editQuestions.map(eq => eq.question.id));
    return allQuestions.filter(q => {
      if (selectedIds.has(q.id)) return false;
      if (pickerSearch && !normalizeString(q.text).includes(normalizeString(pickerSearch)) &&
          !normalizeString(q.subject).includes(normalizeString(pickerSearch)) &&
          !normalizeString(q.topic).includes(normalizeString(pickerSearch)) &&
          !normalizeString(q.org).includes(normalizeString(pickerSearch))) return false;
      if (pickerSubject && normalizeString(q.subject) !== normalizeString(pickerSubject)) return false;
      if (pickerOrg && normalizeString(q.org) !== normalizeString(pickerOrg)) return false;
      if (pickerYear && String(q.year) !== pickerYear) return false;
      if (pickerVideo === 'com' && !q.video_url) return false;
      if (pickerVideo === 'sem' && q.video_url) return false;
      return true;
    });
  }, [allQuestions, editQuestions, pickerSearch, pickerSubject, pickerOrg, pickerYear, pickerVideo]);

  const uniqueSubjects = useMemo(() => {
    return [...new Set(allQuestions.map(q => q.subject).filter(Boolean))].sort();
  }, [allQuestions]);

  const uniqueOrgs = useMemo(() => {
    return [...new Set(allQuestions.map(q => q.org).filter(Boolean))].sort();
  }, [allQuestions]);

  const uniqueYears = useMemo(() => {
    return [...new Set(allQuestions.map(q => q.year).filter(Boolean))].map(String).sort().reverse();
  }, [allQuestions]);

  // Subject groups in edit
  const subjectGroups = useMemo(() => {
    const groups: Record<string, { question: any; subject_group: string }[]> = {};
    editQuestions.forEach(eq => {
      const group = eq.subject_group || 'Geral';
      if (!groups[group]) groups[group] = [];
      groups[group].push(eq);
    });
    return groups;
  }, [editQuestions]);

  // Toggle cut option
  const toggleCut = (qId: string, optIdx: number) => {
    if (solveAnswers[qId] !== undefined) return;
    setCutOptions(prev => {
      const current = prev[qId] || [];
      if (current.includes(optIdx)) return { ...prev, [qId]: current.filter(i => i !== optIdx) };
      const q = solveQuestions.find(sq => sq.id === qId);
      const maxCuts = (q?.options?.length || 5) - 1;
      if (current.length >= maxCuts) return prev;
      return { ...prev, [qId]: [...current, optIdx] };
    });
  };

  const [expandedResultQuestions, setExpandedResultQuestions] = useState<Set<string>>(new Set());

  const toggleResultExpand = (qId: string) => {
    setExpandedResultQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId); else next.add(qId);
      return next;
    });
  };

  const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/i.test(url);
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // ====================== RENDER ======================

  // RESULT VIEW
  if (activeView === 'result' && selectedSimulado && currentAttempt) {
    const totalQ = currentAttempt.total_questions;
    const correctQ = currentAttempt.correct_answers;
    const score = currentAttempt.score || 0;
    const answeredQ = Object.keys(currentAttempt.answers || {}).length;
    const wrongQ = answeredQ - correctQ;
    const unansweredQ = totalQ - answeredQ;
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <button onClick={() => { setActiveView('list'); setSelectedSimulado(null); setExpandedResultQuestions(new Set()); }}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">
          <ChevronLeft size={18} /> Voltar
        </button>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <Trophy size={48} className={cn("mx-auto", score >= 70 ? "text-amber-400" : score >= 50 ? "text-blue-400" : "text-red-400")} />
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedSimulado.title}</h2>
          <div className="text-6xl font-black text-white">{score}%</div>
          <p className="text-white/60 text-lg">{correctQ} de {totalQ} questões corretas</p>
          <div className="w-full max-w-md mx-auto h-4 bg-white/5 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${score}%` }} />
          </div>
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{correctQ} acertos</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">{wrongQ} erros</span>
            </div>
            {unansweredQ > 0 && (
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-white/30" />
                <span className="text-sm font-bold text-white/30">{unansweredQ} em branco</span>
              </div>
            )}
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-amber-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Ranking do Simulado</h3>
          </div>
          {loadingRanking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-white/30" />
            </div>
          ) : simuladoRanking.length === 0 ? (
            <p className="text-white/30 text-sm py-4">Nenhum participante ainda.</p>
          ) : (
            <div className="space-y-2">
              {simuladoRanking.map((entry, idx) => {
                const isCurrentUser = entry.user_id === user?.id;
                const position = idx + 1;
                return (
                  <div key={entry.user_id} className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                    isCurrentUser ? "bg-[#3B82F6]/10 border-[#3B82F6]/30" : "bg-white/[0.02] border-white/5"
                  )}>
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      {position === 1 ? <Crown size={24} className="text-amber-400" /> :
                       position === 2 ? <Medal size={24} className="text-gray-300" /> :
                       position === 3 ? <Medal size={24} className="text-amber-700" /> :
                       <span className="text-lg font-black text-white/40">{position}º</span>}
                    </div>
                    <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                      {entry.photo_url ? (
                        <Image src={entry.photo_url} alt={entry.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-bold text-white/40">{entry.name?.charAt(0).toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold truncate", isCurrentUser ? "text-[#3B82F6]" : "text-white")}>
                        {entry.name} {isCurrentUser && <span className="text-[10px] text-white/40">(você)</span>}
                      </p>
                      <p className="text-[10px] text-white/40">{entry.correct_answers}/{entry.total_questions} acertos</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-2xl font-black",
                        entry.score >= 70 ? "text-emerald-400" : entry.score >= 50 ? "text-amber-400" : "text-red-400"
                      )}>{entry.score}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review answers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Revisão das Questões</h3>
            <button
              onClick={() => {
                if (expandedResultQuestions.size === solveQuestions.length) {
                  setExpandedResultQuestions(new Set());
                } else {
                  setExpandedResultQuestions(new Set(solveQuestions.map(q => q.id)));
                }
              }}
              className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:text-[#3B82F6]/80 transition-all">
              {expandedResultQuestions.size === solveQuestions.length ? 'Recolher todas' : 'Expandir todas'}
            </button>
          </div>
          {solveQuestions.length > 0 ? solveQuestions.map((q, idx) => {
            const userAnswer = currentAttempt.answers?.[q.id];
            const wasAnswered = userAnswer !== undefined && userAnswer !== null;
            const isCorrect = wasAnswered && userAnswer === q.correct_option_index;
            const isWrong = wasAnswered && userAnswer !== q.correct_option_index;
            const isExpanded = expandedResultQuestions.has(q.id);
            const options = q.options || [];
            return (
              <div key={q.id} className={cn("border rounded-2xl overflow-hidden transition-all",
                isCorrect ? "border-emerald-500/20 bg-emerald-500/5" :
                isWrong ? "border-red-500/20 bg-red-500/5" :
                "border-white/10 bg-white/[0.02]")}>
                {/* Collapsed header — always visible */}
                <button onClick={() => toggleResultExpand(q.id)}
                  className="w-full text-left p-5 flex items-center gap-3 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 w-6">Q{idx + 1}</span>
                    {isCorrect ? <CheckCircle2 size={16} className="text-emerald-400" /> :
                     isWrong ? <XCircle size={16} className="text-red-400" /> :
                     <HelpCircle size={16} className="text-white/30" />}
                  </div>
                  <p className="text-sm text-white/80 flex-1 line-clamp-1">{q.text}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/30">
                      {wasAnswered ? String.fromCharCode(65 + userAnswer) : 'Branco'}
                      {isWrong && ` → ${String.fromCharCode(65 + q.correct_option_index)}`}
                    </span>
                    {q.video_url && <Video size={12} className="text-[#3B82F6]" />}
                    <ChevronDown size={14} className={cn("text-white/30 transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    {/* Full question text */}
                    {q.image_url && (
                      <div className="w-full overflow-hidden rounded-xl border border-white/10">
                        <img src={q.image_url} alt="Imagem da questão" className="w-full max-h-[300px] object-contain" />
                      </div>
                    )}
                    <div className="text-sm text-white/80 whitespace-pre-wrap">{q.text}</div>

                    {/* Options */}
                    <div className="space-y-2">
                      {options.map((opt: string, optIdx: number) => {
                        const isUserChoice = userAnswer === optIdx;
                        const isCorrectOption = q.correct_option_index === optIdx;
                        return (
                          <div key={optIdx} className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border transition-all",
                            isCorrectOption
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : isUserChoice
                                ? "border-red-500/30 bg-red-500/10"
                                : "border-white/5 bg-white/[0.02]"
                          )}>
                            <span className={cn("text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                              isCorrectOption ? "bg-emerald-500 text-white" : isUserChoice ? "bg-red-500 text-white" : "bg-white/10 text-white/40"
                            )}>{String.fromCharCode(65 + optIdx)}</span>
                            <span className="text-sm text-white/70 flex-1">{opt}</span>
                            {isCorrectOption && <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />}
                            {isUserChoice && !isCorrectOption && <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Explicação</span>
                        <div className="text-sm text-white/70 whitespace-pre-wrap">{q.explanation}</div>
                      </div>
                    )}

                    {/* Video */}
                    {q.video_url && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Resolução em Vídeo</span>
                        {isYouTubeUrl(q.video_url) ? (
                          <div className="aspect-video rounded-xl overflow-hidden">
                            <iframe src={getYouTubeEmbedUrl(q.video_url) || ''} className="w-full h-full" allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                          </div>
                        ) : (
                          <a href={q.video_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl text-[#3B82F6] text-sm font-bold hover:bg-[#3B82F6]/20 transition-all">
                            <Video size={16} /> Abrir Resolução em Vídeo
                          </a>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-white/30">
                      {q.subject && <span className="bg-white/5 px-2 py-1 rounded">{q.subject}</span>}
                      {q.topic && <span className="bg-white/5 px-2 py-1 rounded">{q.topic}</span>}
                      {q.org && <span className="bg-white/5 px-2 py-1 rounded">{q.org}</span>}
                      {q.year && <span className="bg-white/5 px-2 py-1 rounded">{q.year}</span>}
                    </div>

                    {/* Feedback / Discussion */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare size={14} className="text-[#3B82F6]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">Feedback & Discussão</span>
                      </div>
                      <QuestionDiscussion questionId={q.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          }) : <p className="text-white/30 text-sm">Carregando questões para revisão...</p>}
        </div>
      </div>
    );
  }

  // SOLVE VIEW
  if (activeView === 'solve' && selectedSimulado && solveQuestions.length > 0) {
    const currentQ = solveQuestions[solveCurrentIdx];
    const answeredCount = Object.keys(solveAnswers).length;
    const subjectGroupsInSolve = [...new Set(solveQuestions.map(q => q.subject_group || q.subject))];

    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (confirm('Deseja sair? Seu progresso será salvo.')) { setSolveRunning(false); setActiveView('list'); } }}
              className="p-2 text-white/40 hover:text-white transition-all"><ChevronLeft size={24} /></button>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{selectedSimulado.title}</h3>
              <p className="text-[10px] text-white/40">{answeredCount}/{solveQuestions.length} respondidas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-lg font-bold",
              solveTimeLeft < 300 ? "border-red-500/30 text-red-400 bg-red-500/10 animate-pulse" :
              solveTimeLeft < 600 ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
              "border-white/10 text-white bg-white/5")}>
              <Clock size={18} />
              {formatTime(solveTimeLeft)}
            </div>
            <button onClick={() => setSolveRunning(!solveRunning)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
              {solveRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => { if (confirm('Deseja finalizar o simulado agora?')) handleFinishSimulado(); }}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
              Finalizar
            </button>
          </div>
        </div>

        {/* Subject navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {subjectGroupsInSolve.map(sg => {
            const questionsInGroup = solveQuestions.filter(q => (q.subject_group || q.subject) === sg);
            const firstIdx = solveQuestions.findIndex(q => (q.subject_group || q.subject) === sg);
            const isActive = (currentQ.subject_group || currentQ.subject) === sg;
            return (
              <button key={sg} onClick={() => setSolveCurrentIdx(firstIdx)}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
                  isActive ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20" : "bg-white/5 text-white/40 border-white/5 hover:text-white/70")}>
                {sg} ({questionsInGroup.length})
              </button>
            );
          })}
        </div>

        {/* Question navigation grid */}
        <div className="flex flex-wrap gap-1.5">
          {solveQuestions.map((q, idx) => {
            const isAnswered = solveAnswers[q.id] !== undefined;
            const isCurrent = idx === solveCurrentIdx;
            return (
              <button key={q.id} onClick={() => setSolveCurrentIdx(idx)}
                className={cn("w-9 h-9 rounded-lg text-xs font-bold transition-all border",
                  isCurrent ? "bg-[#3B82F6] text-white border-[#3B82F6]" :
                  isAnswered ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" :
                  "bg-white/5 text-white/40 border-white/5 hover:bg-white/10")}>
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current question */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white bg-[#3B82F6] px-4 py-2 rounded-xl uppercase tracking-widest">
              Questão {solveCurrentIdx + 1} de {solveQuestions.length}
            </span>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{currentQ.subject_group || currentQ.subject}</span>
          </div>

          {currentQ.image_url && (
            <div className="w-full overflow-hidden rounded-2xl border border-white/10">
              <img src={currentQ.image_url} alt="Imagem da questão" className="w-full max-h-[400px] object-contain" />
            </div>
          )}
          <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap"><Markdown>{currentQ.text}</Markdown></div>

          <div className="space-y-2">
            {(currentQ.options || []).map((opt: string, optIdx: number) => {
              const isSelected = solveAnswers[currentQ.id] === optIdx;
              const isCut = (cutOptions[currentQ.id] || []).includes(optIdx);
              const isAnswered = solveFinished;
              const isCorrect = optIdx === currentQ.correct_option_index;

              return (
                <div key={optIdx} className="flex items-center gap-2 group">
                  <button
                    onClick={() => {
                      if (isCut || solveFinished) return;
                      setSolveAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
                    }}
                    disabled={isCut || solveFinished}
                    className={cn(
                      "flex-1 text-left px-5 py-4 rounded-2xl border text-sm transition-all duration-300 flex items-center gap-4 relative",
                      isCut ? "opacity-20 line-through cursor-not-allowed border-white/5" :
                      isAnswered ? (isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : isSelected ? "bg-red-500/10 border-red-500/30 text-red-400" : "border-white/5 text-white/50") :
                      isSelected ? "bg-[#3B82F6]/10 border-[#3B82F6]/40 text-[#3B82F6] shadow-[0_0_20px_-5px_#3B82F6]" :
                      "border-white/5 text-white/80 hover:border-white/20 hover:bg-white/[0.03]"
                    )}>
                    <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border transition-all",
                      isCut ? "border-white/10 text-white/20" :
                      isAnswered ? (isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : isSelected ? "border-red-500 bg-red-500 text-white" : "border-white/10 text-white/30") :
                      isSelected ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-white/10 text-white/40"
                    )}>
                      {isAnswered ? (isCorrect ? <Check size={14} /> : isSelected ? <XCircle size={14} /> : String.fromCharCode(65 + optIdx)) : String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                  {!solveFinished && solveAnswers[currentQ.id] === undefined && (
                    <button onClick={() => toggleCut(currentQ.id, optIdx)}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                        isCut
                          ? "opacity-100 bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/20"
                          : "opacity-0 group-hover:opacity-100 border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/20"
                      )}
                      title={isCut ? "Restaurar opção" : "Eliminar"}>
                      {isCut ? <RotateCcw size={14} /> : <Scissors size={14} />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button onClick={() => setSolveCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={solveCurrentIdx === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 transition-all text-xs font-bold uppercase tracking-widest">
              <ChevronLeft size={16} /> Anterior
            </button>
            <button onClick={() => setSolveCurrentIdx(prev => Math.min(solveQuestions.length - 1, prev + 1))}
              disabled={solveCurrentIdx === solveQuestions.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-20 transition-all text-xs font-bold uppercase tracking-widest">
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CREATE / EDIT VIEW
  if (activeView === 'create' || activeView === 'edit') {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveView('list')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">
            <ChevronLeft size={18} /> Voltar
          </button>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {activeView === 'create' ? 'Criar Simulado' : 'Editar Simulado'}
          </h2>
        </div>

        {/* Form */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Título do Simulado *</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                placeholder="Ex: Simulado PMSP 2024" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Concurso Alvo</label>
              <input type="text" value={editForm.concurso} onChange={e => setEditForm(p => ({ ...p, concurso: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                placeholder="Ex: PMSP, PRF, AFA" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Descrição</label>
            <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors min-h-[80px]"
              placeholder="Descrição opcional do simulado" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tempo (minutos)</label>
              <input type="number" value={editForm.total_time_minutes} onChange={e => setEditForm(p => ({ ...p, total_time_minutes: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Disponível a partir de</label>
              <input type="date" value={editForm.available_from} onChange={e => setEditForm(p => ({ ...p, available_from: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Disponível até (opcional)</label>
              <input type="date" value={editForm.available_until} onChange={e => setEditForm(p => ({ ...p, available_until: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setEditForm(p => ({ ...p, is_published: !p.is_published }))}
              className={cn("w-5 h-5 rounded border transition-all flex items-center justify-center",
                editForm.is_published ? "bg-[#3B82F6] border-[#3B82F6]" : "bg-white/5 border-white/10")}>
              {editForm.is_published && <Check size={12} className="text-white" strokeWidth={3} />}
            </button>
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Publicar (visível para alunos)</span>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ListOrdered size={18} className="text-[#3B82F6]" /> Questões ({editQuestions.length})
              </h3>
              {editQuestions.length > 0 && (
                <p className="text-[10px] text-white/30 mt-1 flex items-center gap-2">
                  <span className="text-emerald-400">{editQuestions.filter(eq => eq.question.video_url).length} com vídeo</span>
                  <span>•</span>
                  <span>{editQuestions.filter(eq => !eq.question.video_url).length} sem vídeo</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowQuestionPicker(true); setPickerSearch(''); setPickerSubject(''); setPickerOrg(''); setPickerYear(''); setPickerVideo(''); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3B82F6]/20 transition-all border border-[#3B82F6]/20">
                <Plus size={14} /> Buscar do Banco
              </button>
              <button onClick={() => setShowSmartImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                <Sparkles size={14} /> Import por IA
              </button>
            </div>
          </div>

          {/* Grouped questions */}
          {Object.entries(subjectGroups).length > 0 ? (
            Object.entries(subjectGroups).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <GraduationCap size={14} className="text-[#3B82F6]" />
                  <span className="text-xs font-black text-[#3B82F6] uppercase tracking-widest">{group}</span>
                  <span className="text-[10px] text-white/30 font-bold">({items.length} questões)</span>
                </div>
                {items.map((eq, localIdx) => {
                  const globalIdx = editQuestions.indexOf(eq);
                  return (
                    <div key={eq.question.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 group">
                      <span className="text-[10px] font-black text-white/30 w-6 text-center">{globalIdx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-white/70 line-clamp-1 flex-1">{eq.question.text}</p>
                          {eq.question.video_url ? (
                            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0"><Video size={8} /></span>
                          ) : (
                            <span className="text-[8px] font-bold text-white/15 bg-white/5 px-1.5 py-0.5 rounded shrink-0">Ø</span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30">{eq.question.subject} • {eq.question.topic || 'Sem assunto'}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { if (globalIdx > 0) { const next = [...editQuestions]; [next[globalIdx], next[globalIdx - 1]] = [next[globalIdx - 1], next[globalIdx]]; setEditQuestions(next); } }}
                          className="p-1 text-white/20 hover:text-white" title="Mover para cima">▲</button>
                        <button onClick={() => { if (globalIdx < editQuestions.length - 1) { const next = [...editQuestions]; [next[globalIdx], next[globalIdx + 1]] = [next[globalIdx + 1], next[globalIdx]]; setEditQuestions(next); } }}
                          className="p-1 text-white/20 hover:text-white" title="Mover para baixo">▼</button>
                        <button onClick={() => setEditQuestions(prev => prev.filter((_, i) => i !== globalIdx))}
                          className="p-1 text-white/20 hover:text-red-400" title="Remover"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-white/20 uppercase tracking-[0.2em] font-black text-[10px] bg-white/[0.01] rounded-2xl border border-white/5 border-dashed">
              Nenhuma questão adicionada. Use os botões acima para buscar ou importar.
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button onClick={() => setActiveView('list')}
            className="px-6 py-3 bg-white/5 text-white/60 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Cancelar
          </button>
          <button onClick={handleSaveSimulado}
            className="px-8 py-3 bg-[#3B82F6] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6]/80 transition-all shadow-lg shadow-[#3B82F6]/20 flex items-center gap-2">
            <Save size={16} /> Salvar Simulado
          </button>
        </div>

        {/* Question Picker Modal */}
        <AnimatePresence>
          {showQuestionPicker && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowQuestionPicker(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Buscar Questões do Banco</h3>
                  <button onClick={() => setShowQuestionPicker(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-4 space-y-3 border-b border-white/5">
                  <input type="text" value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
                    placeholder="Buscar por texto, matéria, assunto ou órgão..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors" />
                  <div className="flex flex-wrap gap-2">
                    <select value={pickerSubject} onChange={e => setPickerSubject(e.target.value)}
                      className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      style={{ colorScheme: 'dark' }}>
                      <option value="" className="bg-[#1a1a1a] text-white">Todas matérias</option>
                      {uniqueSubjects.map(s => <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>)}
                    </select>
                    <select value={pickerOrg} onChange={e => setPickerOrg(e.target.value)}
                      className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      style={{ colorScheme: 'dark' }}>
                      <option value="" className="bg-[#1a1a1a] text-white">Todos órgãos</option>
                      {uniqueOrgs.map(s => <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>)}
                    </select>
                    <select value={pickerYear} onChange={e => setPickerYear(e.target.value)}
                      className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      style={{ colorScheme: 'dark' }}>
                      <option value="" className="bg-[#1a1a1a] text-white">Todos anos</option>
                      {uniqueYears.map(y => <option key={y} value={y} className="bg-[#1a1a1a] text-white">{y}</option>)}
                    </select>
                    <select value={pickerVideo} onChange={e => setPickerVideo(e.target.value as '' | 'com' | 'sem')}
                      className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      style={{ colorScheme: 'dark' }}>
                      <option value="" className="bg-[#1a1a1a] text-white">Vídeo: Todos</option>
                      <option value="com" className="bg-[#1a1a1a] text-white">Com vídeo</option>
                      <option value="sem" className="bg-[#1a1a1a] text-white">Sem vídeo</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    <span>{pickerFiltered.length} questões encontradas</span>
                    <span>{pickerFiltered.filter(q => q.video_url).length} com vídeo</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {pickerFiltered.slice(0, 50).map(q => (
                    <button key={q.id}
                      onClick={() => {
                        setEditQuestions(prev => [...prev, { question: q, subject_group: q.subject || 'Geral' }]);
                      }}
                      className="w-full text-left p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-[#3B82F6]/30 transition-all group">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/70 line-clamp-2 flex-1">{q.text}</p>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {q.video_url ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg"><Video size={10} /> Vídeo</span>
                          ) : (
                            <span className="text-[9px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-lg">Sem vídeo</span>
                          )}
                          <Plus size={16} className="text-white/20 group-hover:text-[#3B82F6]" />
                        </div>
                      </div>
                      <p className="text-[10px] text-white/30 mt-1">{q.subject} • {q.topic || ''} • {q.org || ''} • Ano: {q.year || '-'}</p>
                    </button>
                  ))}
                  {pickerFiltered.length === 0 && (
                    <p className="text-center text-white/20 py-8 text-xs uppercase tracking-widest font-bold">Nenhuma questão encontrada</p>
                  )}
                  {pickerFiltered.length > 50 && (
                    <p className="text-center text-white/30 text-[10px] uppercase tracking-widest pt-2">Mostrando 50 de {pickerFiltered.length} resultados. Refine sua busca.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Import Modal */}
        <AnimatePresence>
          {showSmartImport && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setShowSmartImport(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#111] z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Importar Questões Inéditas por IA</h3>
                  <button onClick={() => setShowSmartImport(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-4">
                  <SmartImport
                    onComplete={() => {
                      setShowSmartImport(false);
                      fetchAllQuestions();
                    }}
                    onQuestionsImported={async (ids) => {
                      const { data } = await supabase.from('questions').select('*').in('id', ids);
                      if (data) {
                        setEditQuestions(prev => [
                          ...prev,
                          ...data.map(q => ({ question: q, subject_group: q.subject || 'Geral' }))
                        ]);
                      }
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // LIST VIEW (default)
  const visibleSimulados = isAdmin ? simulados : simulados.filter(s => s.is_published);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col mb-1 select-none">
        <h2 className="text-4xl font-black text-white flex items-center gap-2 italic uppercase tracking-tighter">
          <Target size={36} className="text-[#3B82F6]" />
          Simulados
        </h2>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={handleNewSimulado}
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#3B82F6]/80 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#3B82F6]/20">
            <Plus size={18} /> Criar Simulado
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#3B82F6]" />
        </div>
      ) : visibleSimulados.length > 0 ? (
        <div className="space-y-4">
          {visibleSimulados.map(sim => {
            const status = getStatus(sim);
            const statusInfo = getStatusLabel(status);
            const questionCount = sim.questions?.length || 0;
            const attempt = attempts.find(a => a.simulado_id === sim.id);

            return (
              <motion.div key={sim.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:border-[#3B82F6]/20 transition-all group">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-[#3B82F6] transition-colors">
                        {sim.title}
                      </h3>
                      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", statusInfo.color)}>
                        {statusInfo.text}
                      </span>
                      {!sim.is_published && isAdmin && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-white/30 bg-white/5 border border-white/10 uppercase tracking-widest">Rascunho</span>
                      )}
                    </div>
                    {sim.description && <p className="text-sm text-white/50 line-clamp-2">{sim.description}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      {sim.concurso && (
                        <span className="flex items-center gap-1"><Building2 size={12} /> {sim.concurso}</span>
                      )}
                      <span className="flex items-center gap-1"><FileText size={12} /> {questionCount} questões</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {sim.total_time_minutes} min</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(sim.available_from).toLocaleDateString()}</span>
                      {attempt?.score != null && (
                        <span className="flex items-center gap-1 text-emerald-400"><Trophy size={12} /> {attempt.score}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {status !== 'agendado' && (
                      <button onClick={() => handleStartSimulado(sim)}
                        className={cn("flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          status === 'concluido' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" :
                          status === 'em_andamento' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20" :
                          "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/80 shadow-lg shadow-[#3B82F6]/20")}>
                        {status === 'concluido' ? <><Eye size={16} /> Ver Resultado</> :
                         status === 'em_andamento' ? <><Play size={16} /> Continuar</> :
                         <><Play size={16} /> Iniciar</>}
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button onClick={() => handleEditSimulado(sim)}
                          className="p-2 text-white/20 hover:text-white transition-colors" title="Editar">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDeleteSimulado(sim.id)}
                          className="p-2 text-white/20 hover:text-red-500 transition-colors" title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/[0.01] rounded-[40px] border border-white/5 border-dashed flex flex-col items-center">
          <Target size={48} className="text-[#3B82F6]/30 mb-6" />
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Nenhum Simulado Disponível</h3>
          <p className="text-sm text-white/40 max-w-xs">
            {isAdmin ? 'Crie seu primeiro simulado usando o botão acima.' : 'Novos simulados serão disponibilizados pelo administrador.'}
          </p>
        </div>
      )}
    </div>
  );
}
