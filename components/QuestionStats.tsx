'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

interface QuestionStatsProps {
  questionId: string;
  optionsCount: number;
}

interface ResponseData {
  option_index: number;
  is_correct: boolean;
}

export default function QuestionStats({ questionId, optionsCount }: QuestionStatsProps) {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseData[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log(`[QuestionStats] Fetching stats for question: ${questionId}`);
        const { data, error } = await supabase
          .from('question_responses')
          .select('option_index, is_correct')
          .eq('question_id', questionId);

        if (error) throw error;
        console.log(`[QuestionStats] Received ${data?.length || 0} responses`);
        setResponses(data || []);
      } catch (err) {
        console.error('[QuestionStats] Error fetching question stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Real-time subscription for global stats
    const channel = supabase
      .channel(`stats-${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'question_responses',
          filter: `question_id=eq.${questionId}`
        },
        (payload) => {
          setResponses(current => [...current, payload.new as ResponseData]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  const performanceData = useMemo(() => {
    const correct = responses.filter(r => {
      // Use loose equality approach or cast to handled mixed types from Supabase if necessary
      // but to satisfy TS 5.x we cast to any or use explicit checks that are typed correctly
      const isCorrectValue = r.is_correct as any;
      return isCorrectValue === true || isCorrectValue === 'true' || isCorrectValue === 1;
    }).length;
    const total = responses.length;
    const incorrect = total - correct;
    
    return [
      { name: 'Acertos', value: correct },
      { name: 'Erros', value: incorrect }
    ];
  }, [responses]);

  const optionsData = useMemo(() => {
    const counts = new Array(optionsCount).fill(0);
    responses.forEach(r => {
      const idx = Number(r.option_index);
      if (!isNaN(idx) && idx >= 0 && idx < optionsCount) {
        counts[idx]++;
      }
    });

    return counts.map((count, index) => ({
      name: String.fromCharCode(65 + index),
      quantidade: count,
      percentual: responses.length > 0 ? Math.round((count / responses.length) * 100) : 0
    }));
  }, [responses, optionsCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-white/40 italic">Ainda não há estatísticas globais para esta questão.</p>
        <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Seja o primeiro a responder!</p>
      </div>
    );
  }

  const COLORS = ['#10B981', '#EF4444']; // Emerald for correct, Red for incorrect

  const PERFORMANCE_COLORS = ['#72A6D6', '#E07085']; // Light Blue for Acertos, Pink for Erros
  const BAR_COLORS = ['#004E89', '#CC5A44', '#0000FF', '#5E417A', '#2F9E9D'];

  const totalResponses = responses.length;
  const correctCount = responses.filter(r => {
    const isCorrectValue = r.is_correct as any;
    return isCorrectValue === true || isCorrectValue === 'true' || isCorrectValue === 1;
  }).length;
  const incorrectCount = totalResponses - correctCount;
  const accuracy = totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0;

  return (
    <div className="space-y-6 mt-4 animate-in fade-in duration-700 zoom-in-95">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rendimento Chart */}
        <div className="bg-black rounded-[24px] p-6 border border-white/5 relative group transition-all hover:border-white/10 shadow-2xl">
          <h4 className="text-[11px] font-black text-white/40 uppercase tracking-[2px] mb-6">Rendimento</h4>
          <div className="h-[200px] w-full relative flex flex-col items-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend inside the circle - centered on the pie chart height */}
            <div className="absolute top-[70px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{accuracy}%</span>
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[2px] mt-0.5">Correto</span>
            </div>

            {/* Counts below the circle */}
            <div className="flex justify-center gap-10 mt-2">
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-[#72A6D6]">{correctCount}</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Acertos</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-[#E07085]">{incorrectCount}</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Erros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives Chart */}
        <div className="bg-black rounded-[24px] p-6 border border-white/5 group transition-all hover:border-white/10 shadow-2xl">
          <h4 className="text-[11px] font-black text-white/40 uppercase tracking-[2px] mb-6">Alternativas</h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={optionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false} 
                  tick={{ fill: 'white', fontSize: 11, fontWeight: '900' }}
                  dy={5}
                />
                <YAxis 
                  domain={[0, 80]}
                  ticks={[0, 40, 80]}
                  axisLine={false}
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 'bold' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Bar 
                  dataKey="quantidade" 
                  isAnimationActive={false} 
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                >
                  {optionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
