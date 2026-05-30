'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Trash2, Edit2, ChevronLeft, ChevronRight, RotateCcw, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  next_review?: string;
}

const FlashcardItem = ({ card, onDelete }: { card: Flashcard, onDelete: (id: string) => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDue = useMemo(() => {
    if (!card.next_review) return true;
    return new Date(card.next_review) <= new Date();
  }, [card.next_review]);

  const nextReviewFormatted = useMemo(() => {
    if (!card.next_review) return null;
    return new Date(card.next_review).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }, [card.next_review]);

  return (
    <div className="perspective-1000 h-72 relative group">
      <motion.div
        className="relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between hover:border-[#3B82F6]/30 transition-all shadow-2xl group-hover:shadow-[#3B82F6]/5 overflow-hidden">
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-[#3B82F6]/10 transition-all" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/95">{card.subject}</span>
              </div>
              {nextReviewFormatted && (
                <div className={cn(
                  "px-2 py-0.5 rounded-full w-fit flex items-center gap-1 border",
                  isDue ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                  <Calendar size={8} />
                  <span className="text-[7px] font-black uppercase tracking-widest">
                    {isDue ? "Vencido" : `Revisão: ${nextReviewFormatted}`}
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-red-500/20"
            >
              <Trash2 size={12} />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center py-6 relative z-10">
            <h3 className="text-lg font-bold text-white text-center leading-tight tracking-tight px-4">{card.front}</h3>
          </div>
          
          <div className="flex items-center justify-center gap-3 relative z-10">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
              <p className="text-[8px] text-white uppercase tracking-[0.3em] font-black">Revelar</p>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-white border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center text-center rotate-y-180 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-30" />
          
          <div className="absolute top-8 flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#3B82F6]">Gabarito</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base font-bold text-black leading-relaxed px-4">{card.back}</p>
          </div>
          
          <div className="absolute bottom-8 flex items-center gap-2 opacity-20">
            <RotateCcw size={10} className="text-black" />
            <p className="text-[8px] text-black uppercase tracking-[0.3em] font-black">Voltar</p>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-md rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-6 border border-red-500/30"
          >
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
              <Trash2 size={24} />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-xs">Excluir este flashcard?</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-3 bg-white/5 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
              >
                Manter
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card.id);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Flashcards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', subject: '' });
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewMode, setReviewMode] = useState<'all' | 'due'>('due');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('Todos');
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewStats, setReviewStats] = useState({ correct: 0, total: 0 });
  const [showSessionComplete, setShowSessionComplete] = useState(false);

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(cards.map(c => c.subject)));
    return ['Todos', ...uniqueSubjects];
  }, [cards]);

  const filteredCards = useMemo(() => {
    let result = cards;
    if (selectedSubject !== 'Todos') {
      result = result.filter(c => c.subject === selectedSubject);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.front.toLowerCase().includes(query) || 
        c.back.toLowerCase().includes(query) ||
        c.subject.toLowerCase().includes(query)
      );
    }
    return result;
  }, [cards, selectedSubject, searchQuery]);

  const dueCards = useMemo(() => {
    const now = new Date();
    return filteredCards.filter(c => !c.next_review || new Date(c.next_review) <= now);
  }, [filteredCards]);

  const reviewCards = useMemo(() => {
    return reviewMode === 'due' ? dueCards : filteredCards;
  }, [reviewMode, dueCards, filteredCards]);

  const handleNext = useCallback(async (rating?: 'easy' | 'good' | 'hard') => {
    if (rating && user) {
      const card = reviewCards[currentReviewIndex];
      let nextReviewDate = new Date();
      
      if (rating === 'hard') {
        nextReviewDate.setHours(nextReviewDate.getHours() + 24);
      } else if (rating === 'good') {
        nextReviewDate.setDate(nextReviewDate.getDate() + 3);
      } else if (rating === 'easy') {
        nextReviewDate.setDate(nextReviewDate.getDate() + 10);
      }

      // Update in DB
      await supabase
        .from('flashcards')
        .update({ next_review: nextReviewDate.toISOString() })
        .eq('id', card.id);

      // Update local state
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, next_review: nextReviewDate.toISOString() } : c));

      if (rating === 'easy' || rating === 'good') {
        setReviewStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      }
      setReviewStats(prev => ({ ...prev, total: prev.total + 1 }));
    }

    if (currentReviewIndex < reviewCards.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
      setIsFlipped(false);
    } else if (rating) {
      setShowSessionComplete(true);
    }
  }, [currentReviewIndex, reviewCards, user]);

  const handlePrevious = useCallback(() => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentReviewIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReviewing || showSessionComplete) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'Enter') {
        if (isFlipped) {
          handleNext('good');
        } else {
          setIsFlipped(true);
        }
      } else if (e.code === 'Digit1') {
        if (isFlipped) handleNext('hard');
      } else if (e.code === 'Digit2') {
        if (isFlipped) handleNext('good');
      } else if (e.code === 'Digit3') {
        if (isFlipped) handleNext('easy');
      } else if (e.code === 'ArrowLeft') {
        handlePrevious();
      } else if (e.code === 'Escape') {
        setIsReviewing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReviewing, isFlipped, handleNext, handlePrevious, showSessionComplete]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      // Only show loader on initial fetch if we have no cards
      if (cards.length === 0) {
        setIsLoading(true);
      }

      const { data, error } = await supabase
        .from('flashcards')
        .select('id, front, back, subject, next_review')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setCards(data);
      }
      setIsLoading(false);
    };

    fetchCards();
  }, [user, cards.length]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.front || !newCard.back || !newCard.subject || !user) return;
    
    const { data, error } = await supabase
      .from('flashcards')
      .insert([{
        user_id: user.id,
        front: newCard.front,
        back: newCard.back,
        subject: newCard.subject
      }])
      .select();
    
    if (data && !error) {
      setCards([data[0], ...cards]);
      setNewCard({ front: '', back: '', subject: '' });
      setIsAdding(false);
      // Automatically switch to the new subject tab
      setSelectedSubject(data[0].subject);
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const startReview = (mode: 'all' | 'due' = 'due') => {
    const cardsToReview = mode === 'due' ? dueCards : filteredCards;
    if (cardsToReview.length === 0) return;
    setReviewMode(mode);
    setIsReviewing(true);
    setCurrentReviewIndex(0);
    setIsFlipped(false);
    setReviewStats({ correct: 0, total: 0 });
    setShowSessionComplete(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white leading-none">Flashcards</h1>
          <div className="flex items-center gap-3">
            <p className="text-white/95 font-bold uppercase tracking-widest text-[10px]">Memorização tática e revisão ativa</p>
            <div className="h-1 w-1 rounded-full bg-white/50" />
            <span className="text-[#3B82F6] font-black text-[10px] uppercase tracking-widest">{cards.length} Cards</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={14} />
            <input 
              type="text"
              placeholder="Buscar cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold text-white placeholder:text-white/60 focus:outline-none focus:border-[#3B82F6]/50 transition-all"
            />
          </div>
          <button 
            onClick={() => startReview('due')}
            disabled={dueCards.length === 0}
            className="px-6 py-3 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#3B82F6]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed border border-[#3B82F6]/20"
          >
            <Calendar size={14} />
            Revisar Devidos ({dueCards.length})
          </button>
          <button 
            onClick={() => startReview('all')}
            disabled={filteredCards.length === 0}
            className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
          >
            <RotateCcw size={14} />
            Revisar Todos
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
          >
            <Plus size={14} />
            Novo
          </button>
        </div>
      </header>

      {!isReviewing && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                selectedSubject === sub 
                  ? "bg-white text-black border-transparent" 
                  : "bg-transparent text-white/90 border-white/10 hover:border-white/30"
              )}
            >
              {sub}
              {sub !== 'Todos' && (
                <span className="ml-2 opacity-40">
                  {cards.filter(c => c.subject === sub).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#3B82F6]" size={40} />
        </div>
      ) : isReviewing ? (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
          {/* Atmospheric Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3B82F6]/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
          </div>

          <div className="relative w-full max-w-3xl flex flex-col h-full max-h-[800px] space-y-8">
            <AnimatePresence mode="wait">
              {showSessionComplete ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-32 h-32 bg-[#3B82F6]/10 rounded-full flex items-center justify-center text-[#3B82F6] relative z-10">
                      <RotateCcw size={48} />
                    </div>
                    <motion.div 
                      className="absolute inset-0 bg-[#3B82F6]/20 rounded-full blur-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Missão Cumprida</h2>
                    <p className="text-white/100 font-bold uppercase tracking-widest text-xs">Você revisou {reviewStats.total} flashcards</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                      <div className="text-2xl font-black text-white">{Math.round((reviewStats.correct / reviewStats.total) * 100)}%</div>
                      <div className="text-[9px] font-bold text-white/95 uppercase tracking-widest mt-1">Precisão</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                      <div className="text-2xl font-black text-white">{reviewStats.total}</div>
                      <div className="text-[9px] font-bold text-white/95 uppercase tracking-widest mt-1">Cards</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsReviewing(false)}
                    className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all shadow-2xl shadow-white/10"
                  >
                    Voltar ao Painel
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setIsReviewing(false)}
                      className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-white transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                        <ChevronLeft size={14} />
                      </div>
                      Sair
                    </button>
                    
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.4em] mb-1">
                        {selectedSubject}
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#3B82F6]" 
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentReviewIndex + 1) / reviewCards.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-white/95 uppercase tracking-widest">
                          {currentReviewIndex + 1} / {reviewCards.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center gap-2 sm:gap-12">
                    {/* Left Arrow */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                      disabled={currentReviewIndex === 0}
                      className="flex w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/5 items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-0 disabled:cursor-not-allowed border border-white/10 shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div 
                      className="perspective-1000 w-full h-full max-h-[500px] cursor-pointer"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <motion.div 
                        className="relative w-full h-full transition-all duration-700 preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                      >
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl z-20">
                          <div className="absolute top-8 sm:top-12 flex flex-col items-center">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-[#3B82F6]/70">Pergunta</span>
                            <div className="w-8 sm:w-12 h-1 bg-[#3B82F6]/10 mt-2 rounded-full" />
                          </div>
                          <p className="text-xl sm:text-4xl font-bold text-white leading-tight max-w-lg">
                            {reviewCards[currentReviewIndex].front}
                          </p>
                          <div className="absolute bottom-8 sm:bottom-12 flex flex-col items-center gap-4 sm:gap-6">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                              className="px-6 py-3 sm:px-8 sm:py-4 bg-white/5 border border-white/10 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                            >
                              Ver Resposta
                            </button>
                            <div className="flex flex-col items-center gap-2 sm:gap-3 opacity-20">
                              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Ou pressione ESPAÇO</p>
                              <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Back */}
                        <div 
                          className="absolute inset-0 backface-hidden bg-white border border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180 z-10"
                        >
                          <div className="absolute top-8 sm:top-12 flex flex-col items-center">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-[#3B82F6]">Resposta</span>
                            <div className="w-8 sm:w-12 h-1 bg-[#3B82F6]/20 mt-2 rounded-full" />
                          </div>
                          <p className="text-xl sm:text-4xl font-bold text-black leading-tight max-w-lg">
                            {reviewCards[currentReviewIndex].back}
                          </p>
                          <div className="absolute bottom-8 sm:bottom-12 flex flex-col items-center gap-4 sm:gap-6 w-full px-6 sm:px-12">
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-black/50">Como foi seu desempenho?</p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleNext('hard'); }}
                                className="py-3 sm:py-4 bg-red-50 text-red-600 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                              >
                                Difícil
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleNext('good'); }}
                                className="py-3 sm:py-4 bg-zinc-100 text-zinc-900 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all border border-zinc-200"
                              >
                                Bom
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleNext('easy'); }}
                                className="py-3 sm:py-4 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100"
                              >
                                Fácil
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Right Arrow */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      disabled={currentReviewIndex === reviewCards.length - 1}
                      className="flex w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/5 items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-0 disabled:cursor-not-allowed border border-white/10 shrink-0"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-8 text-white text-[9px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">ESPAÇO</kbd> Virar
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">1-3</kbd> Avaliar
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10 text-white/70">ESC</kbd> Sair
                    </div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <FlashcardItem 
                key={card.id} 
                card={card} 
                onDelete={deleteCard} 
              />
            ))}
          </AnimatePresence>
          
          {filteredCards.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
              <p className="text-white/95 font-black uppercase tracking-widest">
                Nenhum card encontrado nesta matéria
              </p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-4 text-[#3B82F6] font-bold uppercase tracking-widest text-[10px] hover:underline"
              >
                Criar Primeiro Card
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-[40px] p-8 sm:p-12 max-w-lg w-full space-y-10 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50" />
              
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Novo Flashcard</h2>
                <p className="text-[10px] font-bold text-white/95 uppercase tracking-[0.2em]">Adicione conteúdo para sua revisão ativa</p>
              </div>

              <form onSubmit={handleAddCard} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em] ml-1">Disciplina</label>
                  <div className="relative group">
                    <input 
                      type="text"
                      value={newCard.subject}
                      onChange={e => setNewCard({...newCard, subject: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-[#3B82F6]/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm font-medium"
                      placeholder="Ex: Direito Constitucional"
                      required
                    />
                    <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                  {subjects.length > 1 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {subjects.filter(s => s !== 'Todos').slice(0, 6).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewCard({...newCard, subject: s})}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                            newCard.subject === s 
                              ? "bg-[#3B82F6] text-white border-transparent" 
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white/60"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em] ml-1">Frente (Pergunta)</label>
                    <div className="relative group">
                      <textarea 
                        value={newCard.front}
                        onChange={e => setNewCard({...newCard, front: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-white focus:outline-none focus:border-[#3B82F6]/50 focus:bg-white/10 transition-all h-32 resize-none placeholder:text-white/10 text-sm font-medium leading-relaxed"
                        placeholder="Qual o conceito de..."
                        required
                      />
                      <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.3em] ml-1">Verso (Resposta)</label>
                    <div className="relative group">
                      <textarea 
                        value={newCard.back}
                        onChange={e => setNewCard({...newCard, back: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-white focus:outline-none focus:border-[#3B82F6]/50 focus:bg-white/10 transition-all h-32 resize-none placeholder:text-white/10 text-sm font-medium leading-relaxed"
                        placeholder="A resposta curta e objetiva..."
                        required
                      />
                      <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-5 bg-white/5 text-white/90 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all shadow-2xl shadow-white/5"
                  >
                    Salvar Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
