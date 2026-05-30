'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Send, Trash2, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

interface Comment {
  id: string;
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: {
    name: string;
  };
}

interface QuestionDiscussionProps {
  questionId: string;
}

export default function QuestionDiscussion({ questionId }: QuestionDiscussionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('question_comments')
        .select(`
          *,
          profiles:user_id (
            name
          )
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[QuestionDiscussion] Select error:', error);
        throw error;
      }
      setComments(data || []);
    } catch (err) {
      console.error('[QuestionDiscussion] Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`discussion-${questionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_comments',
          filter: `question_id=eq.${questionId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, fetchComments]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !inputText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('question_comments')
        .insert([{
          question_id: questionId,
          user_id: user.id,
          text: inputText.trim()
        }]);

      if (error) throw error;
      setInputText('');
    } catch (err) {
      console.error('[QuestionDiscussion] Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    if (deletingId !== commentId) {
      setDeletingId(commentId);
      // Reset confirmation after 5 seconds if not clicked (increased from 3s)
      setTimeout(() => setDeletingId(prev => prev === commentId ? null : prev), 5000);
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('question_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Optimistic update: remove from local state immediately
      setComments(prev => prev.filter(c => c.id !== commentId));
      setDeletingId(null);
    } catch (err) {
      console.error('[QuestionDiscussion] Error deleting comment:', err);
      alert('Erro ao excluir comentário. Tente novamente.');
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Agora';
    if (diff < 3600) return `há ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-2 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70 font-bold text-xs uppercase tracking-widest">
          <MessageSquare size={14} />
          Espaço de Discussão
        </div>
        <span className="text-[10px] font-black text-[#0055FF] uppercase tracking-widest px-2 py-1 bg-[#0055FF]/10 rounded-lg">
          {comments.length} Comentários
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={cn(
                "group bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2 transition-all hover:bg-white/[0.04]",
                c.user_id === user?.id && "border-[#3B82F6]/10 bg-[#3B82F6]/[0.01]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                    <User size={10} className="text-white/70" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    c.user_id === user?.id ? "text-[#3B82F6]" : "text-white/80"
                  )}>
                    {c.profiles?.name || 'Veterano'}
                    {c.user_id === user?.id && " (Você)"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-white/60 uppercase">
                    {formatTime(c.created_at)}
                  </span>
                  {c.user_id === user?.id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isDeleting && deletingId === c.id}
                      className={cn(
                        "transition-all flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border",
                        deletingId === c.id 
                          ? "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse" 
                          : "bg-white/5 border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5"
                      )}
                      title="Excluir meu comentário"
                    >
                      {deletingId === c.id ? (
                        <span className="text-[9px] font-black uppercase tracking-tighter px-1">
                          {isDeleting ? 'Apagando...' : 'Confirmar?'}
                        </span>
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-white/90 leading-relaxed markdown-body">
                <Markdown>{c.text}</Markdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-white/60 italic">Nenhum comentário ainda. Seja o primeiro a participar!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder={user ? "Adicione um comentário..." : "Faça login para comentar"}
            disabled={!user || submitting}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-[#3B82F6]/50 transition-colors disabled:opacity-50"
          />
        </div>
        <button 
          type="submit"
          disabled={!user || !inputText.trim() || submitting}
          className="bg-[#2563EB] hover:bg-[#3B82F6] text-white px-5 rounded-xl transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center min-w-[50px]"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
}
