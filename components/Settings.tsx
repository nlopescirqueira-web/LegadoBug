'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Volume2, 
  Shield, 
  Trash2, 
  ChevronRight, 
  Globe,
  Smartphone,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useStudy } from '@/context/StudyContext';
import { cn } from '@/lib/utils';

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
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    console.log('Dados resetados com sucesso!');
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
    </div>
  );
}
