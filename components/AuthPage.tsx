'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuth();

  const logoUrl = "https://nbmvpsigfqmuipcfanug.supabase.co/storage/v1/object/public/Imagens-Questoes/caveiralogo.png";

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) throw new Error('Nome é obrigatório');
        if (!cpf || cpf.length < 14) throw new Error('CPF válido é obrigatório');
        await register(name, email, password, cpf);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Left side: Information (Dark & Themed) */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#050505] p-16 relative overflow-hidden text-center text-white border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3B82F6]/10 rounded-full blur-[120px]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center max-w-lg"
        >
          <div className="relative w-48 h-48 mb-2 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Image 
              src={logoUrl}
              alt="Legado Militar Logo"
              fill
              className="object-contain"
              priority
              loading="eager"
            />
          </div>
          
          <div className="space-y-0 text-center mb-6">
            <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.8] mb-1">
              LEGADO
            </h2>
            <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.8] text-[#3B82F6]">
              MILITAR
            </h2>
          </div>
          
          <p className="text-white/70 text-lg font-medium leading-tight max-w-md italic mb-10">
            &quot;Aqui você constrói o futuro que poucos têm coragem de buscar.&quot;
          </p>

          <div className="flex items-center gap-4">
            <div className="h-[1px] w-10 bg-white/10" />
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Acesso de Elite</span>
            <div className="h-[1px] w-10 bg-white/10" />
          </div>
        </motion.div>
      </div>

      {/* Right side: Form (Dark Themed to match Internal App) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#080808] relative border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_80%)]" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <div className="relative w-28 h-28 mb-2 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Image 
                src={logoUrl}
                alt="Logo"
                fill
                className="object-contain"
                priority
                loading="eager"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">LEGADO</h1>
              <h1 className="text-3xl font-black tracking-tighter uppercase text-[#3B82F6] leading-none">MILITAR</h1>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none">
                {isLogin ? 'Autenticação' : 'Alistamento'}
              </h1>
              <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em]">
                {isLogin ? 'Protocolo de segurança nível 01' : 'Iniciando registro de nova recruta'}
              </p>
            </div>
            <div className="w-12 h-1 bg-[#3B82F6]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                    <User size={12} className="text-[#3B82F6]" />
                    Nome de Guerra
                  </label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-[#3B82F6] focus:bg-white/[0.08] transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                    <ArrowRight size={12} className="text-[#3B82F6]" />
                    CPF Operacional
                  </label>
                  <input 
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-[#3B82F6] focus:bg-white/[0.08] transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                <Mail size={12} className="text-[#3B82F6]" />
                {isLogin ? 'CPF OU E-MAIL' : 'CÓDIGO (E-MAIL)'}
              </label>
              <input 
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "000.000.000-00" : "exemplo@email.com"}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-[#3B82F6] focus:bg-white/[0.08] transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                  <Lock size={12} className="text-[#3B82F6]" />
                  CHAVE DE ACESSO (SENHA)
                </label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-[#3B82F6] hover:underline uppercase tracking-widest">
                    Recuperar
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-[#3B82F6] focus:bg-white/[0.08] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl"
              >
                <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-[#3B82F6] text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] text-[10px] shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Entrar em Missão' : 'Concluir Alistamento'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black">
              <span className="bg-[#0A0A0A] px-4 text-white/20 tracking-[0.4em]">OU</span>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-white/40 uppercase tracking-widest"
            >
              {isLogin ? 'Novo por aqui? ' : 'Já é operante? '}
              <span className="text-[#3B82F6] font-black hover:underline underline-offset-4">
                {isLogin ? 'Alistar-se' : 'Identificar-se'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
