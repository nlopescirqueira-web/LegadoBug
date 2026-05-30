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
  ChevronRight
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
      return questions.filter(q => {
        const qYear = q.year === null || q.year === undefined ? '' : String(q.year).trim();
        return qYear !== '' && opt.trim() === qYear;
      }).length;
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
  const low = val.toLowerCase();
  
  // Português normalization
  if (
    low === 'português' || 
    low === 'portugues' || 
    low === 'língua portuguesa' || 
    low === 'lingua portuguesa' ||
    low.includes('língua portuguesa') ||
    low.includes('lingua portuguesa') ||
    (low.includes('português') && low.includes('língua')) ||
    (low.includes('portugues') && low.includes('lingua'))
  ) {
    return 'Português';
  }

  // Common variations for other subjects
  if (low.includes('raciocínio lógico') || low.includes('raciocinio logico') || low === 'rlm') {
    return 'Raciocínio Lógico';
  }

  if (low === 'informática' || low === 'informatica' || low.includes('noções de informática')) {
    return 'Informática';
  }

  if (low.includes('matemática') || low === 'matematica') {
    return 'Matemática';
  }
  
  return val;
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

  const [activeTopTab, setActiveTopTab] = useState<'filter' | 'notebooks' | 'saved_filters'>('filter');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Local state for answers (this session)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [tempAnswers, setTempAnswers] = useState<Record<string, number>>({});
  const [cutOptions, setCutOptions] = useState<Record<string, number[]>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'gabarito' | 'comentarios' | 'estatisticas'>>({});

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

  const toggleFilter = useCallback((key: keyof AdvancedFilters, value: string) => {
    setAdvFilters(prev => {
      const list = prev[key];
      if (Array.isArray(list)) {
        const isAlreadySelected = list.some(item => normalizeString(item) === normalizeString(value));
        const nextList = isAlreadySelected
          ? list.filter(item => normalizeString(item) !== normalizeString(value))
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
    return questions.filter(q => {
      const matchSearch = !searchTerm || 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDisciplina = advFilters.disciplina.length === 0 || 
        advFilters.disciplina.some(d => normalizeString(normalizeSubject(d)) === normalizeString(normalizeSubject(q.subject)));
      
      const matchAssunto = advFilters.assunto.length === 0 || 
        advFilters.assunto.some(a => normalizeString(a) === normalizeString(q.topic));
      
      const matchAno = advFilters.ano.length === 0 ||
        advFilters.ano.some(yearStr => {
          const qYear = q.year === null || q.year === undefined ? '' : String(q.year).trim();
          return qYear !== '' && yearStr.trim() === qYear;
        });
      
      const matchBanca = advFilters.banca.length === 0 || 
        advFilters.banca.some(b => normalizeString(b) === normalizeString(q.institution));
      
      const matchInstituicao = advFilters.instituicao.length === 0 || 
        advFilters.instituicao.some(i => {
          const org = q.org || '';
          const normalizedOrg = org.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : org;
          return normalizeString(i) === normalizeString(normalizedOrg);
        });
      
      const qDifficulty = normalizeString(q.difficulty);
      const matchDificuldade = advFilters.dificuldade.length === 0 ||
        qDifficulty === '' ||
        advFilters.dificuldade.some(d => normalizeString(d) === qDifficulty);

      const videoUrl = String(q.video_url || q.videoUrl || '').trim();
      const hasVideo = videoUrl !== '' && videoUrl !== 'null' && videoUrl !== 'undefined';
      const matchVideo = !advFilters.videoRes || advFilters.videoRes.length === 0 || (
        (advFilters.videoRes.some(v => normalizeString(v) === 'sim') && hasVideo) ||
        (advFilters.videoRes.some(v => normalizeString(v) === 'nao') && !hasVideo)
      );

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
      
      return matchSearch && matchDisciplina && matchAssunto && matchAno && matchBanca && matchInstituicao && matchDificuldade && matchVideo;
    });
  }, [questions, advFilters, searchTerm, questionAnswers]);

  const questionsForYearCount = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = !searchTerm ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDisciplina = advFilters.disciplina.length === 0 ||
        advFilters.disciplina.some((d: string) => normalizeString(normalizeSubject(d)) === normalizeString(normalizeSubject(q.subject)));

      const matchAssunto = advFilters.assunto.length === 0 ||
        advFilters.assunto.some((a: string) => normalizeString(a) === normalizeString(q.topic));

      const matchBanca = advFilters.banca.length === 0 ||
        advFilters.banca.some((b: string) => normalizeString(b) === normalizeString(q.institution));

      const matchInstituicao = advFilters.instituicao.length === 0 ||
        advFilters.instituicao.some((i: string) => {
          const org = q.org || '';
          const normalizedOrg = org.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : org;
          return normalizeString(i) === normalizeString(normalizedOrg);
        });

      const qDifficulty = normalizeString(q.difficulty);
      const matchDificuldade = advFilters.dificuldade.length === 0 ||
        qDifficulty === '' ||
        advFilters.dificuldade.some((d: string) => normalizeString(d) === qDifficulty);

      const videoUrl = String(q.video_url || q.videoUrl || '').trim();
      const hasVideo = videoUrl !== '' && videoUrl !== 'null' && videoUrl !== 'undefined';
      const matchVideo = !advFilters.videoRes || advFilters.videoRes.length === 0 || (
        (advFilters.videoRes.some((v: string) => normalizeString(v) === 'sim') && hasVideo) ||
        (advFilters.videoRes.some((v: string) => normalizeString(v) === 'nao') && !hasVideo)
      );

      return matchSearch && matchDisciplina && matchAssunto && matchBanca && matchInstituicao && matchDificuldade && matchVideo;
    });
  }, [questions, advFilters.disciplina, advFilters.assunto, advFilters.banca, advFilters.instituicao, advFilters.dificuldade, advFilters.videoRes, searchTerm]);

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

    const disciplina = getUniqueCaseInsensitive([
      'Português', 'Sociologia', 'Inglês', 'Espanhol', 'Direito Administrativo',
      ...questions.map(q => normalizeSubject(q.subject))
    ]);

    const ano = Array.from(new Set(questions.map(q => {
      const y = q.year;
      if (y === null || y === undefined) return '';
      return String(y).trim();
    })))
      .filter(val => val && val !== 'null' && val !== 'undefined' && val !== '')
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    
    const banca = getUniqueCaseInsensitive(questions.map(q => q.institution)).map(s => s.trim());

    const instituicao = getUniqueCaseInsensitive([
      'APMBB', 'PMSP',
      ...questions.map(q => {
        const org = q.org;
        if (org && org.toLowerCase().includes('polícia militar do estado de são paulo')) return 'PMSP';
        return org;
      })
    ]);
    
    const standardDifficulties = ['Fácil', 'Médio', 'Difícil'];
    const extraDifficulties = getUniqueCaseInsensitive(
      questions.map(q => q.difficulty)
    ).filter(d => !standardDifficulties.some(s => normalizeString(s) === normalizeString(d)));
    const dificuldade = [...standardDifficulties, ...extraDifficulties];
    const videoRes = ['Sim', 'Não'];
    
    const relevantForAssunto = advFilters.disciplina.length === 0 
      ? questions 
      : questions.filter(q => advFilters.disciplina.some(d => normalizeString(normalizeSubject(d)) === normalizeString(normalizeSubject(q.subject))));
    
    const assunto = getUniqueCaseInsensitive(relevantForAssunto.map(q => q.topic));

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

  const toggleCut = (qId: string, optIdx: number) => {
    if (answers[qId] !== undefined) return;
    
    setCutOptions(prev => {
      const current = prev[qId] || [];
      if (current.includes(optIdx)) {
        return { ...prev, [qId]: current.filter(i => i !== optIdx) };
      } else {
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
                  <div className="space-y-4 relative z-10">
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
                        onChange={(val) => setAdvFilters(prev => ({ ...prev, dificuldade: val }))} 
                      />
                      <FilterDropdown
                        label="Ano"
                        options={uniqueValues.ano}
                        selected={advFilters.ano}
                        onChange={(val) => setAdvFilters(prev => ({ ...prev, ano: val }))}
                        showCounts={true}
                        questions={questionsForYearCount}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Row 3 */}
                      <FilterDropdown 
                        label="Resolução Por Vídeo" 
                        options={uniqueValues.videoRes} 
                        selected={advFilters.videoRes || []} 
                        onChange={(val) => setAdvFilters(prev => ({ ...prev, videoRes: val }))} 
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
                          advFilters.ano.some(y => normalizeString(y) === normalizeString(String(q.year)))
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-white/[0.05] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <Calendar size={11} className={advFilters.ano.some(y => normalizeString(y) === normalizeString(String(q.year))) ? "text-white" : "text-[#3B82F6]/50"} />
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
                      {q.difficulty && (
                      <button
                        onClick={() => toggleFilter('dificuldade', q.difficulty)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap",
                          advFilters.dificuldade.some(d => normalizeString(d) === normalizeString(q.difficulty))
                            ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-white/[0.05] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <BrainCircuit size={11} className={advFilters.dificuldade.some(d => normalizeString(d) === normalizeString(q.difficulty)) ? "text-white" : "text-[#3B82F6]/50"} />
                        <span className="opacity-40">Dificuldade:</span> {q.difficulty}
                      </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-auto pt-2 sm:pt-0">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteQuestion(q.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/10"
                          title="Excluir Questão permanentemente"
                        >
                          <Trash2 size={14} />
                          <span>Excluir</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-lg leading-relaxed text-white font-medium tracking-tight markdown-body">
                    {q.image_url && (
                      <div className="mb-6 relative w-full h-[400px] overflow-hidden rounded-2xl border border-white/10">
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

                  <div className="flex items-center gap-1 border-t border-white/5 pt-4">
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
                      Gabarito Comentado
                    </button>
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
                      Comentários de Alunos
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
                  </div>

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
                            
                            {q.video_url && String(q.video_url).trim() !== '' && String(q.video_url).trim() !== 'null' && (
                              <div className='mt-4 w-full aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black'>
                                <iframe width='100%' height='100%' src={q.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} title='Resolução em Vídeo' frameBorder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowFullScreen></iframe>
                              </div>
                            )}

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

      {activeTopTab === 'notebooks' && (
        <NotebooksView />
      )}

      {activeTopTab === 'saved_filters' && (
        <SavedFiltersView />
      )}

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
    </div>
  );
}

// Sub-components for Notebooks and Saved Filters
function NotebooksView() {
  const { notebooks, addNotebook, deleteNotebook, updateNotebook } = useStudy();
  const [search, setSearch] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (currentFolderId && !notebooks.find(n => n.id === currentFolderId)) {
      queueMicrotask(() => setCurrentFolderId(null));
    }
  }, [notebooks, currentFolderId]);

  const filteredNotebooks = notebooks.filter(nb => {
    const parentMatch = (!nb.parentId && !currentFolderId) || (nb.parentId === currentFolderId);
    return parentMatch && nb.title.toLowerCase().includes(search.toLowerCase());
  });

  const currentFolder = notebooks.find(n => n.id === currentFolderId);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
function SavedFiltersView() {
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
