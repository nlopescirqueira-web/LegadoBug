'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Send, Trash2, MessageSquare, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  question_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles: {
    name: string;
    photo_url: string | null;
  };
}

interface QuestionCommentsProps {
  questionId: string;
}

export default function QuestionComments({ questionId }: QuestionCommentsProps) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);

  const fetchComments = useCallback(async () => {
    console.log('[Comments] Fetching for question:', questionId);
    try {
      const { data, error: fetchError } = await supabase
        .from('question_comments')
        .select(`
          *,
          profiles:user_id (
            name,
            photo_url
          )
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('[Comments] Fetch error:', fetchError);
        throw fetchError;
      }
      
      console.log('[Comments] Data received:', data?.length || 0, 'comments');
      setComments(data || []);
    } catch (err: any) {
      console.error('[Comments] Exception during fetch:', err);
      setError('Erro ao carregar comentários: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    console.log('[Comments] Component mounted for ID:', questionId);
    fetchComments();

    // Real-time subscription
    const channel = supabase
      .channel(`comments_${questionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_comments',
          filter: `question_id=eq.${questionId}`
        },
        (payload) => {
          console.log('[Comments] Real-time update:', payload.eventType);
          fetchComments();
        }
      )
      .subscribe((status) => {
        console.log('[Comments] Subscription status:', status);
      });

    return () => {
      console.log('[Comments] Unmounting for ID:', questionId);
      supabase.removeChannel(channel);
    };
  }, [questionId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    console.log('[Comments] Submitting comment for user:', user.id);
    setIsSubmitting(true);
    setError(null);
    try {
      const commentData = {
        question_id: questionId,
        user_id: user.id,
        text: newComment.trim()
      };
      
      console.log('[Comments] Payload:', commentData);

      const { error: insertError } = await supabase
        .from('question_comments')
        .insert([commentData]);

      if (insertError) {
        console.error('[Comments] Insert error:', insertError);
        throw insertError;
      }
      
      console.log('[Comments] Insert success');
      setNewComment('');
      setShowList(true); // Open list to show the new comment
      await fetchComments(); // Manually fetch to ensure it shows up even if real-time is slow
    } catch (err: any) {
      console.error('[Comments] Exception during submit:', err);
      setError(err.message || 'Erro ao salvar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('question_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;
      fetchComments(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Erro ao excluir comentário');
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Input Form - Always Visible */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {user ? (
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário, dúvida ou bizú..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]/50 resize-none h-20 transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="absolute right-3 bottom-3 p-2 bg-[#D4AF37] text-black rounded-xl hover:bg-[#B8962E] disabled:opacity-50 disabled:hover:bg-[#D4AF37] transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
          <p className="text-[10px] text-white/70 uppercase tracking-widest">Faça login para comentar</p>
        </div>
      )}

      {/* Comments List Toggle */}
      <button 
        onClick={() => setShowList(!showList)}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white/100 transition-colors w-full group"
      >
        <MessageSquare size={14} className={cn("transition-transform", showList && "text-[#D4AF37]")} />
        Comentários e Bizús ({comments.length})
        <span className="ml-auto text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
          {showList ? 'Esconder' : 'Ver todos'}
        </span>
      </button>

      {/* Comments List */}
      <AnimatePresence>
        {showList && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2 pb-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-white/50 italic text-center py-4">
                  Nenhum comentário ou bizú ainda. Seja o primeiro!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                        {comment.profiles?.photo_url ? (
                            <Image 
                              src={comment.profiles.photo_url} 
                              alt={comment.profiles.name} 
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                              sizes="32px"
                            />
                        ) : (
                          <UserIcon size={14} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#D4AF37]">{comment.profiles?.name || 'Usuário'}</span>
                            <span className="text-[8px] text-white/50 font-mono">
                              {new Date(comment.created_at).toLocaleString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {(isAdmin || user?.id === comment.user_id) && (
                            <button 
                              onClick={() => handleDelete(comment.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500/70 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                          {comment.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
