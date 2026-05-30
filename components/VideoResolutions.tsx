'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import QuestionComments from './QuestionComments';

export interface VideoQuestion {
  id: number | string;
  text: string;
  options: string[];
  correctAnswer: number;
  videoUrl: string;
  subject: string;
  year?: number;
  org?: string;
}

export const VIDEO_QUESTIONS: VideoQuestion[] = [];

interface VideoResolutionsProps {
  hideHeader?: boolean;
  selectedSubject?: string;
  dbQuestions?: any[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: string | null;
}

export default function VideoResolutions({ 
  hideHeader = false, 
  selectedSubject = 'Todos',
  dbQuestions = [],
  isAdmin = false,
  onDelete,
  isDeleting = null
}: VideoResolutionsProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, number>>({});
  const [showVideos, setShowVideos] = useState<Record<string | number, boolean>>({});

  const allVideoQuestions = React.useMemo(() => {
    const formattedDb = dbQuestions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      videoUrl: q.videoUrl,
      subject: q.subject,
      year: q.year,
      org: q.org
    })).filter(q => q.videoUrl);
    
    return [...VIDEO_QUESTIONS, ...formattedDb];
  }, [dbQuestions]);

  const filteredQuestions = selectedSubject === 'Todos' 
    ? allVideoQuestions 
    : allVideoQuestions.filter(q => q.subject === selectedSubject);

  const handleSelectOption = (questionId: string | number, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    // Automatically show video after answering
    setShowVideos(prev => ({ ...prev, [questionId]: true }));
  };

  const toggleVideo = (questionId: string | number) => {
    setShowVideos(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <div className={cn("p-4 lg:p-8 max-w-4xl mx-auto space-y-8 pb-32", hideHeader && "pt-0")}>
      {!hideHeader && (
        <header className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Resolução em Vídeo</h2>
          <p className="text-white/50">Pratique com questões selecionadas e assista à correção detalhada em vídeo.</p>
        </header>
      )}

      <div className="space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md border border-[#D4AF37]/20 text-[10px] font-black uppercase tracking-widest">
                    {q.org || 'APMBB'}
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-white/60 rounded-md border border-white/10 text-[10px] font-black uppercase tracking-widest">
                    {q.year || 2026}
                  </span>
                  <span className="px-2 py-1 bg-white/5 text-white/60 rounded-md border border-white/10 text-[10px] font-black uppercase tracking-widest">
                    {q.subject}
                  </span>
                  {isAdmin && typeof q.id === 'string' && (
                    <button
                      onClick={() => onDelete?.(q.id as string)}
                      disabled={isDeleting === q.id}
                      className="ml-auto p-2 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-500 transition-all disabled:opacity-50"
                      title="Excluir Questão"
                    >
                      {isDeleting === q.id ? (
                        <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>

              <p className="text-lg leading-relaxed text-white/90 whitespace-pre-line">
                {q.text}
              </p>

              <div className="space-y-2">
                {q.options.map((option: string, optIdx: number) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  const isCorrect = optIdx === q.correctAnswer;
                  const hasAnswered = selectedAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                        isSelected 
                          ? isCorrect 
                            ? "bg-green-500/10 border-green-500/50 text-green-400" 
                            : "bg-red-500/10 border-red-500/50 text-red-400"
                          : hasAnswered && isCorrect
                            ? "bg-green-500/10 border-green-500/50 text-green-400"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5 hover:border-white/20"
                      )}
                    >
                      <span className="flex-1">{option}</span>
                      {hasAnswered && isCorrect && <CheckCircle2 size={18} className="flex-shrink-0 ml-2" />}
                      {isSelected && !isCorrect && <XCircle size={18} className="flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                <button
                  onClick={() => toggleVideo(q.id)}
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#FFD700] transition-colors w-fit"
                >
                  <PlayCircle size={18} />
                  {showVideos[q.id] ? 'Esconder Resolução' : 'Ver Resolução em Vídeo'}
                  {showVideos[q.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showVideos[q.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                  >
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
                      <iframe
                        width="100%"
                        height="100%"
                        src={q.videoUrl.includes('youtube.com/watch?v=') 
                          ? q.videoUrl.replace('watch?v=', 'embed/') 
                          : q.videoUrl}
                        title={`Resolução da questão ${q.id}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                    
                    <QuestionComments questionId={String(q.id)} />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <PlayCircle size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40">Nenhuma resolução em vídeo encontrada para esta matéria.</p>
        </div>
      )}
      </div>
    </div>
  );
}
