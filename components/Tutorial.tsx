'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Play, Info, BookOpen, GraduationCap, Shield, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
}

const TUTORIALS: TutorialVideo[] = [
  {
    id: '1',
    title: 'Como funciona a Plataforma',
    description: 'Um guia completo sobre todas as ferramentas disponíveis para potencializar seus estudos.',
    duration: '05:30',
    thumbnail: 'https://picsum.photos/seed/platform/800/450',
    category: 'Geral'
  },
  {
    id: '2',
    title: 'Como funciona a Mentoria',
    description: 'Entenda como aproveitar ao máximo o acompanhamento dos nossos mentores especialistas.',
    duration: '08:15',
    thumbnail: 'https://picsum.photos/seed/mentorship/800/450',
    category: 'Mentoria'
  },
  {
    id: '3',
    title: 'Otimizando seu Cronograma',
    description: 'Dicas práticas para organizar sua rotina de estudos de forma eficiente.',
    duration: '04:45',
    thumbnail: 'https://picsum.photos/seed/schedule/800/450',
    category: 'Estudos'
  }
];

export default function Tutorial() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3B82F6_0%,transparent_70%)]" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-xs font-bold uppercase tracking-widest"
            >
              <Info size={12} fill="currentColor" />
              Central de Ajuda
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
                Área de <span className="text-[#3B82F6]">Tutorial</span>
              </h1>
              <p className="text-white/40 font-medium text-lg max-w-2xl">
                Aprenda a dominar todas as funcionalidades da plataforma e entenda como nossa mentoria vai te levar à aprovação.
              </p>
            </div>
          </div>
        </header>

        {/* Video Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight">Vídeos Explicativos</h2>
            <div className="flex gap-2">
              {['Todos', 'Geral', 'Mentoria', 'Estudos'].map((cat) => (
                <button 
                  key={cat}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TUTORIALS.map((video, i) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden hover:border-[#3B82F6]/30 transition-all duration-500"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title}
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-md text-[10px] font-black tabular-nums">
                    {video.duration}
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#3B82F6] text-white rounded-md text-[8px] font-black uppercase tracking-widest">
                    {video.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-[#3B82F6] transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-white/40 mt-2 line-clamp-2 font-medium">
                      {video.description}
                    </p>
                  </div>
                  
                  <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    Assistir Agora <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Extra Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Shield size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Suporte ao Aluno</h3>
              <p className="text-white/40 font-medium">
                Caso ainda tenha dúvidas após assistir aos tutoriais, nossa equipe de suporte está pronta para te ajudar através do chat oficial.
              </p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500/20 transition-all">
              Abrir Chamado
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#121212] to-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
              <Zap size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Dicas de Estudo</h3>
              <p className="text-white/40 font-medium">
                Acesse nossa biblioteca de materiais complementares e PDFs exclusivos para acelerar sua jornada militar.
              </p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest border border-[#3B82F6]/20 hover:bg-[#3B82F6]/20 transition-all">
              Ver Materiais
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
