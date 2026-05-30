'use client';

import React, { useMemo, useState } from 'react';
import { useStudy } from '@/context/StudyContext';
import { 
  TrendingUp, 
  Calendar,
  Target,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { MOCK_QUESTIONS } from '@/data/questions';

type PeriodId = 'hoje' | '7dias' | '15dias' | 'um_mes' | 'tres_meses' | 'seis_meses' | 'um_ano' | 'personalizado';

export default function Performance() {
  const { questionAnswers } = useStudy();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodId>('um_mes');

  const periods: { id: PeriodId; label: string }[] = [
    { id: 'hoje', label: 'HOJE' },
    { id: '7dias', label: '7 DIAS' },
    { id: '15dias', label: '15 DIAS' },
    { id: 'um_mes', label: 'UM MÊS' },
    { id: 'tres_meses', label: 'TRÊS MESES' },
    { id: 'seis_meses', label: 'SEIS MESES' },
    { id: 'um_ano', label: '1 ANO' },
    { id: 'personalizado', label: 'PERSONALIZADO' },
  ];

  const [dbQuestions, setDbQuestions] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from('questions')
        .select('id, subject, topic, created_at');
      if (data) setDbQuestions(data);
    };
    fetchQuestions();
  }, []);

  const allQuestionsMap = useMemo(() => {
    const map: Record<string, { subject: string; topic: string }> = {};
    // Add mock questions
    MOCK_QUESTIONS.forEach(q => {
      map[q.id] = { subject: q.subject, topic: q.topic };
    });
    // Add db questions
    dbQuestions.forEach(q => {
      map[q.id] = { subject: q.subject, topic: q.topic };
    });
    return map;
  }, [dbQuestions]);

  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const getStartDate = () => {
      switch (selectedPeriod) {
        case 'hoje': return today;
        case '7dias': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '15dias': return new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        case 'um_mes': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        case 'tres_meses': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        case 'seis_meses': return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        case 'um_ano': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        default: return new Date(0); // All time for now
      }
    };

    const startDate = getStartDate();
    return questionAnswers
      .filter(a => new Date(a.timestamp) >= startDate)
      .map(a => ({
        ...a,
        subject: a.subject || allQuestionsMap[a.questionId]?.subject || 'Geral',
        topic: a.topic || allQuestionsMap[a.questionId]?.topic || 'Geral'
      }));
  }, [questionAnswers, selectedPeriod, allQuestionsMap]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, { date: string; acertos: number; erros: number }> = {};
    
    // Fill with last 30 days if 'um_mes'
    if (selectedPeriod === 'um_mes') {
      for (let i = 30; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        dataMap[dateStr] = { date: dateStr, acertos: 0, erros: 0 };
      }
    } else if (selectedPeriod === '7dias') {
      for (let i = 7; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        dataMap[dateStr] = { date: dateStr, acertos: 0, erros: 0 };
      }
    }

    filteredData.forEach(a => {
      const dateStr = new Date(a.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      if (!dataMap[dateStr]) {
        dataMap[dateStr] = { date: dateStr, acertos: 0, erros: 0 };
      }
      if (a.isCorrect) dataMap[dateStr].acertos++;
      else dataMap[dateStr].erros++;
    });

    return Object.values(dataMap);
  }, [filteredData, selectedPeriod]);

  const donutData = useMemo(() => {
    const correct = filteredData.filter(a => a.isCorrect).length;
    const incorrect = filteredData.length - correct;
    
    if (filteredData.length === 0) return [];

    return [
      { name: 'Acertos', value: correct, color: '#3B82F6' },
      { name: 'Erros', value: incorrect, color: '#FF0033' },
    ];
  }, [filteredData]);

  const subjectPerformance = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; incorrect: number }> = {};
    
    filteredData.forEach(a => {
      const subject = a.subject || 'Geral';
      if (!stats[subject]) {
        stats[subject] = { total: 0, correct: 0, incorrect: 0 };
      }
      stats[subject].total++;
      if (a.isCorrect) stats[subject].correct++;
      else stats[subject].incorrect++;
    });

    return Object.entries(stats).map(([subject, data]) => ({
      subject,
      ...data,
      percentage: Math.round((data.correct / data.total) * 100) || 0,
      incorrectPercentage: Math.round((data.incorrect / data.total) * 100) || 0
    })).sort((a, b) => b.total - a.total);
  }, [filteredData]);

  const totalCorrect = filteredData.filter(a => a.isCorrect).length;
  const totalIncorrect = filteredData.length - totalCorrect;
  const totalQuestions = filteredData.length;
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 space-y-8 no-scrollbar overflow-y-auto">
      {/* Period Selector */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar pb-2 border-b border-white/5">
        {periods.map(period => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={cn(
              "text-[10px] font-black tracking-widest whitespace-nowrap px-2 py-1 transition-all relative",
              selectedPeriod === period.id ? "text-white" : "text-white/90 hover:text-white"
            )}
          >
            {period.label}
            {selectedPeriod === period.id && (
              <motion.div 
                layoutId="period-active"
                className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-white"
              />
            )}
          </button>
        ))}
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">ACERTEI x ERREI</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAcertos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorErros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0033" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF0033" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="acertos" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAcertos)" 
                  animationDuration={800}
                />
                <Area 
                  type="monotone" 
                  dataKey="erros" 
                  stroke="#FF0033" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorErros)" 
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Acertos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF0033]" />
              <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Erros</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">TOTAL DO PERÍODO</h3>
          </div>
          <div className="h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ bottom: 20 }}>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={115}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                  animationDuration={800}
                  animationBegin={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-4xl font-black text-white leading-none">{overallAccuracy}%</span>
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest mt-1">Precisão</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-1">Acertos</span>
              <span className="text-2xl font-black text-white">{totalCorrect}</span>
            </div>
            <div className="bg-[#FF0033]/5 border border-[#FF0033]/10 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-[10px] font-black text-[#FF0033] uppercase tracking-widest mb-1">Erros</span>
              <span className="text-2xl font-black text-white">{totalIncorrect}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-white">ANÁLISE DE PERFORMANCE</h3>
        </div>

        <div className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-white/80 uppercase tracking-widest">
            <div className="col-span-6">Disciplina / Assunto</div>
            <div className="col-span-2 text-center">Total</div>
            <div className="col-span-4 text-right">Acertos/Erros</div>
          </div>

          {/* Subject Rows */}
          {subjectPerformance.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <p className="text-sm font-bold text-white/90 uppercase tracking-widest">Nenhuma questão resolvida neste período</p>
            </div>
          ) : (
            subjectPerformance.map((item, idx) => (
              <motion.div 
                key={item.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-12 items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/90 group-hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </div>
                  <span className="text-sm font-black text-white truncate">{item.subject}</span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-sm font-black text-white">{item.total}</span>
                  <span className="text-[8px] font-bold text-white/80 ml-1">(100%)</span>
                </div>

                <div className="col-span-4 space-y-2">
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black">
                    <span className="text-[#3B82F6]">{item.correct}</span>
                    <span className="text-white/80">/</span>
                    <span className="text-[#FF0033]">{item.incorrect}</span>
                    <span className="text-white/95 ml-2">({item.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-[#3B82F6]" 
                      style={{ width: `${item.percentage}%` }}
                    />
                    <div 
                      className="h-full bg-[#FF0033]" 
                      style={{ width: `${item.incorrectPercentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
