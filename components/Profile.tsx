'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import { 
  Camera, 
  User, 
  Mail, 
  Save, 
  Loader2, 
  LogOut,
  Shield,
  Award,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const { fetchRanking, getRank, getRankIcon, getRankProgress, allTimeSeconds, formatSeconds, totalStudyTime } = useStudy();
  
  const currentRank = getRank(allTimeSeconds);
  const currentRankIcon = getRankIcon(allTimeSeconds);
  const rankProgress = getRankProgress(allTimeSeconds);

  // Use totalStudyTime to force re-renders for live updates
  const _heartbeat = totalStudyTime;

  const getRankInsignia = (rank: string) => {
    return (
      <div className="relative w-12 h-12">
        <Image 
          src={currentRankIcon} 
          alt={rank} 
          fill 
          priority
          loading="eager"
          className="object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  const [name, setName] = useState(user?.name || '');
  const [cpf, setCpf] = useState(user?.cpf || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync name and cpf state when user data loads
  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    if (user?.cpf) {
      setCpf(user.cpf);
    }
  }, [user?.name, user?.cpf]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setSaveStatus('idle');
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.photo && !photoPreview) return;
    
    // If it's just a preview not saved yet
    if (photoPreview && !user?.photo) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    setIsDeletingPhoto(true);
    try {
      await updateProfile({ photo: null });
      setPhotoFile(null);
      setPhotoPreview(null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao excluir foto.');
      setSaveStatus('error');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');
    try {
      await updateProfile({ 
        name, 
        cpf,
        photo: photoFile
      });
      
      // Force refresh ranking to show new photo/name globally
      await fetchRanking(true);
      
      setSaveStatus('success');
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setErrorMessage(error.message || 'Erro ao salvar alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = name !== user?.name || cpf !== user?.cpf || photoFile !== null;
  const canChangeName = (user?.nameChangesCount || 0) < 1;
  const canChangeCpf = !user?.cpf;

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <header className="mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-[#3B82F6] rounded-full" />
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">Meu Perfil</h1>
        </div>
        <p className="text-[#3B82F6] font-black uppercase tracking-[0.3em] text-[10px] ml-5">Gerencie suas informações de elite</p>
      </header>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent" />
          
          <div className="relative group">
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-[#3B82F6]/20 overflow-hidden bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              {(photoPreview || user?.photo) ? (
                <Image 
                  src={photoPreview || user!.photo!} 
                  alt={user?.name || 'Profile'} 
                  fill 
                  priority
                  loading="eager"
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 640px) 128px, 176px"
                />
              ) : (
                <span className="text-5xl sm:text-7xl font-black text-white/40">{user?.name?.charAt(0).toUpperCase() || 'S'}</span>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-[#3B82F6] text-black rounded-full hover:scale-110 transition-transform"
                >
                  <Camera size={20} />
                </button>
                {(photoPreview || user?.photo) && (
                  <button 
                    onClick={handleDeletePhoto}
                    disabled={isDeletingPhoto}
                    className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {isDeletingPhoto ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="rotate-180" />}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#3B82F6] text-black flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-110 transition-transform z-10"
            >
              <Camera size={20} />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          
          <div className="text-center space-y-3 w-full max-w-xs">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase">{user?.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Mail size={12} className="text-[#3B82F6]" />
                <p className="text-white/90 font-bold text-xs tracking-wider">{user?.email}</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                  {getRankInsignia(currentRank)}
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#3B82F6] font-black uppercase tracking-[0.3em]">{currentRank}</p>
                  <p className="text-[8px] text-white/80 font-bold uppercase tracking-widest">Patente Atual</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest">
                  <span className="text-white/80">Progresso XP</span>
                  <span className="text-[#3B82F6]">{Math.floor(rankProgress.progress)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#3B82F6]"
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[8px] text-white/70 font-bold uppercase tracking-widest">
                  {rankProgress.remainingSeconds ? `${formatSeconds(rankProgress.remainingSeconds)} para a próxima patente` : 'Nível Máximo Atingido'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-6 sm:p-10 space-y-10 shadow-2xl relative overflow-hidden">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-black">Nome de Guerra</label>
                <span className={cn(
                  "text-[8px] uppercase tracking-widest font-bold",
                  canChangeName ? "text-[#3B82F6]/50" : "text-red-500/50"
                )}>
                  {canChangeName ? "Alteração Única Permitida" : "Bloqueado Definitivamente"}
                </span>
              </div>
              <div className={cn("relative group", !canChangeName && "opacity-60")}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#3B82F6] transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    if (!canChangeName) return;
                    setName(e.target.value);
                    setSaveStatus('idle');
                  }}
                  disabled={!canChangeName}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white font-black placeholder:text-white/60 focus:outline-none transition-all text-sm",
                    canChangeName ? "focus:border-[#D4AF37]/50 focus:bg-white/[0.08]" : "cursor-not-allowed"
                  )}
                  placeholder="Seu nome de guerra..."
                />
              </div>
              {!canChangeName && (
                <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-wider px-1">
                  Você já utilizou sua única alteração de nome permitida.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-black">E-mail de Acesso</label>
                <span className="text-[8px] uppercase tracking-widest text-red-500/50 font-bold">Bloqueado para Edição</span>
              </div>
              <div className="relative opacity-40">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white font-black cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-black">CPF</label>
                <span className={cn(
                  "text-[8px] uppercase tracking-widest font-bold",
                  canChangeCpf ? "text-[#3B82F6]/50" : "text-red-500/50"
                )}>
                  {canChangeCpf ? "Necessário para Marca d'água" : "Bloqueado para Edição"}
                </span>
              </div>
              <div className={cn("relative group", !canChangeCpf && "opacity-60")}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-[#3B82F6] transition-colors">
                  <Shield size={18} />
                </div>
                <input 
                  type="text" 
                  value={cpf}
                  onChange={(e) => {
                    if (!canChangeCpf) return;
                    setCpf(formatCPF(e.target.value));
                    setSaveStatus('idle');
                  }}
                  disabled={!canChangeCpf}
                  maxLength={14}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white font-black placeholder:text-white/60 focus:outline-none transition-all text-sm",
                    canChangeCpf ? "focus:border-[#3B82F6]/50 focus:bg-white/[0.08]" : "cursor-not-allowed"
                  )}
                  placeholder="000.000.000-00"
                />
              </div>
              {!canChangeCpf && (
                <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider px-1">
                  O CPF é utilizado para segurança dos seus materiais.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-4">
            <AnimatePresence>
              {saveStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.2em]">Alterações salvas com sucesso!</p>
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl"
                >
                  <p className="text-red-500 text-center font-black text-[10px] uppercase tracking-[0.2em]">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !hasChanges}
                className={cn(
                  "flex-1 rounded-2xl py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all shadow-lg",
                  saveStatus === 'success' 
                    ? "bg-green-500 text-white" 
                    : "bg-[#3B82F6] text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : (saveStatus === 'success' ? null : <Save size={18} />)}
                {saveStatus === 'success' ? 'Missão Cumprida!' : 'Salvar Alterações'}
              </button>
              
              <button 
                onClick={logout}
                className="w-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl py-5 flex items-center justify-center hover:bg-red-500/20 transition-all group"
                title="Sair da Trincheira"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
