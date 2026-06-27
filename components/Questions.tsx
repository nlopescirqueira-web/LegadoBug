'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Markdown from 'react-markdown';
import {
  BookOpen,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Plus,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Building2,
  Trophy,
  BrainCircuit,
  Settings2,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Scissors,
  RotateCcw,
  BookMarked,
  FolderPlus,
  Folder,
  Trash2,
  Star,
  FileText,
  ChevronLeft,
  ChevronRight,
  Play,
  Pencil,
  X,
  FolderInput,
  Video,
  Link,
  ExternalLink,
  Save,
  Flag,
  AlertOctagon,
  Settings,
  Eye,
  ImagePlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import { useImprovement } from '@/context/ImprovementContext';
import AdminQuestions from './AdminQuestions';
import QuestionStats from './QuestionStats';
import QuestionDiscussion from './QuestionDiscussion';
import AprimoramentoModal from './AprimoramentoModal';
import ImprovementWidget from './ImprovementWidget';

// Types for filters
interface AdvancedFilters {
  disciplina: string[];
  assunto: string[];
  ano: string[];
  banca: string[];
  instituicao: string[];
  dificuldade: string[];
  videoRes?: string[];
  exclude: {
    alreadyAnswered: boolean;
    incorrect: boolean;
    correct: boolean;
    lastWeek: boolean;
    lastMonth: boolean;
  };
}

// Helper para normalizar QUALQUER texto (tira acentos, espaços e iguala case) - A SOLUÇÃO DEFINITIVA
const normalizeString = (s: any): string => {
  if (s === null || s === undefined) return '';
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
};

// Helper Checkbox component
function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div 
        onClick={() => onChange(!checked)}
        className={cn(
          "w-5 h-5 rounded border transition-all flex items-center justify-center",
          checked 
            ? "bg-[#3B82F6] border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
            : "bg-white/5 border-white/10 group-hover:border-white/20"
        )}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
        checked ? "text-white" : "text-white/30 group-hover:text-white/50"
      )}>
        {label}
      </span>
    </label>
  );
}

// Simple MultiSelect with user-demanded style
function FilterDropdown({ 
  label, 
  options, 
  selected, 
  onChange,
  disabled = false,
  tooltip = "",
  showCounts = false,
  questions = []
}: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onChange: (selected: string[]) => void,
  disabled?: boolean,
  tooltip?: string,
  showCounts?: boolean,
  questions?: any[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const getCount = (opt: string) => {
    if (!showCounts || !questions.length) return null;
    if (label === 'Ano') {
      return questions.filter(q => normalizeString(q.year) === normalizeString(opt)).length;
    }
    return null;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 min-w-[140px]" ref={dropdownRef} title={disabled ? tooltip : ""}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-zinc-200 text-[10px] sm:text-[11px] font-bold transition-all shadow-sm",
          disabled 
            ? "bg-zinc-100 text-zinc-300 cursor-not-allowed border-zinc-100"
            : selected.length > 0 
              ? "bg-white text-blue-600 border-blue-200 ring-4 ring-blue-500/5 shadow-md" 
              : "bg-white text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300"
        )}
      >
        <span className="truncate uppercase tracking-[0.1em]">
          {disabled ? "Selecione uma Disciplina" : (selected.length > 0 ? selected.join(', ') : label)}
        </span>
        <ChevronDown size={14} className={cn("transition-transform shrink-0", isOpen && "rotate-180", selected.length > 0 ? "text-blue-500" : "text-zinc-400")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 mt-2 w-full min-w-[240px] bg-white border border-zinc-200 rounded-2xl shadow-2xl p-2"
          >
            <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {options.length > 5 && label === 'Ano' && (
                <div className="flex gap-1 mb-2 px-1">
                  <button 
                    onClick={() => onChange(options)}
                    className="flex-1 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[8px] font-black uppercase text-zinc-400 hover:text-blue-500 hover:border-blue-200 transition-all"
                  >
                    Marcar Todos
                  </button>
                  <button 
                    onClick={() => onChange([])}
                    className="flex-1 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[8px] font-black uppercase text-zinc-400 hover:text-red-400 hover:border-red-200 transition-all"
                  >
                    Limpar
                  </button>
                </div>
              )}
              {options.map(opt => {
                const count = getCount(opt);
                // Comparação blindada
                const isSelected = selected.some(s => normalizeString(opt) === normalizeString(s));
                
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      // Lógica real de toggle para arrays
                      const next = isSelected 
                        ? selected.filter(s => normalizeString(s) !== normalizeString(opt))
                        : [...selected, String(opt).trim()];
                      onChange(next);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all truncate flex items-center justify-between group",
                      isSelected ? "bg-blue-50 text-blue-600" : "text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{opt}</span>
                      {showCounts && count !== null && (
                        <span className={cn(
                          "text-[8px] font-medium transition-colors",
                          isSelected ? "text-blue-400" : "text-zinc-400"
                        )}>
                          {count} {count === 1 ? 'questão' : 'questões'}
                        </span>
                      )}
                    </div>
                    {isSelected && <CheckCircle2 size={12} className="text-blue-500 shrink-0" />}
                  </button>
                );
              })}
              {options.length === 0 && (
                <div className="p-4 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sem opções disponíveis</div>
              )}
            </div>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="w-full mt-2 pt-2 border-t border-zinc-100 text-[10px] font-black uppercase text-red-500/80 hover:text-red-500 transition-colors py-2"
              >
                Limpar Seleção
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to normalize subjects
const normalizeSubject = (s: string | null | undefined): string => {
  if (!s) return '';
  const val = s.trim();
  const low = val.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  if (/^questao\s*\d+$/i.test(low) || /^\d+$/.test(low)) return '';

  if (low.includes('portugu') || low.includes('lingua portug')) return 'Português';
  if (low.includes('raciocinio logico') || low === 'rlm') return 'Raciocínio Lógico';
  if (low.includes('informatica')) return 'Informática';
  if (low.includes('matematica')) return 'Matemática';
  if (low.includes('historia')) return 'História';
  if (low.includes('geografia')) return 'Geografia';
  if (low.includes('sociologia')) return 'Sociologia';
  if (low.includes('filosofia')) return 'Filosofia';
  if (low.includes('ingles')) return 'Inglês';
  if (low.includes('espanhol')) return 'Espanhol';
  if (low.includes('fisica')) return 'Física';
  if (low.includes('quimica')) return 'Química';
  if (low.includes('biologia')) return 'Biologia';
  if (low.includes('legislacao militar')) return 'Legislação Militar';
  if (low.includes('direito administrativo')) return 'Direito Administrativo';
  if (low.includes('direito constitucional')) return 'Direito Constitucional';
  if (low.includes('direito penal')) return 'Direito Penal';
  if (low.includes('atualidades') || low.includes('conhecimentos gerais')) return 'Atualidades';
  if (low.includes('redacao')) return 'Redação';

  return val;
};

const normalizeDifficulty = (s: string | null | undefined): string => {
  if (!s) return '';
  const norm = normalizeString(s);
  if (norm === 'facil' || norm === 'easy') return 'Fácil';
  if (norm === 'medio' || norm === 'media' || norm === 'normal' || norm === 'moderate' || norm === 'moderado' || norm === 'moderada') return 'Médio';
  if (norm === 'dificil' || norm === 'hard' || norm === 'dificílimo' || norm === 'muito dificil') return 'Difícil';
  return s.trim();
};

const getVideoStatus = (q: any): string => {
  const url = String(q.video_url || q.videoUrl || '').trim();
  if (url === '' || url === 'null' || url === 'undefined') return 'Não';
  return 'Sim';
};

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeEmbedUrl = (url: string): string => {
  return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
};

export default function Questions() {
  const { user, isAdmin } = useAuth();
  const { 
    recordQuestionAnswer, 
    questionAnswers, 
    totalBankQuestions, 
    refreshTotalQuestions,
    saveFilter,
    notebooks,
    addNotebook,
    addQuestionsToNotebook
  } = useStudy();
  const { recordImprovementAnswer, isActive: isImprovementActive, setIsModalOpen } = useImprovement();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Advanced Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [advFilters, setAdvFilters] = useState<AdvancedFilters>({
    disciplina: [],
    assunto: [],
    ano: [],
    banca: [],
    instituicao: [],
    dificuldade: [],
    videoRes: [],
    exclude: {
      alreadyAnswered: false,
      incorrect: false,
      correct: false,
      lastWeek: false,
      lastMonth: false
    }
  });

  const [activeTopTab, setActiveTopTab] = useState<'filter' | 'notebooks' | 'saved_filters' | 'bulk_videos'>('filter');

  // Notebook solving mode
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);

  // Video editing modal (admin only)
  const [editingVideoQuestionId, setEditingVideoQuestionId] = useState<string | null>(null);
  const [editingVideoUrl, setEditingVideoUrl] = useState('');

  // Gabarito editing (admin only)
  const [editingGabaritoQuestionId, setEditingGabaritoQuestionId] = useState<string | null>(null);
  const [editingGabaritoIndex, setEditingGabaritoIndex] = useState<number>(0);

  // Admin: edit all fields
  const [editingFieldsQuestionId, setEditingFieldsQuestionId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, any>>({});

  // Image editing (admin only)
  const [editingImageQuestionId, setEditingImageQuestionId] = useState<string | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null);
  const [savingImage, setSavingImage] = useState(false);

  // Error reports
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [showReportsPanel, setShowReportsPanel] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Local state for answers (this session)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [tempAnswers, setTempAnswers] = useState<Record<string, number>>({});
  const [cutOptions, setCutOptions] = useState<Record<string, number[]>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'gabarito' | 'comentarios' | 'estatisticas' | 'video'>>({});

  // Admin edit question state
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ text: '', options: [] as string[], correct_option_index: 0, explanation: '', video_url: '', subject: '', topic: '', org: '', year: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteQuestion = async (id: string | number) => {
    if (!isAdmin) {
      alert('Acesso negado: Você não tem permissão de administrador.');
      return;
    }

    const confirmResult = window.confirm('Deseja excluir permanentemente esta questão do banco de dados?');
    if (!confirmResult) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao excluir: ' + error.message);
        return;
      }
      
      setQuestions(prev => prev.filter(q => String(q.id) !== String(id)));
      refreshTotalQuestions();
      console.log('Questão excluída com sucesso:', id);
    } catch (err: any) {
      alert('Falha na conexão: ' + (err.message || 'Erro desconhecido'));
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      const years = [...new Set(questions.map(q => q.year).filter(y => y != null))].sort();
      const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))];
      const videos = questions.filter(q => {
        const url = String(q.video_url || q.videoUrl || '').trim();
        return url !== '' && url !== 'null' && url !== 'undefined';
      });
      const q0 = questions[0];
      console.log('%c[DIAGNÓSTICO FILTROS]', 'color: #3B82F6; font-weight: bold; font-size: 14px;');
      console.log('Total de questões:', questions.length);
      console.log('Anos no banco:', years);
      console.log('Tipo do year:', typeof q0?.year, '| Valor:', JSON.stringify(q0?.year));
      console.log('Dificuldades no banco:', difficulties);
      console.log('Tipo do difficulty:', typeof q0?.difficulty, '| Valor:', JSON.stringify(q0?.difficulty));
      console.log('Questões com vídeo:', videos.length);
    }
  }, [questions]);

  const toggleFilter = useCallback((key: keyof AdvancedFilters, value: string) => {
    setAdvFilters(prev => {
      const list = prev[key];
      if (Array.isArray(list)) {
        const compare = (a: string, b: string) => {
          if (key === 'ano') return Number(a) === Number(b);
          if (key === 'dificuldade') return normalizeDifficulty(a) === normalizeDifficulty(b);
          return normalizeString(a) === normalizeString(b);
        };
        const isAlreadySelected = list.some(item => compare(item, value));
        const nextList = isAlreadySelected
          ? list.filter(item => !compare(item, value))
          : [...list, value.trim()];
        
        let nextAssunto = prev.assunto;
        if (key === 'disciplina' && nextList.length === 0) {
          nextAssunto = [];
        }
        
        return {
          ...prev,
          [key]: nextList,
          assunto: nextAssunto
        };
      }
      return prev;
    });
    setCurrentPage(1);
  }, []);

  const filteredQuestions = useMemo(() => {
    const hasAnyFilter = advFilters.ano.length > 0 || advFilters.dificuldade.length > 0 ||
      advFilters.disciplina.length > 0 || advFilters.banca.length > 0 ||
      advFilters.instituicao.length > 0 || (advFilters.videoRes && advFilters.videoRes.length > 0);

    if (hasAnyFilter) {
      console.log('%c[FILTRO EXECUTANDO]', 'color: #F59E0B; font-weight: bold; font-size: 14px;');
      console.log('Estado dos filtros:', JSON.stringify({
        ano: advFilters.ano,
        dificuldade: advFilters.dificuldade,
        disciplina: advFilters.disciplina,
        banca: advFilters.banca,
        videoRes: advFilters.videoRes,
      }, null, 2));
    }

    let debugCount = 0;
    const result = questions.filter(q => {
      const matchSearch = !searchTerm ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDisciplina = advFilters.disciplina.length === 0 ||
        advFilters.disciplina.some(d => normalizeString(normalizeSubject(d)) === normalizeString(normalizeSubject(q.subject)));

      const matchAssunto = advFilters.assunto.length === 0 ||
        advFilters.assunto.some(a => normalizeString(a) === normalizeString(q.topic));

      const qYearNum = q.year != null ? Number(q.year) : NaN;
      const matchAno = advFilters.ano.length === 0 ||
        advFilters.ano.some(a => Number(a) === qYearNum);

      const matchBanca = advFilters.banca.length === 0 ||
        advFilters.banca.some(b => normalizeString(b) === normalizeString(q.institution));

      const matchInstituicao = advFilters.instituicao.length === 0 ||
        advFilters.instituicao.some(i => {
          const org = q.org || '';
          const normalizedOrg = org.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : org;
          return normalizeString(i) === normalizeString(normalizedOrg);
        });

      const qDiffNorm = normalizeDifficulty(q.difficulty);
      const matchDificuldade = advFilters.dificuldade.length === 0 ||
        advFilters.dificuldade.some(d => normalizeDifficulty(d) === qDiffNorm);

      const qVideoStatus = getVideoStatus(q);
      const matchVideo = !advFilters.videoRes || advFilters.videoRes.length === 0 ||
        advFilters.videoRes.some(v => normalizeString(v) === normalizeString(qVideoStatus));

      const userAnswers = questionAnswers.filter(a => a.questionId === q.id);
      const hasAnswered = userAnswers.length > 0;
      const wasCorrect = userAnswers.some(a => a.isCorrect);
      const wasIncorrect = hasAnswered && !wasCorrect;

      const lastAnswer = userAnswers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const answeredRecently = (days: number) => {
        if (!lastAnswer) return false;
        const diff = Date.now() - new Date(lastAnswer.timestamp).getTime();
        return diff < days * 24 * 60 * 60 * 1000;
      };

      if (advFilters.exclude.alreadyAnswered && hasAnswered) return false;
      if (advFilters.exclude.incorrect && wasIncorrect) return false;
      if (advFilters.exclude.correct && wasCorrect) return false;
      if (advFilters.exclude.lastWeek && answeredRecently(7)) return false;
      if (advFilters.exclude.lastMonth && answeredRecently(30)) return false;

      const passes = matchSearch && matchDisciplina && matchAssunto && matchAno && matchBanca && matchInstituicao && matchDificuldade && matchVideo;

      if (hasAnyFilter && !passes && debugCount < 3) {
        debugCount++;
        console.log(`%c[QUESTÃO REJEITADA #${debugCount}]`, 'color: #EF4444; font-weight: bold;', {
          id: q.id,
          yearRaw: q.year,
          yearType: typeof q.year,
          yearAsNumber: qYearNum,
          difficulty: q.difficulty,
          difficultyNormalized: qDiffNorm,
          subject: q.subject,
          matchSearch, matchDisciplina, matchAssunto, matchAno, matchBanca, matchInstituicao, matchDificuldade, matchVideo,
          filterAno: advFilters.ano,
          filterDificuldade: advFilters.dificuldade,
        });
      }

      return passes;
    });

    if (hasAnyFilter) {
      console.log(`%c[RESULTADO] ${result.length} questões passaram no filtro de ${questions.length} total`,
        result.length > 0 ? 'color: #10B981; font-weight: bold; font-size: 14px;' : 'color: #EF4444; font-weight: bold; font-size: 14px;');
    }

    return result.sort((a, b) => {
      const numA = parseInt(String(a.topic || '').replace(/\D/g, ''));
      const numB = parseInt(String(b.topic || '').replace(/\D/g, ''));
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
      return 0;
    });
  }, [questions, advFilters, searchTerm, questionAnswers]);

  const filtersActive = useMemo(() => {
    return searchTerm !== '' || 
      advFilters.disciplina.length > 0 ||
      advFilters.assunto.length > 0 ||
      advFilters.ano.length > 0 ||
      advFilters.banca.length > 0 ||
      advFilters.instituicao.length > 0 ||
      advFilters.dificuldade.length > 0 ||
      (advFilters.videoRes && advFilters.videoRes.length > 0) ||
      advFilters.exclude.alreadyAnswered ||
      advFilters.exclude.incorrect ||
      advFilters.exclude.correct ||
      advFilters.exclude.lastWeek ||
      advFilters.exclude.lastMonth;
  }, [searchTerm, advFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, advFilters]);

  const sessionStats = useMemo(() => {
    if (!filtersActive) return null;
    
    const uniqueAnswersMap = new Map<string, boolean>();
    questionAnswers.forEach(a => {
      if (filteredQuestions.some(q => q.id === a.questionId)) {
        const existing = uniqueAnswersMap.get(a.questionId);
        uniqueAnswersMap.set(a.questionId, existing || a.isCorrect);
      }
    });

    const total = uniqueAnswersMap.size;
    const correct = Array.from(uniqueAnswersMap.values()).filter(v => v).length;
    
    return {
      total,
      correct,
      incorrect: total - correct
    };
  }, [filtersActive, questionAnswers, filteredQuestions]);

  const paginatedQuestions = useMemo(() => {
    if (!filtersActive) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage, filtersActive]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredQuestions.length / itemsPerPage);
  }, [filteredQuestions]);

  const uniqueValues = useMemo(() => {
    const getUniqueCaseInsensitive = (arr: (string | null | undefined)[]) => {
      const map = new Map<string, string>();
      arr.filter(Boolean).forEach(val => {
        const key = normalizeString(val);
        if (map.has(key)) {
          const current = map.get(key)!;
          const currentUpperCount = (current.match(/[A-Z]/g) || []).length;
          const newUpperCount = (val!.match(/[A-Z]/g) || []).length;
          if (newUpperCount > currentUpperCount) {
            map.set(key, val!.trim());
          }
        } else {
          map.set(key, val!.trim());
        }
      });
      return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    };

    const disciplina = getUniqueCaseInsensitive(
      questions.map(q => normalizeSubject(q.subject)).filter(Boolean)
    );

    const ano = getUniqueCaseInsensitive(
      questions.map(q => q.year != null ? String(q.year) : null)
    ).sort((a, b) => Number(b) - Number(a));
    
    const banca = getUniqueCaseInsensitive(questions.map(q => q.institution)).map(s => s.trim());

    const instituicao = getUniqueCaseInsensitive([
      'APMBB', 'PMSP',
      ...questions.map(q => {
        const org = q.org;
        if (org && org.toLowerCase().includes('polícia militar do estado de são paulo')) return 'PMSP';
        return org;
      })
    ]);
    
    const dificuldade = ['Fácil', 'Médio', 'Difícil'];
    const videoRes = ['Sim', 'Não'];
    
    const relevantForAssunto = advFilters.disciplina.length === 0 
      ? questions 
      : questions.filter(q => advFilters.disciplina.some(d => normalizeString(normalizeSubject(d)) === normalizeString(normalizeSubject(q.subject))));
    
    const assunto = getUniqueCaseInsensitive(
      relevantForAssunto.map(q => q.topic).filter(t => {
        if (!t) return false;
        const norm = t.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        return !/^questao\s*\d+$/i.test(norm) && !/^\d+$/.test(norm);
      })
    );

    return { disciplina, assunto, ano, banca, instituicao, dificuldade, videoRes };
  }, [questions, advFilters.disciplina]);

  const handleAnswer = async (question: any, optionIndex: number) => {
    if (answers[question.id] !== undefined) return;
    setTempAnswers(prev => ({ ...prev, [question.id]: optionIndex }));
  };

  const confirmAnswer = async (question: any) => {
    const selectedIdx = tempAnswers[question.id];
    if (selectedIdx === undefined || answers[question.id] !== undefined) return;

    setAnswers(prev => ({ ...prev, [question.id]: selectedIdx }));
    setShowFeedback(prev => ({ ...prev, [question.id]: true }));

    const isCorrect = selectedIdx === question.correct_option_index;
    await recordQuestionAnswer(question.id, isCorrect, question.subject, question.topic, selectedIdx);
    
    if (isImprovementActive) {
      recordImprovementAnswer(isCorrect, 0); 
    }
    
    setTempAnswers(prev => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  };

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setEditForm({
      text: q.text || '',
      options: [...(q.options || [])],
      correct_option_index: q.correct_option_index || 0,
      explanation: q.explanation || '',
      video_url: q.video_url || '',
      subject: q.subject || '',
      topic: q.topic || '',
      org: q.org || '',
      year: q.year || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          text: editForm.text,
          options: editForm.options,
          correct_option_index: editForm.correct_option_index,
          explanation: editForm.explanation,
          video_url: editForm.video_url || null,
          subject: editForm.subject,
          topic: editForm.topic,
          org: editForm.org,
          year: editForm.year,
        })
        .eq('id', editingQuestion.id);
      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...q, ...editForm } : q));
      setEditingQuestion(null);
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleCut = (qId: string, optIdx: number) => {
    if (answers[qId] !== undefined) return;

    setCutOptions(prev => {
      const current = prev[qId] || [];
      if (current.includes(optIdx)) {
        return { ...prev, [qId]: current.filter(i => i !== optIdx) };
      } else {
        const q = questions.find(qq => qq.id === qId);
        const maxCuts = (q?.options?.length || 5) - 1;
        if (current.length >= maxCuts) return prev;
        if (tempAnswers[qId] === optIdx) {
          setTempAnswers(prevTemp => {
            const next = { ...prevTemp };
            delete next[qId];
            return next;
          });
        }
        return { ...prev, [qId]: [...current, optIdx] };
      }
    });
  };


  // Notebook solving mode: get questions for the active notebook
  const activeNotebook = activeNotebookId ? notebooks.find(n => n.id === activeNotebookId) : null;
  const notebookQuestions = useMemo(() => {
    if (!activeNotebook || !activeNotebook.questionIds) return [];
    return questions.filter(q => activeNotebook.questionIds!.includes(q.id));
  }, [activeNotebook, questions]);

  const notebookPaginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return notebookQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [notebookQuestions, currentPage]);

  const notebookTotalPages = Math.ceil(notebookQuestions.length / itemsPerPage);

  // Admin: save video URL to Supabase
  const handleSaveVideoUrl = async (questionId: string, videoUrl: string) => {
    const trimmedUrl = videoUrl.trim();
    try {
      const { error } = await supabase
        .from('questions')
        .update({ video_url: trimmedUrl })
        .eq('id', questionId);
      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, video_url: trimmedUrl } : q));
      setEditingVideoQuestionId(null);
      setEditingVideoUrl('');
    } catch (err: any) {
      alert('Erro ao salvar vídeo: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleSaveGabarito = async (questionId: string, newIndex: number) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ correct_option_index: newIndex })
        .eq('id', questionId);
      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, correct_option_index: newIndex } : q));
      setEditingGabaritoQuestionId(null);
    } catch (err: any) {
      alert('Erro ao salvar gabarito: ' + (err.message || 'Erro desconhecido'));
    }
  };

  // Admin: save all fields
  const handleSaveFields = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update(editingFields)
        .eq('id', questionId);
      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...editingFields } : q));
      setEditingFieldsQuestionId(null);
      setEditingFields({});
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleSaveImage = async (questionId: string) => {
    setSavingImage(true);
    try {
      const { error } = await supabase
        .from('questions')
        .update({ image_url: editingImagePreview || null })
        .eq('id', questionId);
      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, image_url: editingImagePreview || null } : q));
      setEditingImageQuestionId(null);
      setEditingImagePreview(null);
    } catch (err: any) {
      alert('Erro ao salvar imagem: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSavingImage(false);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setEditingImagePreview(canvas.toDataURL('image/webp', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Error reports
  const fetchReports = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('question_reports')
        .select('*')
        .order('created_at', { ascending: false });
      setReports(data || []);
    } catch (err: any) {
      if (!err.message?.includes('does not exist') && err.code !== '42P01') {
        console.error('Error fetching reports:', err);
      }
    }
  }, []);

  const handleSubmitReport = async (questionId: string) => {
    if (!reportType) { alert('Selecione o tipo de erro.'); return; }
    setReportSending(true);
    try {
      const q = questions.find(qq => qq.id === questionId);
      const { error } = await supabase.from('question_reports').insert({
        question_id: questionId,
        question_text: q?.text?.substring(0, 200) || '',
        question_subject: q?.subject || '',
        question_topic: q?.topic || '',
        report_type: reportType,
        description: reportDescription,
        reported_by: user?.email || user?.name || 'Anônimo',
        user_id: user?.id || '',
        status: 'pending',
      });
      if (error) throw error;
      alert('Erro reportado com sucesso! A equipe irá analisar.');
      setReportingQuestionId(null);
      setReportType('');
      setReportDescription('');
      if (isAdmin) fetchReports();
    } catch (err: any) {
      alert('Erro ao enviar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setReportSending(false);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await supabase.from('question_reports').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved', resolved_at: new Date().toISOString() } : r));
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await supabase.from('question_reports').delete().eq('id', reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchReports();
  }, [isAdmin, fetchReports]);

  // Helper to load saved filter
  const loadSavedFilter = (filters: any) => {
    const { searchTerm: savedSearch, ...rest } = filters;
    setSearchTerm(savedSearch || '');
    setAdvFilters({
      disciplina: rest.disciplina || [],
      assunto: rest.assunto || [],
      ano: rest.ano || [],
      banca: rest.banca || [],
      instituicao: rest.instituicao || [],
      dificuldade: rest.dificuldade || [],
      videoRes: rest.videoRes || [],
      exclude: rest.exclude || { alreadyAnswered: false, incorrect: false, correct: false, lastWeek: false, lastMonth: false }
    });
    setActiveTopTab('filter');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col mb-1 select-none">
        <h2 className="text-4xl font-black text-white flex items-center gap-2 italic uppercase tracking-tighter">
          <div className="relative w-14 h-14 flex-shrink-0 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Image 
              src="https://nbmvpsigfqmuipcfanug.supabase.co/storage/v1/object/public/Imagens-Questoes/caveiralogo.png" 
              alt="Caveira Logo" 
              fill
              priority
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          Banco de Questões
        </h2>
        {isAdmin && (
          <button
            onClick={() => { setShowReportsPanel(true); fetchReports(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-[0_0_15px_rgba(255,0,50,0.15)] hover:shadow-[0_0_25px_rgba(255,0,50,0.3)]"
          >
            <AlertOctagon size={16} className="animate-pulse" />
            Reporte de Erros
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-black">{reports.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
        )}
      </div>

      <div className="flex items-end gap-1 border-b border-white/5 overflow-x-auto no-scrollbar mb-10">
        <button
          onClick={() => setActiveTopTab('filter')}
          className={cn(
            "px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0",
            activeTopTab === 'filter' 
              ? "text-white bg-white/[0.03] rounded-t-3xl border-t border-x border-white/10" 
              : "text-white/20 hover:text-white/40"
          )}
        >
          Filtro de questões
          {activeTopTab === 'filter' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-6 right-6 h-1 bg-[#3B82F6] rounded-t-full shadow-[0_0_15px_#3B82F6]" />}
        </button>
        <button
          onClick={() => setActiveTopTab('notebooks')}
          className={cn(
            "px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0",
            activeTopTab === 'notebooks' 
              ? "text-white bg-white/[0.03] rounded-t-3xl border-t border-x border-white/10" 
              : "text-white/20 hover:text-white/40"
          )}
        >
          Cadernos
          {activeTopTab === 'notebooks' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-6 right-6 h-1 bg-[#3B82F6] rounded-t-full shadow-[0_0_15px_#3B82F6]" />}
        </button>
        <button
          onClick={() => setActiveTopTab('saved_filters')}
          className={cn(
            "px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0",
            activeTopTab === 'saved_filters' 
              ? "text-white bg-white/[0.03] rounded-t-3xl border-t border-x border-white/10" 
              : "text-white/20 hover:text-white/40"
          )}
        >
          Filtros salvos
          {activeTopTab === 'saved_filters' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-6 right-6 h-1 bg-[#3B82F6] rounded-t-full shadow-[0_0_15px_#3B82F6]" />}
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTopTab('bulk_videos')}
            className={cn(
              "px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0",
              activeTopTab === 'bulk_videos'
                ? "text-white bg-white/[0.03] rounded-t-3xl border-t border-x border-white/10"
                : "text-white/20 hover:text-white/40"
            )}
          >
            Vídeos em Massa
            {activeTopTab === 'bulk_videos' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-6 right-6 h-1 bg-[#3B82F6] rounded-t-full shadow-[0_0_15px_#3B82F6]" />}
          </button>
        )}
      </div>

      {activeTopTab === 'filter' && (
        <div className="space-y-8">

          <div className="space-y-8 bg-[#0A0A0A] border border-white/5 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  Parâmetros de Busca
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {questions.length > 0 && (
                    <>
                      <button 
                        onClick={() => {
                          const name = prompt('Nome do Filtro:');
                          if (name) {
                            saveFilter(name, { searchTerm, ...advFilters });
                            alert('Filtro salvo com sucesso!');
                          }
                        }}
                        className="flex items-center gap-2.5 px-6 py-2.5 bg-[#1F2937]/50 text-blue-400 rounded-xl text-[9px] font-black hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 uppercase tracking-[0.2em] shrink-0 active:scale-95"
                      >
                        SALVAR FILTRO
                        <Star size={12} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => {
                          const nbName = prompt('Nome do Novo Caderno ou selecione um existente:');
                          if (!nbName) return;

                          const qIds = filteredQuestions.map(q => q.id);
                          const existing = notebooks.find(n => n.title.toLowerCase() === nbName.toLowerCase());

                          if (existing) {
                            addQuestionsToNotebook(existing.id, qIds);
                            alert(`Questões adicionadas ao item "${existing.title}"`);
                          } else {
                            addNotebook({ 
                              title: nbName, 
                              type: 'notebook', 
                              questionIds: qIds, 
                              count: qIds.length,
                              parentId: null 
                            });
                            alert(`Novo caderno "${nbName}" criado.`);
                          }
                        }}
                        className="flex items-center gap-2.5 px-6 py-2.5 bg-[#1F2937]/50 text-blue-400 rounded-xl text-[9px] font-black hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 uppercase tracking-[0.2em] shrink-0 active:scale-95"
                      >
                        SALVAR CADERNO
                        <BookMarked size={12} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2.5 px-6 py-2.5 bg-red-600/10 text-red-500 rounded-xl text-[9px] font-black hover:bg-red-600 hover:text-white transition-all border border-red-500/30 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.1)] shrink-0 active:scale-95"
                      >
                        APRIMORAMENTO
                        <Trophy size={12} strokeWidth={3} />
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAdmin(true)}
                      className="flex items-center gap-2.5 px-6 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] font-black hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/30 uppercase tracking-[0.2em] shrink-0 active:scale-95"
                    >
                      GERENCIAR
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>

              {questions.length > 0 ? (
                <>
                  <div className="space-y-4 relative z-30">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-4">
                      {/* Row 1 */}
                      <div className="md:col-span-3 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                          type="text"
                          placeholder="Palavra-chave"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-[11px] font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all outline-none placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FilterDropdown 
                          label="Disciplina" 
                          options={uniqueValues.disciplina} 
                          selected={advFilters.disciplina} 
                          onChange={(val) => {
                            setAdvFilters(prev => ({ 
                              ...prev, 
                              disciplina: val,
                              assunto: val.length === 0 ? [] : prev.assunto
                            }));
                          }} 
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FilterDropdown 
                          label="Selecione uma Disciplina" 
                          options={uniqueValues.assunto} 
                          selected={advFilters.assunto} 
                          onChange={(val) => setAdvFilters(prev => ({ ...prev, assunto: val }))} 
                          disabled={advFilters.disciplina.length === 0}
                          tooltip="Selecione primeiro a Disciplina para liberar os assuntos."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Row 2 */}
                      <FilterDropdown 
                        label="Banca" 
                        options={uniqueValues.banca} 
                        selected={advFilters.banca} 
                        onChange={(val) => setAdvFilters(prev => ({ ...prev, banca: val }))} 
                      />
                      <FilterDropdown 
                        label="Órgão" 
                        selected={advFilters.instituicao} 
                        onChange={(val) => setAdvFilters(prev => ({ ...prev, instituicao: val }))} 
                        options={uniqueValues.instituicao}
                      />
                      <FilterDropdown
                        label="Dificuldade"
                        options={uniqueValues.dificuldade}
                        selected={advFilters.dificuldade}
                        onChange={(val) => { setAdvFilters(prev => ({ ...prev, dificuldade: val })); setCurrentPage(1); }}
                      />
                      <FilterDropdown
                        label="Ano"
                        options={uniqueValues.ano}
                        selected={advFilters.ano}
                        onChange={(val) => { setAdvFilters(prev => ({ ...prev, ano: val })); setCurrentPage(1); }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Row 3 */}
                      <FilterDropdown
                        label="Resolução Por Vídeo"
                        options={uniqueValues.videoRes}
                        selected={advFilters.videoRes || []}
                        onChange={(val) => { setAdvFilters(prev => ({ ...prev, videoRes: val })); setCurrentPage(1); }}
                      />
                    </div>
                  </div>

                  {/* Exclude Checkboxes */}
                  <div className="pt-10 border-t border-white/5 relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2.5">
                      <Filter size={14} className="text-white/20" />
                      Excluir da busca
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">
                      <Checkbox 
                        label="Questões que já respondi" 
                        checked={advFilters.exclude.alreadyAnswered} 
                        onChange={(v) => setAdvFilters(prev => ({ ...prev, exclude: { ...prev.exclude, alreadyAnswered: v } }))} 
                      />
                      <Checkbox 
                        label="Questões que errei ou não sabia" 
                        checked={advFilters.exclude.incorrect} 
                        onChange={(v) => setAdvFilters(prev => ({ ...prev, exclude: { ...prev.exclude, incorrect: v } }))} 
                      />
                      <Checkbox 
                        label="Questões que acertei" 
                        checked={advFilters.exclude.correct} 
                        onChange={(v) => setAdvFilters(prev => ({ ...prev, exclude: { ...prev.exclude, correct: v } }))} 
                      />
                      <Checkbox 
                        label="Questões que fiz há menos de 1 semana" 
                        checked={advFilters.exclude.lastWeek} 
                        onChange={(v) => setAdvFilters(prev => ({ ...prev, exclude: { ...prev.exclude, lastWeek: v } }))} 
                      />
                      <Checkbox 
                        label="Questões que fiz há menos de 1 mês" 
                        checked={advFilters.exclude.lastMonth} 
                        onChange={(v) => setAdvFilters(prev => ({ ...prev, exclude: { ...prev.exclude, lastMonth: v } }))} 
                      />
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {filtersActive && (
                    <div className="pt-6 flex justify-end">
                      <button 
                        onClick={() => {
                          setAdvFilters({
                            disciplina: [], 
                            assunto: [], 
                            ano: [], 
                            banca: [], 
                            instituicao: [], 
                            dificuldade: [], 
                            videoRes: [],
                            exclude: { 
                              alreadyAnswered: false, 
                              incorrect: false, 
                              correct: false, 
                              lastWeek: false, 
                              lastMonth: false 
                            }
                          });
                          setSearchTerm('');
                          setCurrentPage(1);
                        }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
                      >
                        <RotateCcw size={12} />
                        Limpar Filtros
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <HelpCircle size={32} className="text-white/20" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Banco de Questões Vazio</h4>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">
                      Atualmente não existem questões cadastradas no sistema.
                      {isAdmin && " Como administrador, você pode importar novas questões utilizando nossa IA."}
                    </p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAdmin(true)}
                      className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] uppercase tracking-[0.2em]"
                    >
                      <Sparkles size={18} />
                      ADICIONAR QUESTÕES COM IA
                    </button>
                  )}
                </div>
              )}
            </div>

          {/* Questions List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-[#0055FF]" size={32} />
              <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Carregando questões...</p>
            </div>
          ) : !filtersActive ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Search size={32} className="text-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Pronto para começar?</h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto">Utilize os filtros acima para pesquisar as questões que deseja resolver hoje.</p>
              </div>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="space-y-6 pb-20">
              {filtersActive && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0A0A0A] border border-[#3B82F6]/30 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] ring-1 ring-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-[0_0_15px_#3B82F6] animate-pulse" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                        {filteredQuestions.length} QUESTÕES
                      </span>
                      <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em]">Encontradas no filtro</span>
                    </div>
                  </div>
                  
                  {sessionStats && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-2 min-w-[100px]">
                        <span className="text-lg font-black text-white leading-none">{sessionStats.total}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Resolvidas</span>
                      </div>
                      <div className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-2 min-w-[100px]">
                        <span className="text-lg font-black text-emerald-400 leading-none">{sessionStats.correct}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60 mt-1">Acertos</span>
                      </div>
                      <div className="flex flex-col items-center bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-2 min-w-[100px]">
                        <span className="text-lg font-black text-red-500 leading-none">{sessionStats.incorrect}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500/60 mt-1">Erros</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {paginatedQuestions.map((q, pIdx) => {
                const idx = (currentPage - 1) * itemsPerPage + pIdx;
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 hover:border-[#3B82F6]/20 transition-colors relative group/card"
                  >
                    {/* Progress Indicator */}
                    <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
                      <span className="text-[11px] font-black text-white bg-[#3B82F6] px-4 py-2 rounded-xl border border-[#3B82F6]/30 uppercase tracking-widest shadow-[0_0_15px_-3px_#3B82F6] backdrop-blur-md transition-transform group-hover/card:scale-110">
                        QUESTÃO {idx + 1} DE {filteredQuestions.length}
                      </span>
                    </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
                      {/* Materia */}
                      <button
                        onClick={() => toggleFilter('disciplina', q.subject)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
                          advFilters.disciplina.some(d => normalizeString(d) === normalizeString(q.subject))
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:bg-[#3B82F6]/20"
                        )}
                      >
                        <span className="opacity-50">Matéria:</span> {q.subject}
                      </button>
                      
                      {/* Assunto */}
                      {q.topic && (
                        <button
                          onClick={() => {
                            // If discipline is not active, activate it first so topic shows up correctly
                            const isDisciplineActive = advFilters.disciplina.some(d => normalizeString(d) === normalizeString(q.subject));
                            if (!isDisciplineActive) {
                              setAdvFilters(prev => ({
                                ...prev,
                                disciplina: [...prev.disciplina, q.subject],
                                assunto: [...prev.assunto, q.topic]
                              }));
                              setCurrentPage(1);
                            } else {
                              toggleFilter('assunto', q.topic);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
                            advFilters.assunto.some(a => normalizeString(a) === normalizeString(q.topic))
                              ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                              : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:bg-[#3B82F6]/20"
                          )}
                        >
                          <span className="opacity-50">Assunto:</span> {q.topic}
                        </button>
                      )}

                      {q.is_outdated && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-500 rounded-xl border border-red-500/30 text-[10px] font-black uppercase tracking-widest animate-pulse shadow-sm shadow-red-500/10">
                          <AlertTriangle size={12} /> Atenção: Questão Desatualizada
                        </div>
                      )}

                      {/* Ano */}
                      {q.year != null && (
                      <button
                        onClick={() => toggleFilter('ano', String(q.year))}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap",
                          advFilters.ano.some(y => Number(y) === Number(q.year))
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-white/[0.05] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <Calendar size={11} className={advFilters.ano.some(y => Number(y) === Number(q.year)) ? "text-white" : "text-[#3B82F6]/50"} />
                        <span className="opacity-40">Ano:</span> {q.year}
                      </button>
                      )}

                      {/* Banca */}
                      <button
                        onClick={() => toggleFilter('banca', q.institution)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap",
                          advFilters.banca.some(b => normalizeString(b) === normalizeString(q.institution))
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-white/[0.05] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <Building2 size={11} className={advFilters.banca.some(b => normalizeString(b) === normalizeString(q.institution)) ? "text-white" : "text-[#3B82F6]/50"} /> 
                        <span className="opacity-40">Banca:</span> {q.institution}
                      </button>

                      {/* Órgão */}
                      {q.org && (
                        <button
                          onClick={() => {
                            const org = q.org || '';
                            const normalizedOrg = org.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : org;
                            toggleFilter('instituicao', normalizedOrg);
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap",
                            advFilters.instituicao.some(i => normalizeString(i) === normalizeString(q.org?.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : q.org))
                              ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                              : "bg-white/[0.05] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                          )}
                        >
                          <Trophy size={11} className={advFilters.instituicao.some(i => normalizeString(i) === normalizeString(q.org?.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : q.org)) ? "text-white" : "text-[#3B82F6]/50"} /> 
                          <span className="opacity-40">Órgão:</span> {q.org?.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : q.org}
                        </button>
                      )}

                      {/* Dificuldade */}
                      {q.difficulty && normalizeDifficulty(q.difficulty) && (
                      <button
                        onClick={() => toggleFilter('dificuldade', normalizeDifficulty(q.difficulty))}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap",
                          advFilters.dificuldade.some(d => normalizeDifficulty(d) === normalizeDifficulty(q.difficulty))
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-white/[0.05] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <BrainCircuit size={11} className={advFilters.dificuldade.some(d => normalizeDifficulty(d) === normalizeDifficulty(q.difficulty)) ? "text-white" : "text-[#3B82F6]/50"} />
                        <span className="opacity-40">Dificuldade:</span> {normalizeDifficulty(q.difficulty)}
                      </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-auto pt-2 sm:pt-0">
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditQuestion(q); }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white border border-[#3B82F6]/20 rounded-xl transition-all font-black uppercase tracking-widest text-[10px]"
                            title="Editar questão"
                          >
                            <Pencil size={14} /> Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteQuestion(q.id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10"
                            title="Excluir Questão permanentemente"
                          >
                            <Trash2 size={14} /> Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-lg leading-relaxed text-white font-medium tracking-tight markdown-body">
                    {q.image_url && (
                      <div className="mb-6 relative w-full overflow-hidden rounded-2xl border border-white/10">
                        {q.image_url.startsWith('data:') ? (
                          <img
                            src={q.image_url}
                            alt="Imagem da questão"
                            className="w-full max-h-[400px] object-contain"
                          />
                        ) : (
                          <div className="relative w-full h-[400px]">
                            <Image
                              src={q.image_url}
                              alt="Imagem da questão"
                              fill
                              priority={idx < 5}
                              loading={idx < 5 ? "eager" : "lazy"}
                              className="object-contain"
                              referrerPolicy="no-referrer"
                              sizes="(max-width: 768px) 100vw, 800px"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <Markdown>{q.text}</Markdown>
                  </div>

                  <div className="space-y-4">
                    {q.options.map((option: string, optIdx: number) => {
                      const isSelected = answers[q.id] === optIdx;
                      const isTempSelected = tempAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correct_option_index;
                      const hasAnswered = answers[q.id] !== undefined;
                      const isCut = (cutOptions[q.id] || []).includes(optIdx);

                      return (
                        <div key={optIdx} className="flex items-center gap-3 group/option">
                          {/* Cut Toggle Button */}
                          {!hasAnswered && (
                            <button
                              onClick={() => toggleCut(q.id, optIdx)}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                                isCut 
                                  ? "bg-[#0055FF]/10 border-[#0055FF]/20 text-[#0055FF] hover:bg-[#0055FF]/20" 
                                  : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/90 hover:border-white/30"
                              )}
                              title={isCut ? "Restaurar opção" : "Cortar opção"}
                            >
                              {isCut ? <RotateCcw size={14} /> : <Scissors size={14} />}
                            </button>
                          )}

                          <button
                            disabled={hasAnswered || isCut}
                            onClick={() => handleAnswer(q, optIdx)}
                            className={cn(
                              "flex-1 text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                              isCut ? "opacity-40 grayscale" : "opacity-100",
                              isSelected 
                                ? isCorrect 
                                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10" 
                                  : "bg-red-500/10 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10"
                                : isTempSelected
                                  ? "bg-[#3B82F6]/10 border-[#3B82F6]/50 text-[#3B82F6] ring-2 ring-[#3B82F6]/30"
                                  : hasAnswered && isCorrect
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400/80"
                                    : "bg-white/[0.02] border-white/10 text-white/90 hover:bg-white/5 hover:border-[#3B82F6]/50 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all",
                                isSelected 
                                  ? isCorrect ? "bg-emerald-500 border-white/20 text-white" : "bg-red-500 border-white/20 text-white"
                                  : isTempSelected
                                    ? "bg-[#3B82F6] border-white/20 text-white"
                                    : hasAnswered && isCorrect
                                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                      : "bg-black/40 border-white/20 text-white/95 group-hover:border-[#3B82F6]/50 group-hover:text-[#3B82F6]"
                              )}>
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span className={cn(
                                "flex-1",
                                isCut && "line-through text-white/30 italic"
                              )}>
                                {option}
                              </span>
                            </div>
                            {hasAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                            {isSelected && !isCorrect && <XCircle size={18} className="text-red-400 shrink-0" />}
                            {isTempSelected && !hasAnswered && (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-[#3B82F6] p-1 rounded-full text-white"
                              >
                                <CheckCircle2 size={12} />
                              </motion.div>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {/* Confirm Button "Responder" */}
                    {!answers[q.id] && tempAnswers[q.id] !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-4"
                      >
                        <button
                          onClick={() => confirmAnswer(q)}
                          className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                          Responder
                        </button>
                      </motion.div>
                    )}

                  </div>

                  <div className="flex items-center gap-1 border-t border-white/5 pt-4 flex-wrap">
                    <button
                      onClick={() => setActiveTab(prev => ({ ...prev, [q.id]: prev[q.id] === 'gabarito' ? undefined : 'gabarito' }))}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab[q.id] === 'gabarito'
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "text-white/70 hover:text-white/100 hover:bg-white/5"
                      )}
                    >
                      <BookOpen size={14} />
                      Gabarito
                    </button>
                    {getVideoStatus(q) === 'Sim' && (
                      <button
                        onClick={() => setActiveTab(prev => ({ ...prev, [q.id]: prev[q.id] === 'video' ? undefined : 'video' }))}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          activeTab[q.id] === 'video'
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-white/70 hover:text-white/100 hover:bg-white/5"
                        )}
                      >
                        <Play size={14} />
                        Resolução em Vídeo
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab(prev => ({ ...prev, [q.id]: prev[q.id] === 'comentarios' ? undefined : 'comentarios' }))}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab[q.id] === 'comentarios'
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "text-white/70 hover:text-white/100 hover:bg-white/5"
                      )}
                    >
                      <MessageSquare size={14} />
                      Comentários
                    </button>
                    <button
                      onClick={() => setActiveTab(prev => ({ ...prev, [q.id]: prev[q.id] === 'estatisticas' ? undefined : 'estatisticas' }))}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab[q.id] === 'estatisticas'
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "text-white/70 hover:text-white/100 hover:bg-white/5"
                      )}
                    >
                      <BarChart3 size={14} />
                      Estatísticas
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setEditingVideoQuestionId(q.id);
                            setEditingVideoUrl(q.video_url || '');
                          }}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-amber-400 hover:bg-amber-500/10"
                          title="Editar link do vídeo"
                        >
                          <Pencil size={14} />
                          Vídeo
                        </button>
                        <button
                          onClick={() => {
                            setEditingGabaritoQuestionId(q.id);
                            setEditingGabaritoIndex(q.correct_option_index ?? 0);
                          }}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10"
                          title="Editar gabarito"
                        >
                          <CheckCircle2 size={14} />
                          Gabarito
                        </button>
                        <button
                          onClick={() => {
                            setEditingImageQuestionId(q.id);
                            setEditingImagePreview(q.image_url || null);
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            q.image_url
                              ? "text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/10"
                              : "text-white/40 hover:text-purple-400 hover:bg-purple-500/10"
                          )}
                          title="Adicionar/editar imagem"
                        >
                          <ImagePlus size={14} />
                          Imagem
                        </button>
                        <button
                          onClick={() => {
                            setEditingFieldsQuestionId(q.id);
                            setEditingFields({
                              subject: q.subject || '', topic: q.topic || '', year: q.year || '',
                              institution: q.institution || '', org: q.org || '', difficulty: q.difficulty || 'Médio',
                              text: q.text || '', explanation: q.explanation || '',
                            });
                          }}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10"
                          title="Editar todos os campos"
                        >
                          <Settings size={14} />
                          Editar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setReportingQuestionId(q.id); setReportType(''); setReportDescription(''); }}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      title="Reportar erro nesta questão"
                    >
                      <Flag size={14} />
                      Reportar
                    </button>
                  </div>

                  {/* Video Edit Modal */}
                  {editingVideoQuestionId === q.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
                      onClick={() => setEditingVideoQuestionId(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <Video size={16} className="text-amber-400" />
                            Editar Link do Vídeo
                          </h3>
                          <button onClick={() => setEditingVideoQuestionId(null)} className="text-white/40 hover:text-white">
                            <X size={20} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editingVideoUrl}
                          onChange={(e) => setEditingVideoUrl(e.target.value)}
                          placeholder="Cole o link do YouTube aqui (ex: https://youtu.be/abc123)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        {editingVideoUrl && (
                          <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                            <iframe
                              width="100%" height="100%"
                              src={editingVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                              title="Preview" frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                        <div className="flex gap-2 justify-end">
                          {q.video_url && (
                            <button
                              onClick={() => handleSaveVideoUrl(q.id, '')}
                              className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                            >
                              Remover Vídeo
                            </button>
                          )}
                          <button
                            onClick={() => handleSaveVideoUrl(q.id, editingVideoUrl)}
                            className="px-6 py-2 bg-amber-500 text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all"
                          >
                            Salvar
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Gabarito Edit Modal */}
                  {editingGabaritoQuestionId === q.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
                      onClick={() => setEditingGabaritoQuestionId(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            Editar Gabarito
                          </h3>
                          <button onClick={() => setEditingGabaritoQuestionId(null)} className="text-white/40 hover:text-white">
                            <X size={20} />
                          </button>
                        </div>
                        <p className="text-xs text-white/50 line-clamp-2">{q.text}</p>
                        <div className="space-y-2">
                          {(q.options || []).map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => setEditingGabaritoIndex(optIdx)}
                              className={cn(
                                "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3",
                                editingGabaritoIndex === optIdx
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                  : "border-white/5 text-white/60 hover:border-white/20"
                              )}
                            >
                              <span className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border transition-all",
                                editingGabaritoIndex === optIdx
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-white/10 text-white/40"
                              )}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="line-clamp-1">{opt}</span>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setEditingGabaritoQuestionId(null)}
                            className="px-4 py-2 bg-white/5 text-white/40 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveGabarito(q.id, editingGabaritoIndex)}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all"
                          >
                            Salvar Gabarito
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Admin Edit All Fields Modal */}
                  {editingFieldsQuestionId === q.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
                      onClick={() => setEditingFieldsQuestionId(null)}>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-4"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <Settings size={16} className="text-[#3B82F6]" /> Editar Campos da Questão
                          </h3>
                          <button onClick={() => setEditingFieldsQuestionId(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Disciplina</label>
                            <input type="text" value={editingFields.subject || ''} onChange={e => setEditingFields(p => ({ ...p, subject: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Assunto (Topic)</label>
                            <input type="text" value={editingFields.topic || ''} onChange={e => setEditingFields(p => ({ ...p, topic: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Ano</label>
                            <input type="number" value={editingFields.year || ''} onChange={e => setEditingFields(p => ({ ...p, year: parseInt(e.target.value) || '' }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Banca (Institution)</label>
                            <input type="text" value={editingFields.institution || ''} onChange={e => setEditingFields(p => ({ ...p, institution: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Órgão</label>
                            <input type="text" value={editingFields.org || ''} onChange={e => setEditingFields(p => ({ ...p, org: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Dificuldade</label>
                            <select value={editingFields.difficulty || 'Médio'} onChange={e => setEditingFields(p => ({ ...p, difficulty: e.target.value }))}
                              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none appearance-none" style={{ colorScheme: 'dark' }}>
                              <option value="Fácil" className="bg-[#1a1a1a]">Fácil</option>
                              <option value="Médio" className="bg-[#1a1a1a]">Médio</option>
                              <option value="Difícil" className="bg-[#1a1a1a]">Difícil</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Enunciado</label>
                          <textarea value={editingFields.text || ''} onChange={e => setEditingFields(p => ({ ...p, text: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6] min-h-[100px] resize-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Explicação</label>
                          <textarea value={editingFields.explanation || ''} onChange={e => setEditingFields(p => ({ ...p, explanation: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#3B82F6] min-h-[80px] resize-none" />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button onClick={() => setEditingFieldsQuestionId(null)}
                            className="px-4 py-2 bg-white/5 text-white/40 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10">Cancelar</button>
                          <button onClick={() => handleSaveFields(q.id)}
                            className="px-6 py-2 bg-[#3B82F6] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#3B82F6]/80">Salvar Alterações</button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Image Edit Modal */}
                  {editingImageQuestionId === q.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
                      onClick={() => { setEditingImageQuestionId(null); setEditingImagePreview(null); }}>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        className="bg-[#111] border border-purple-500/20 rounded-2xl p-6 w-full max-w-lg space-y-4"
                        onClick={e => e.stopPropagation()}
                        onPaste={(e) => {
                          const items = e.clipboardData?.items;
                          if (!items) return;
                          for (let i = 0; i < items.length; i++) {
                            if (items[i].type.startsWith('image/')) {
                              const file = items[i].getAsFile();
                              if (file) handleImageFile(file);
                              break;
                            }
                          }
                        }}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <ImagePlus size={16} className="text-purple-400" /> Imagem da Questão
                          </h3>
                          <button onClick={() => { setEditingImageQuestionId(null); setEditingImagePreview(null); }} className="text-white/40 hover:text-white"><X size={20} /></button>
                        </div>
                        <p className="text-[10px] text-white/30 line-clamp-2">{q.text}</p>

                        {editingImagePreview ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-[300px] overflow-hidden rounded-xl border border-purple-500/20 bg-black/40">
                              <img src={editingImagePreview} alt="Preview" className="w-full h-full object-contain" />
                            </div>
                            <button
                              onClick={() => setEditingImagePreview(null)}
                              className="w-full py-2 bg-red-500/10 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 flex items-center justify-center gap-2"
                            >
                              <Trash2 size={12} /> Remover Imagem
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label
                              className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-purple-500/30 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                            >
                              <ImagePlus size={32} className="text-purple-400/50" />
                              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Clique para selecionar</span>
                              <span className="text-[10px] text-white/20">ou cole uma imagem (Ctrl+V)</span>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} />
                            </label>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-2">
                          <button onClick={() => { setEditingImageQuestionId(null); setEditingImagePreview(null); }}
                            className="px-4 py-2 bg-white/5 text-white/40 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10">Cancelar</button>
                          <button onClick={() => handleSaveImage(q.id)} disabled={savingImage}
                            className="px-6 py-2 bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-400 disabled:opacity-30 transition-all flex items-center gap-2">
                            {savingImage ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Report Error Modal */}
                  {reportingQuestionId === q.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
                      onClick={() => setReportingQuestionId(null)}>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        className="bg-[#111] border border-red-500/20 rounded-2xl p-6 w-full max-w-md space-y-4"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <Flag size={16} className="text-red-400" /> Reportar Erro
                          </h3>
                          <button onClick={() => setReportingQuestionId(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
                        </div>
                        <p className="text-xs text-white/40 line-clamp-2">{q.text}</p>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Tipo do Erro</label>
                          {['Gabarito errado', 'Enunciado com erro', 'Alternativa incorreta', 'Questão duplicada', 'Disciplina/assunto errado', 'Outro'].map(type => (
                            <button key={type} onClick={() => setReportType(type)}
                              className={cn("w-full text-left px-4 py-2.5 rounded-xl border text-xs font-bold transition-all",
                                reportType === type ? "bg-red-500/10 border-red-500/30 text-red-400" : "border-white/5 text-white/50 hover:border-white/20")}>
                              {type}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Descrição (opcional)</label>
                          <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)}
                            placeholder="Descreva o erro encontrado..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[80px] resize-none" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setReportingQuestionId(null)}
                            className="px-4 py-2 bg-white/5 text-white/40 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10">Cancelar</button>
                          <button onClick={() => handleSubmitReport(q.id)} disabled={reportSending || !reportType}
                            className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-400 disabled:opacity-30 transition-all flex items-center gap-2">
                            {reportSending ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />} Enviar Reporte
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab[q.id] === 'gabarito' && (
                      <motion.div
                        key="gabarito"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-2xl p-6 mt-2">
                          <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-xs uppercase tracking-widest mb-4">
                            <HelpCircle size={14} />
                            Análise Técnica do Professor
                          </div>
                          <div className="space-y-4">
                            <div className="text-sm text-white/70 leading-relaxed markdown-body">
                              <Markdown>
                                {q.explanation || "Esta questão ainda não possui um comentário técnico detalhado. Nossa equipe pedagógica está trabalhando para adicionar uma explicação completa em breve."}
                              </Markdown>
                            </div>

                            <div className="pt-4 border-t border-[#3B82F6]/10">
                              <h4 className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-3">Por que a alternativa {String.fromCharCode(64 + (q.correct_option_index + 1))} é a correta?</h4>
                              <p className="text-xs text-white/50 leading-relaxed italic">
                                O fundamento desta questão baseia-se na aplicação direta dos conceitos de {q.subject}, específicamente tratando de {q.topic || 'temas fundamentais da matéria'}. A banca {q.org?.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : q.org} costuma cobrar este padrão de raciocínio.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab[q.id] === 'video' && getVideoStatus(q) === 'Sim' && (
                      <motion.div
                        key="video"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 mt-2">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">
                            <Play size={14} />
                            Resolução em Vídeo
                          </div>
                          {isYouTubeUrl(q.video_url) ? (
                          <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black">
                            <iframe
                              width="100%" height="100%"
                              src={getYouTubeEmbedUrl(q.video_url)}
                              title="Resolução em Vídeo" frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                          ) : (
                          <a href={q.video_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 hover:bg-emerald-500/20 transition-all group">
                            <ExternalLink size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-widest">Abrir Resolução em Vídeo</span>
                          </a>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeTab[q.id] === 'comentarios' && (
                      <motion.div
                        key="comentarios"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <QuestionDiscussion questionId={q.id} />
                      </motion.div>
                    )}

                    {activeTab[q.id] === 'estatisticas' && (
                      <motion.div
                        key="estatisticas"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <QuestionStats 
                          questionId={q.id} 
                          optionsCount={q.options.length} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-10">
                  <button 
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-20 transition-all hover:bg-white/10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "w-12 h-12 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-widest",
                            currentPage === pageNum 
                              ? "bg-[#3B82F6] border-[#3B82F6] text-white shadow-xl shadow-[#3B82F6]/20" 
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-20 transition-all hover:bg-white/10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/[0.01] rounded-[40px] border border-white/5 border-dashed flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] mb-6">
                <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Seu Banco está Pronto</h3>
              <p className="text-sm text-white/70 max-w-xs mx-auto mb-8">
                O banco foi resetado com sucesso. Comece agora a importar suas questões usando nossa Inteligência Artificial.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="flex items-center gap-3 bg-[#0044CC] hover:bg-[#3B82F6] text-white px-8 py-4 rounded-2xl border border-[#3B82F6]/20 transition-all font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#3B82F6]/40"
                >
                  <Sparkles size={18} />
                  Iniciar Smart Import
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTopTab === 'notebooks' && !activeNotebookId && (
        <NotebooksView
          onOpenNotebook={(id) => { setActiveNotebookId(id); setCurrentPage(1); }}
        />
      )}

      {activeTopTab === 'notebooks' && activeNotebookId && activeNotebook && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setActiveNotebookId(null); setCurrentPage(1); }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
              </button>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{activeNotebook.title}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{notebookQuestions.length} questões</p>
              </div>
            </div>
          </div>

          {notebookQuestions.length > 0 ? (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A0A0A] border border-[#3B82F6]/30 rounded-[2rem] p-6 flex items-center gap-4 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]"
              >
                <div className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-[0_0_15px_#3B82F6] animate-pulse" />
                <span className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                  {notebookQuestions.length} QUESTÕES
                </span>
                <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em]">No caderno</span>
              </motion.div>

              {notebookPaginatedQuestions.map((q, pIdx) => {
                const idx = (currentPage - 1) * itemsPerPage + pIdx;
                return (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 hover:border-[#3B82F6]/20 transition-colors relative group/card"
                  >
                    <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
                      <span className="text-[11px] font-black text-white bg-[#3B82F6] px-4 py-2 rounded-xl border border-[#3B82F6]/30 uppercase tracking-widest shadow-[0_0_15px_-3px_#3B82F6]">
                        QUESTÃO {idx + 1} DE {notebookQuestions.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20">
                          <span className="opacity-50">Matéria:</span> {q.subject}
                        </span>
                        {q.year != null && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.05] border-white/10 text-white/90">
                            <Calendar size={11} className="text-[#3B82F6]/50" />
                            <span className="opacity-40">Ano:</span> {q.year}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.05] border-white/10 text-white/90">
                            <BrainCircuit size={11} className="text-[#3B82F6]/50" />
                            <span className="opacity-40">Dificuldade:</span> {normalizeDifficulty(q.difficulty)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                      <Markdown>{q.text}</Markdown>
                    </div>

                    <div className="space-y-2">
                      {(q.options || []).map((opt: string, optIdx: number) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCorrect = optIdx === q.correct_option_index;
                        const isSelected = answers[q.id] === optIdx;
                        const isTempSelected = tempAnswers[q.id] === optIdx;
                        const isCut = (cutOptions[q.id] || []).includes(optIdx);
                        return (
                          <button key={optIdx}
                            onClick={() => !isCut && handleAnswer(q, optIdx)}
                            disabled={isAnswered || isCut}
                            className={cn(
                              "w-full text-left px-5 py-4 rounded-2xl border text-sm transition-all duration-300 flex items-center gap-4 group relative",
                              isCut ? "opacity-20 line-through cursor-not-allowed border-white/5" :
                              isAnswered ? (isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : isSelected ? "bg-red-500/10 border-red-500/30 text-red-400" : "border-white/5 text-white/50") :
                              isTempSelected ? "bg-[#3B82F6]/10 border-[#3B82F6]/40 text-[#3B82F6] shadow-[0_0_20px_-5px_#3B82F6]" :
                              "border-white/5 text-white/80 hover:border-white/20 hover:bg-white/[0.03]"
                            )}
                          >
                            <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border transition-all",
                              isCut ? "border-white/10 text-white/20" :
                              isAnswered ? (isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : isSelected ? "border-red-500 bg-red-500 text-white" : "border-white/10 text-white/30") :
                              isTempSelected ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-white/10 text-white/40"
                            )}>
                              {isAnswered ? (isCorrect ? <Check size={14} /> : isSelected ? <XCircle size={14} /> : String.fromCharCode(65 + optIdx)) : String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {!isAnswered && (
                              <button onClick={(e) => { e.stopPropagation(); toggleCut(q.id, optIdx); }}
                                className={cn(
                                  "p-1 transition-all",
                                  isCut ? "opacity-100 text-[#3B82F6] hover:text-[#3B82F6]/80" : "opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"
                                )}
                                title={isCut ? "Restaurar opção" : "Eliminar alternativa"}>
                                {isCut ? <RotateCcw size={14} /> : <Scissors size={14} />}
                              </button>
                            )}
                          </button>
                        );
                      })}

                      {!answers[q.id] && tempAnswers[q.id] !== undefined && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                          <button onClick={() => confirmAnswer(q)}
                            className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                            Responder
                          </button>
                        </motion.div>
                      )}

                    </div>

                    <div className="flex items-center gap-1 border-t border-white/5 pt-4 flex-wrap">
                      <button onClick={() => setActiveTab(prev => ({ ...prev, [q.id]: prev[q.id] === 'gabarito' ? undefined : 'gabarito' }))}
                        className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          activeTab[q.id] === 'gabarito' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-white/70 hover:text-white/100 hover:bg-white/5")}>
                        <BookOpen size={14} /> Gabarito
                      </button>
                      {getVideoStatus(q) === 'Sim' && (
                        <button onClick={() => setActiveTab(prev => ({ ...prev, [q.id]: prev[q.id] === 'video' ? undefined : 'video' }))}
                          className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab[q.id] === 'video' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/70 hover:text-white/100 hover:bg-white/5")}>
                          <Play size={14} /> Resolução em Vídeo
                        </button>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab[q.id] === 'gabarito' && (
                        <motion.div key="gabarito" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="overflow-hidden">
                          <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-2xl p-6 mt-2">
                            <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-xs uppercase tracking-widest mb-4"><HelpCircle size={14} /> Análise Técnica</div>
                            <div className="text-sm text-white/70 leading-relaxed markdown-body"><Markdown>{q.explanation || "Explicação em breve."}</Markdown></div>
                          </div>
                        </motion.div>
                      )}
                      {activeTab[q.id] === 'video' && getVideoStatus(q) === 'Sim' && (
                        <motion.div key="video" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="overflow-hidden">
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 mt-2">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4"><Play size={14} /> Resolução em Vídeo</div>
                            {isYouTubeUrl(q.video_url) ? (
                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black">
                              <iframe width="100%" height="100%" src={getYouTubeEmbedUrl(q.video_url)} title="Resolução em Vídeo" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                            </div>
                            ) : (
                            <a href={q.video_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 w-full py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 hover:bg-emerald-500/20 transition-all group">
                              <ExternalLink size={24} className="group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-black uppercase tracking-widest">Abrir Resolução em Vídeo</span>
                            </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {notebookTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8">
                  <button onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentPage === 1} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-20 transition-all hover:bg-white/10">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: notebookTotalPages }, (_, i) => i + 1).map(pageNum => (
                      <button key={pageNum} onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={cn("w-10 h-10 rounded-xl border font-black text-sm transition-all",
                          currentPage === pageNum ? "bg-[#3B82F6] border-[#3B82F6] text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10")}>
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setCurrentPage(prev => Math.min(notebookTotalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentPage === notebookTotalPages} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-20 transition-all hover:bg-white/10">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-white/20 uppercase tracking-[0.2em] font-black text-[10px] bg-white/[0.01] rounded-3xl border border-white/5 border-dashed">
              Este caderno não possui questões
            </div>
          )}
        </div>
      )}

      {activeTopTab === 'saved_filters' && (
        <SavedFiltersView onLoadFilter={loadSavedFilter} />
      )}

      {activeTopTab === 'bulk_videos' && isAdmin && (
        <BulkVideoEditor questions={questions} onUpdate={fetchQuestions} />
      )}

      {/* Reports Panel */}
      <AnimatePresence>
        {showReportsPanel && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-end sm:items-center justify-center" onClick={() => setShowReportsPanel(false)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-[#0A0A0A] border border-red-500/20 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(255,0,50,0.1)]"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-red-500/10 flex items-center justify-between shrink-0">
                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
                  <AlertOctagon size={20} className="text-red-400" />
                  Reporte de Erros
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                    {reports.filter(r => r.status === 'pending').length} pendentes
                  </span>
                </h3>
                <button onClick={() => setShowReportsPanel(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-16 text-white/20">
                    <AlertOctagon size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum reporte de erro</p>
                  </div>
                ) : reports.map(r => (
                  <div key={r.id} className={cn("border rounded-2xl p-4 space-y-2 transition-all",
                    r.status === 'pending' ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-white/[0.02] opacity-60")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                            r.status === 'pending' ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                            {r.status === 'pending' ? 'Pendente' : 'Resolvido'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest">{r.report_type}</span>
                          <span className="text-[9px] text-white/30">{r.question_subject} • {r.question_topic}</span>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2 mb-1">{r.question_text}...</p>
                        {r.description && <p className="text-xs text-white/40 italic">&ldquo;{r.description}&rdquo;</p>}
                        <div className="flex items-center gap-3 mt-2 text-[9px] text-white/30">
                          <span>Por: <strong className="text-white/50">{r.reported_by}</strong></span>
                          <span>{new Date(r.created_at).toLocaleDateString('pt-BR')} às {new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {r.resolved_at && <span className="text-emerald-400/60">Resolvido em {new Date(r.resolved_at).toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {r.status === 'pending' && (
                          <button onClick={() => handleResolveReport(r.id)}
                            className="p-2 text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Marcar como resolvido">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button onClick={() => {
                          const q = questions.find(qq => qq.id === r.question_id);
                          if (q) {
                            setShowReportsPanel(false);
                            setSearchTerm(q.text.substring(0, 30));
                            setActiveTopTab('filter');
                          }
                        }} className="p-2 text-white/20 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-all" title="Ver questão">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDeleteReport(r.id)}
                          className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Excluir reporte">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdmin && (
          <AdminQuestions
            onClose={() => {
              setShowAdmin(false);
              fetchQuestions();
            }}
          />
        )}
      </AnimatePresence>

      {/* Admin Edit Question Modal */}
      <AnimatePresence>
        {editingQuestion && isAdmin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter text-white">Editar Questão</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Altere as alternativas, gabarito ou enunciado</p>
                </div>
                <button onClick={() => setEditingQuestion(null)} className="p-2 text-white/40 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Enunciado */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Enunciado</label>
                  <textarea
                    value={editForm.text}
                    onChange={e => setEditForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 resize-none min-h-[100px] transition-all"
                  />
                </div>

                {/* Alternativas */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Alternativas</label>
                  {editForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <button
                        onClick={() => setEditForm(prev => ({ ...prev, correct_option_index: idx }))}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border transition-all mt-1",
                          editForm.correct_option_index === idx
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-white/10 text-white/40 hover:border-emerald-500/50 hover:text-emerald-400"
                        )}
                        title={editForm.correct_option_index === idx ? "Resposta correta" : "Definir como correta"}
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>
                      <textarea
                        value={opt}
                        onChange={e => {
                          const newOpts = [...editForm.options];
                          newOpts[idx] = e.target.value;
                          setEditForm(prev => ({ ...prev, options: newOpts }));
                        }}
                        rows={2}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all resize-none"
                      />
                    </div>
                  ))}
                  <p className="text-[9px] text-emerald-400/60 font-bold uppercase tracking-widest">
                    Clique na letra para definir a resposta correta (atual: {String.fromCharCode(65 + editForm.correct_option_index)})
                  </p>
                </div>

                {/* Explicação */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Explicação</label>
                  <textarea
                    value={editForm.explanation}
                    onChange={e => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 resize-none min-h-[80px] transition-all"
                    placeholder="Explicação da resposta..."
                  />
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">URL do Vídeo</label>
                  <input
                    type="text"
                    value={editForm.video_url}
                    onChange={e => setEditForm(prev => ({ ...prev, video_url: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 transition-all"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                {/* Meta: Subject, Topic, Org, Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Disciplina</label>
                    <input type="text" value={editForm.subject}
                      onChange={e => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Assunto</label>
                    <input type="text" value={editForm.topic}
                      onChange={e => setEditForm(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Órgão</label>
                    <input type="text" value={editForm.org}
                      onChange={e => setEditForm(prev => ({ ...prev, org: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Ano</label>
                    <input type="text" value={editForm.year}
                      onChange={e => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50 transition-all" />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3 shrink-0">
                <button onClick={() => setEditingQuestion(null)}
                  className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSaveEdit} disabled={savingEdit}
                  className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingEdit ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for Notebooks and Saved Filters
function NotebooksView({ onOpenNotebook }: { onOpenNotebook: (id: string) => void }) {
  const { notebooks, addNotebook, deleteNotebook, updateNotebook } = useStudy();
  const [search, setSearch] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [movingNotebookId, setMovingNotebookId] = useState<string | null>(null);

  useEffect(() => {
    if (currentFolderId && !notebooks.find(n => n.id === currentFolderId)) {
      queueMicrotask(() => setCurrentFolderId(null));
    }
  }, [notebooks, currentFolderId]);

  const filteredNotebooks = notebooks.filter(nb => {
    const parentMatch = (!nb.parentId && !currentFolderId) || (nb.parentId === currentFolderId);
    return parentMatch && nb.title.toLowerCase().includes(search.toLowerCase());
  });

  const folders = notebooks.filter(nb => nb.type === 'folder');
  const currentFolder = notebooks.find(n => n.id === currentFolderId);

  const handleMove = (notebookId: string, targetFolderId: string | null) => {
    updateNotebook(notebookId, { parentId: targetFolderId });
    setMovingNotebookId(null);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Move modal */}
      {movingNotebookId && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setMovingNotebookId(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <FolderInput size={16} className="text-blue-400" />
                Mover para Pasta
              </h3>
              <button onClick={() => setMovingNotebookId(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleMove(movingNotebookId, null)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 transition-all flex items-center gap-3 border border-white/5"
              >
                <ChevronLeft size={16} /> Raiz (sem pasta)
              </button>
              {folders.filter(f => f.id !== movingNotebookId).map(f => (
                <button key={f.id}
                  onClick={() => handleMove(movingNotebookId, f.id)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-blue-500/10 hover:text-blue-400 transition-all flex items-center gap-3 border border-white/5"
                >
                  <Folder size={16} className="text-blue-500" /> {f.title}
                </button>
              ))}
              {folders.length === 0 && (
                <p className="text-white/30 text-xs text-center py-4 uppercase tracking-widest">Nenhuma pasta criada</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          {currentFolderId && (
            <button
              onClick={() => setCurrentFolderId(currentFolder?.parentId || null)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all flex items-center gap-2"
              title="Voltar"
            >
              <ChevronLeft size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
            </button>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Procure por um caderno"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#0055FF] transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const title = prompt('Nome da Pasta:');
              if (title) addNotebook({ title, type: 'folder', parentId: currentFolderId });
            }}
            className="flex items-center gap-2 bg-[#0055FF] hover:bg-[#0044CC] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#0055FF]/20 text-sm whitespace-nowrap"
          >
            <FolderPlus size={18} />
            Nova Pasta
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold px-2" id="notebooks-list-title">
            {currentFolder ? `Pasta: ${currentFolder.title}` : 'Meus Cadernos e Pastas'}
          </h3>
          {currentFolderId && (
             <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
               {filteredNotebooks.length} itens encontrados
             </span>
          )}
        </div>

        <div className="space-y-3">
          {filteredNotebooks.length > 0 ? filteredNotebooks.map((nb) => (
            <div
              key={nb.id}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-[#0055FF]/30 transition-all cursor-pointer"
              onClick={() => {
                if (nb.type === 'folder') setCurrentFolderId(nb.id);
                else onOpenNotebook(nb.id);
              }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  nb.type === 'folder' ? "bg-[#0055FF]/10 text-[#0055FF]" : "bg-blue-500/10 text-blue-500"
                )}>
                  {nb.type === 'folder' ? <Folder size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h4 className="text-white font-bold group-hover:text-[#0055FF] transition-colors uppercase tracking-tight italic">
                    {nb.title}
                  </h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5 font-bold">
                    Criado em {new Date(nb.createdAt).toLocaleDateString()} • {nb.count} {nb.type === 'folder' ? 'Itens' : 'Questões'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {nb.type === 'notebook' && (
                  <button
                    onClick={() => setMovingNotebookId(nb.id)}
                    className="p-2 text-white/20 hover:text-blue-400 transition-colors" title="Mover para pasta"
                  >
                    <FolderInput size={18} />
                  </button>
                )}
                <button
                  onClick={() => {
                    const newTitle = prompt('Novo nome:', nb.title);
                    if (newTitle) updateNotebook(nb.id, { title: newTitle });
                  }}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <Settings2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Deseja excluir este item?')) deleteNotebook(nb.id);
                  }}
                  className="p-2 text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-white/20 uppercase tracking-[0.2em] font-black text-[10px] bg-white/[0.01] rounded-3xl border border-white/5 border-dashed">
              Nenhum item nesta localização
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function SavedFiltersView({ onLoadFilter }: { onLoadFilter: (filters: any) => void }) {
  const { savedFilters, deleteSavedFilter } = useStudy();
  const [search, setSearch] = useState('');

  const filtered = savedFilters.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="text"
            placeholder="Procure por um filtro"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-6">
          <h3 className="text-white font-bold px-2" id="all-filters-list-title">Filtros Salvos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 pt-2 font-black pl-4">Nome</th>
                  <th className="pb-4 pt-2 font-black">Data de Criação</th>
                  <th className="pb-4 pt-2 font-black text-right pr-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length > 0 ? filtered.map(f => (
                  <tr key={f.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 pl-4 text-white/80 font-medium group-hover:text-white">{f.name}</td>
                    <td className="py-6 text-white/40 text-sm">{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td className="py-6 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onLoadFilter(f.filters)}
                          className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                        >
                          Carregar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja excluir este filtro?')) deleteSavedFilter(f.id);
                          }}
                          className="p-2 text-white/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-white/20 uppercase tracking-[0.2em] font-black text-[10px]">
                      Nenhum filtro salvo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkVideoEditor({ questions, onUpdate }: { questions: any[]; onUpdate: () => void }) {
  const [filterSubject, setFilterSubject] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterNoVideo, setFilterNoVideo] = useState(false);
  const [bulkLinks, setBulkLinks] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const uniqueSubjects = [...new Set(questions.map(q => q.subject).filter(Boolean))].sort();
  const uniqueOrgs = [...new Set(questions.map(q => q.org).filter(Boolean))].sort();
  const uniqueYears = [...new Set(questions.map(q => String(q.year)).filter(y => y && y !== 'null'))].sort((a, b) => Number(b) - Number(a));

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (filterSubject && q.subject !== filterSubject) return false;
      if (filterOrg && q.org !== filterOrg) return false;
      if (filterYear && String(q.year) !== filterYear) return false;
      if (filterNoVideo) {
        const url = String(q.video_url || '').trim();
        if (url && url !== 'null' && url !== 'undefined') return false;
      }
      return true;
    }).sort((a, b) => {
      const numA = parseInt(String(a.topic || '').replace(/\D/g, '')) || 9999;
      const numB = parseInt(String(b.topic || '').replace(/\D/g, '')) || 9999;
      if (numA !== numB) return numA - numB;
      return (a.created_at || '').localeCompare(b.created_at || '');
    });
  }, [questions, filterSubject, filterOrg, filterYear, filterNoVideo]);

  const handleBulkSave = async () => {
    const links = bulkLinks.split('\n').map(l => l.trim()).filter(Boolean);
    if (links.length === 0) { alert('Cole pelo menos um link.'); return; }
    if (links.length > filtered.length) {
      alert(`Você colou ${links.length} links, mas há apenas ${filtered.length} questões filtradas. Reduza os links ou ajuste os filtros.`);
      return;
    }

    setSaving(true);
    setResult(null);
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < links.length; i++) {
      const q = filtered[i];
      const { error } = await supabase
        .from('questions')
        .update({ video_url: links[i] })
        .eq('id', q.id);
      if (error) { errors++; console.error(error); }
      else updated++;
    }

    setSaving(false);
    setResult(`${updated} questões atualizadas com sucesso.${errors > 0 ? ` ${errors} erros.` : ''}`);
    setBulkLinks('');
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0A0A0A] border border-white/5 p-6 sm:p-10 rounded-[2.5rem] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Video size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Editor de Vídeos em Massa</h3>
            <p className="text-sm text-white/50">Filtre as questões, cole os links (um por linha) e salve tudo de uma vez.</p>
          </div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
            <AlertTriangle size={12} /> Como funciona
          </p>
          <p className="text-xs text-emerald-400/80">
            1. Use os filtros abaixo para selecionar as questões que deseja vincular vídeos<br />
            2. Cole todos os links de vídeo no campo de texto (um link por linha)<br />
            3. O link 1 será vinculado à questão 1 da lista, link 2 à questão 2, e assim por diante<br />
            4. Links do Telegram (t.me/...) funcionam — o app abrirá em nova aba automaticamente
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Disciplina</label>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none"
              style={{ colorScheme: 'dark' }}>
              <option value="" className="bg-[#1a1a1a] text-white">Todas</option>
              {uniqueSubjects.map(s => <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Órgão</label>
            <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none"
              style={{ colorScheme: 'dark' }}>
              <option value="" className="bg-[#1a1a1a] text-white">Todos</option>
              {uniqueOrgs.map(o => <option key={o} value={o} className="bg-[#1a1a1a] text-white">{o}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ano</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none"
              style={{ colorScheme: 'dark' }}>
              <option value="" className="bg-[#1a1a1a] text-white">Todos</option>
              {uniqueYears.map(y => <option key={y} value={y} className="bg-[#1a1a1a] text-white">{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Filtro extra</label>
            <button onClick={() => setFilterNoVideo(!filterNoVideo)}
              className={cn("w-full py-3 px-4 rounded-xl text-sm font-bold border transition-all text-left",
                filterNoVideo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10")}>
              {filterNoVideo ? 'Apenas sem vídeo' : 'Todas as questões'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/40">{filtered.length} questões encontradas</span>
          {filtered.length > 0 && (
            <span className="text-white/20">•</span>
          )}
          {filtered.filter(q => getVideoStatus(q) === 'Sim').length > 0 && (
            <span className="text-emerald-400/60">{filtered.filter(q => getVideoStatus(q) === 'Sim').length} já com vídeo</span>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto space-y-1 bg-white/[0.01] rounded-2xl border border-white/5 p-4">
            {filtered.slice(0, 100).map((q, idx) => (
              <div key={q.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-[10px] font-black text-white/30 w-8 text-center shrink-0">{idx + 1}</span>
                <p className="text-xs text-white/60 line-clamp-1 flex-1">{q.text}</p>
                {getVideoStatus(q) === 'Sim' ? (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">COM VÍDEO</span>
                ) : (
                  <span className="text-[9px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded shrink-0">SEM VÍDEO</span>
                )}
              </div>
            ))}
            {filtered.length > 100 && (
              <p className="text-center text-white/20 text-[10px] uppercase tracking-widest pt-2">Mostrando 100 de {filtered.length}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Cole os links aqui (um por linha — link 1 = questão 1 da lista acima)
          </label>
          <textarea
            value={bulkLinks}
            onChange={e => setBulkLinks(e.target.value)}
            placeholder={"https://t.me/canal/123\nhttps://t.me/canal/124\nhttps://t.me/canal/125\n..."}
            className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-mono text-xs"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30">
              {bulkLinks.split('\n').filter(l => l.trim()).length} links colados
              {filtered.length > 0 && ` → ${Math.min(bulkLinks.split('\n').filter(l => l.trim()).length, filtered.length)} questões serão atualizadas`}
            </span>
            <button
              onClick={handleBulkSave}
              disabled={saving || bulkLinks.split('\n').filter(l => l.trim()).length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-30 shadow-lg shadow-emerald-500/20">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Vídeos em Massa
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
            <Check size={20} />
            <p className="text-sm font-bold">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
