'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Volume2,
  Shield,
  Trash2,
  ChevronRight,
  Globe,
  Smartphone,
  Info,
  AlertTriangle,
  Users,
  Search,
  Loader2,
  X,
  UserX
} from 'lucide-react';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ProfileEntry {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  role: string | null;
  created_at: string | null;
}

const SettingToggle = ({
  icon: Icon,
  label,
  description,
  value,
  onChange
}: {
  icon: any,
  label: string,
  description: string,
  value: boolean,
  onChange: (v: boolean) => void
}) => (
  <div className="flex items-center justify-between p-4 sm:p-6 bg-[#151619] border border-white/10 rounded-2xl sm:rounded-3xl transition-all hover:border-white/20">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-2xl text-white/80">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-bold text-sm uppercase tracking-tight text-white">{label}</h3>
        <p className="text-xs text-white/80 font-medium">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "w-12 h-6 rounded-full transition-all relative",
        value ? "bg-white" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute top-1 w-4 h-4 rounded-full transition-all",
        value ? "right-1 bg-black" : "left-1 bg-white/40"
      )} />
    </button>
  </div>
);

const SettingLink = ({
  icon: Icon,
  label,
  description,
  onClick,
  danger = false
}: {
  icon: any,
  label: string,
  description: string,
  onClick?: () => void,
  danger?: boolean
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between p-4 sm:p-6 bg-[#151619] border rounded-2xl sm:rounded-3xl transition-all group",
      danger ? "border-red-500/20 hover:bg-red-500/5" : "border-white/10 hover:border-white/20"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        "p-3 rounded-2xl",
        danger ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/80"
      )}>
        <Icon size={22} />
      </div>
      <div className="text-left">
        <h3 className={cn(
          "font-bold text-sm uppercase tracking-tight",
          danger ? "text-red-500" : "text-white"
        )}>{label}</h3>
        <p className="text-xs text-white/80 font-medium">{description}</p>
      </div>
    </div>
    <ChevronRight size={18} className={cn(
      "transition-transform group-hover:translate-x-1",
      danger ? "text-red-500/40" : "text-white/70"
    )} />
  </button>
);

export default function Settings() {
  const { resetData } = useStudy();
  const { isAdmin, user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Admin user management
  const [showUserManager, setShowUserManager] = useState(false);
  const [allUsers, setAllUsers] = useState<ProfileEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<ProfileEntry | null>(null);
  const [deleteStatus, setDeleteStatus] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, photo_url, role, created_at')
        .order('created_at', { ascending: false });
      setAllUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (showUserManager) fetchUsers();
  }, [showUserManager, fetchUsers]);

  const filteredUsers = allUsers.filter(u => {
    if (!userSearch.trim()) return true;
    const search = userSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
  });

  const handleDeleteUser = async (profile: ProfileEntry) => {
    setDeletingUserId(profile.id);
    setDeleteStatus('Removendo dados do usuário...');
    try {
      await supabase.from('study_sessions').delete().eq('user_id', profile.id);
      setDeleteStatus('Sessões de estudo removidas...');

      await supabase.from('simulado_attempts').delete().eq('user_id', profile.id);
      setDeleteStatus('Tentativas de simulado removidas...');

      await supabase.from('question_responses').delete().eq('user_id', profile.id);
      setDeleteStatus('Respostas removidas...');

      await supabase.from('flashcards').delete().eq('user_id', profile.id);
      setDeleteStatus('Flashcards removidos...');

      await supabase.from('profiles').delete().eq('id', profile.id);
      setDeleteStatus('Perfil removido!');

      setAllUsers(prev => prev.filter(u => u.id !== profile.id));
      setConfirmDeleteUser(null);
      setDeleteStatus('');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setDeleteStatus('Erro: ' + (err.message || 'Falha ao excluir'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-12">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2 text-white">Configurações</h1>
        <p className="text-white/90 font-bold uppercase tracking-widest text-[10px]">Personalize sua experiência de combate</p>
      </header>

      <div className="space-y-12">
        {/* Preferências */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-black px-2">Preferências</h2>
          <div className="grid grid-cols-1 gap-4">
            <SettingToggle
              icon={Bell}
              label="Notificações"
              description="Alertas de fim de sessão e lembretes diários"
              value={notifications}
              onChange={setNotifications}
            />
            <SettingToggle
              icon={Volume2}
              label="Sons do Sistema"
              description="Efeitos sonoros durante o uso do cronômetro"
              value={sound}
              onChange={setSound}
            />
          </div>
        </section>

        {/* Sistema */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-black px-2">Sistema</h2>
          <div className="grid grid-cols-1 gap-4">
            <SettingLink
              icon={Globe}
              label="Idioma"
              description="Português (Brasil)"
            />
            <SettingLink
              icon={Shield}
              label="Privacidade"
              description="Gerencie como seus dados são exibidos"
            />
            <SettingLink
              icon={Smartphone}
              label="Dispositivos"
              description="Gerencie sessões ativas em outros aparelhos"
            />
          </div>
        </section>

        {/* Admin: Gerenciar Usuários */}
        {isAdmin && (
          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-black px-2">Administração</h2>
            <div className="grid grid-cols-1 gap-4">
              <SettingLink
                icon={Users}
                label="Gerenciar Usuários"
                description="Visualizar e excluir contas de usuários"
                onClick={() => setShowUserManager(true)}
              />
            </div>
          </section>
        )}

        {/* Zona de Perigo */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#FF0033]/40 font-black px-2">Zona de Perigo</h2>
          <div className="grid grid-cols-1 gap-4">
            <SettingLink
              icon={Trash2}
              label="Resetar Progresso"
              description="Apagar todo o histórico de estudos e ranking"
              danger
              onClick={() => setShowResetConfirm(true)}
            />
          </div>
        </section>

        {/* Sobre */}
        <section className="flex flex-col items-center gap-4 pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/70">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Legado Militar v1.0.4</span>
          </div>
          <p className="text-[9px] text-white/70 font-medium text-center max-w-xs uppercase tracking-tighter">
            Desenvolvido para a elite dos estudantes. Mantenha a disciplina, o resultado virá.
          </p>
        </section>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] border border-[#FF0033]/20 rounded-[40px] p-10 max-w-md w-full text-center space-y-8 shadow-2xl"
          >
            <div className="w-20 h-20 bg-[#FF0033]/10 text-[#FF0033] rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Operação Irreversível</h2>
              <p className="text-white/90 text-sm font-medium">
                Você está prestes a apagar todo o seu progresso, medalhas e posição no ranking. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleReset}
                className="w-full bg-[#FF0033] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-[#FF0033]/90 transition-all"
              >
                Confirmar Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full bg-white/5 text-white/80 font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-white/10 transition-all"
              >
                Abortar Missão
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin: User Manager Modal */}
      <AnimatePresence>
        {showUserManager && isAdmin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Users size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tighter text-white">Gerenciar Usuários</h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{allUsers.length} usuários cadastrados</p>
                  </div>
                </div>
                <button onClick={() => { setShowUserManager(false); setUserSearch(''); }} className="p-2 text-white/40 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-white/5 shrink-0">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Buscar por nome ou email..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              {/* User List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-white/30" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-white/30 text-sm py-12">Nenhum usuário encontrado.</p>
                ) : (
                  filteredUsers.map(profile => {
                    const isSelf = profile.id === user?.id;
                    const isProfileAdmin = profile.role === 'admin';
                    return (
                      <div key={profile.id} className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        isSelf ? "bg-[#3B82F6]/5 border-[#3B82F6]/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      )}>
                        <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                          {profile.photo_url ? (
                            <Image src={profile.photo_url} alt={profile.name || ''} fill className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xs font-bold text-white/40">{(profile.name || '?').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">{profile.name || 'Sem nome'}</p>
                            {isProfileAdmin && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Admin</span>
                            )}
                            {isSelf && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">Você</span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/40 truncate">{profile.email || 'Sem email'}</p>
                        </div>
                        {!isSelf && (
                          <button
                            onClick={() => setConfirmDeleteUser(profile)}
                            disabled={deletingUserId === profile.id}
                            className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0 disabled:opacity-50"
                            title="Excluir usuário"
                          >
                            {deletingUserId === profile.id ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete User Modal */}
      <AnimatePresence>
        {confirmDeleteUser && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-[#FF0033]/20 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-[#FF0033]/10 text-[#FF0033] rounded-full flex items-center justify-center mx-auto">
                <UserX size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">Excluir Conta</h2>
                <p className="text-white/60 text-sm">
                  Tem certeza que deseja excluir a conta de <span className="text-white font-bold">{confirmDeleteUser.name}</span>?
                </p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">{confirmDeleteUser.email}</p>
                <p className="text-xs text-red-400/80 mt-2">
                  Todos os dados serão removidos: sessões de estudo, simulados, respostas, flashcards e perfil.
                </p>
              </div>
              {deleteStatus && (
                <p className="text-[11px] text-amber-400 font-bold animate-pulse">{deleteStatus}</p>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleDeleteUser(confirmDeleteUser)}
                  disabled={!!deletingUserId}
                  className="w-full bg-[#FF0033] text-white font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#FF0033]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingUserId ? <><Loader2 size={16} className="animate-spin" /> Excluindo...</> : 'Confirmar Exclusão'}
                </button>
                <button
                  onClick={() => { setConfirmDeleteUser(null); setDeleteStatus(''); }}
                  disabled={!!deletingUserId}
                  className="w-full bg-white/5 text-white/80 font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
