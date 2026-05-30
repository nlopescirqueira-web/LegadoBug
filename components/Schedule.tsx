'use client';

import React from 'react';
import Image from 'next/image';
import { 
  FileText, 
  Download, 
  Calendar, 
  ChevronRight,
  Shield,
  Star,
  Award,
  Zap,
  Lock,
  Edit,
  Trash2,
  Plus,
  Users,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { db, handleFirestoreError, OperationType, auth as firebaseAuth } from '@/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, collection, query, getDocs, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Loader2 } from 'lucide-react';

const schedules = [
  {
    id: 'prf',
    title: 'PRF',
    subtitle: 'POLÍCIA RODOVIÁRIA FEDERAL',
    tag: 'FEDERAL',
    logo: 'https://i.imgur.com/PUKBbto.png',
    downloadUrl: '#'
  },
  {
    id: 'apmbb',
    title: 'APMBB',
    subtitle: 'ACADEMIA DE POLÍCIA MILITAR',
    tag: 'ESTADUAL',
    logo: 'https://i.imgur.com/hPKv5OU.png',
    downloadUrl: '#'
  },
  {
    id: 'pmesp',
    title: 'PMESP',
    subtitle: 'POLÍCIA MILITAR DE SÃO PAULO',
    tag: 'ESTADUAL',
    logo: 'https://i.imgur.com/fuG6VSO.png',
    downloadUrl: '#'
  },
  {
    id: 'pmdf',
    title: 'PMDF',
    subtitle: 'POLÍCIA MILITAR DO DISTRITO FEDERAL',
    tag: 'DISTRITAL',
    logo: 'https://i.imgur.com/lYbJbtu.png',
    downloadUrl: '#'
  },
  {
    id: 'pcto',
    title: 'PCTO',
    subtitle: 'POLÍCIA CIVIL DO TOCANTINS',
    tag: 'ESTADUAL',
    logo: 'https://i.imgur.com/qsk6G1H.png',
    downloadUrl: '#'
  }
];

const ADMIN_EMAILS = ["victorpedrorb6@gmail.com", "pedroxygaming@gmail.com", "pedrohribeiro35@gmail.com"];

interface WeeklyViewProps {
  institution: typeof schedules[0];
  onBack: () => void;
  isAdmin: boolean;
}

function WeeklyView({ institution, onBack, isAdmin }: WeeklyViewProps) {
  const { user } = useAuth();
  const [unlockedWeeks, setUnlockedWeeks] = React.useState<number[]>([1]); // Week 1 unlocked by default
  const [pdfUrls, setPdfUrls] = React.useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWatermarking, setIsWatermarking] = React.useState(false);
  const [editingWeek, setEditingWeek] = React.useState<number | null>(null);
  const [newUrl, setNewUrl] = React.useState("");

  React.useEffect(() => {
    if (!user) return;

    // 1. Listen to Global PDF URLs (Admin controlled)
    const globalDocRef = doc(db, 'schedules', institution.id);
    const unsubscribeGlobal = onSnapshot(globalDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPdfUrls(docSnap.data().pdfUrls || {});
      } else if (isAdmin) {
        setDoc(globalDocRef, { pdfUrls: {} })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `schedules/${institution.id}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schedules/${institution.id}`);
    });

    // 2. Listen to User Progress (Student specific)
    const progressDocRef = doc(db, 'user_progress', user.id, 'institutions', institution.id);
    const unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUnlockedWeeks(docSnap.data().unlockedWeeks || [1]);
      } else {
        // Initialize user progress if not exists
        setDoc(progressDocRef, { unlockedWeeks: [1] })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `user_progress/${user.id}/institutions/${institution.id}`));
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `user_progress/${user.id}/institutions/${institution.id}`);
    });

    return () => {
      unsubscribeGlobal();
      unsubscribeProgress();
    };
  }, [institution.id, user, isAdmin]);

  const handleUpdatePdf = async (week: number) => {
    if (!isAdmin) return;
    const globalDocRef = doc(db, 'schedules', institution.id);
    try {
      await updateDoc(globalDocRef, {
        [`pdfUrls.${week}`]: newUrl
      });
      setEditingWeek(null);
      setNewUrl("");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `schedules/${institution.id}`);
    }
  };

  const handleLock = async (week: number) => {
    if (!isAdmin || week === 1) return;
    const progressDocRef = doc(db, 'user_progress', user!.id, 'institutions', institution.id);
    try {
      await updateDoc(progressDocRef, {
        unlockedWeeks: arrayRemove(week)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `user_progress/${user!.id}/institutions/${institution.id}`);
    }
  };

  const handleUnlock = async (week: number) => {
    if (!isAdmin) return;
    const progressDocRef = doc(db, 'user_progress', user!.id, 'institutions', institution.id);
    try {
      await updateDoc(progressDocRef, {
        unlockedWeeks: arrayUnion(week)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `user_progress/${user!.id}/institutions/${institution.id}`);
    }
  };

  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDownloadUrl = (week: number) => {
    let url = '#';
    // Check Firestore URLs first
    if (pdfUrls[week]) {
      url = pdfUrls[week];
    } else if (institution.id === 'apmbb') {
      // Fallback for hardcoded APMBB
      if (week === 1) url = 'https://ais-dev-y7p4hx76qlg7a4tqiwzp4o-230431341143.us-west2.run.app/pdfs/apmbb_semana_1.pdf';
      if (week === 2) url = 'https://ais-dev-y7p4hx76qlg7a4tqiwzp4o-230431341143.us-west2.run.app/pdfs/apmbb_semana_2.pdf';
      if (week === 3) url = 'https://ais-dev-y7p4hx76qlg7a4tqiwzp4o-230431341143.us-west2.run.app/pdfs/apmbb_semana_3.pdf';
      if (week === 4) url = 'https://ais-dev-y7p4hx76qlg7a4tqiwzp4o-230431341143.us-west2.run.app/pdfs/apmbb_semana_4.pdf';
    }

    if (url !== '#' && url.includes('drive.google.com')) {
      // Convert Google Drive share link to direct download link
      const match = url.match(/\/d\/([^\/]+)/) || url.match(/id=([^&]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  const handleDownload = async (week: number) => {
    const url = getDownloadUrl(week);
    if (url === '#') {
      alert(`O PDF da Semana ${week} para ${institution.title} ainda não foi carregado no sistema.`);
      return;
    }

    if (!user?.cpf) {
      alert('Você precisa cadastrar seu CPF no perfil para baixar os materiais com segurança.');
      return;
    }

    setIsWatermarking(true);
    try {
      const response = await fetch(url, { mode: 'cors' }).catch(() => null);
      
      if (!response || !response.ok) {
        console.warn('CORS error or fetch failed. Falling back to direct link.');
        if (confirm('Aviso de Segurança: Não foi possível aplicar a marca d\'água devido a restrições do servidor de arquivos (CORS). Deseja baixar o arquivo original mesmo assim?')) {
          window.open(url, '_blank');
        }
        return;
      }

      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
      const watermarkText = `${initials}${user.cpf.replace(/\D/g, '')}`;
      
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const fontSize = 32;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const positions = [height * 0.2, height * 0.5, height * 0.8];
        
        positions.forEach(yPos => {
          page.drawText(watermarkText, {
            x: 35,
            y: yPos - textWidth / 2,
            size: fontSize,
            font: font,
            color: rgb(0.8, 0.1, 0.1),
            opacity: 0.12,
            rotate: degrees(90),
          });

          page.drawText(watermarkText, {
            x: width - 35,
            y: yPos - textWidth / 2,
            size: fontSize,
            font: font,
            color: rgb(0.8, 0.1, 0.1),
            opacity: 0.12,
            rotate: degrees(90),
          });
        });
      });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${institution.id}_semana_${week}_${user.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error watermarking PDF:', err);
      window.open(url, '_blank');
    } finally {
      setIsWatermarking(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Tactical Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0D0D0D] border border-white/5 p-8 sm:p-12">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3B82F6]/10 blur-[100px] rounded-full" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="group p-4 bg-white/5 hover:bg-[#3B82F6] rounded-2xl text-white/50 hover:text-black transition-all duration-300 border border-white/10 hover:border-[#3B82F6]"
            >
              <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={24} />
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-6 bg-[#3B82F6]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#3B82F6]">
                  Mission Schedule
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                {institution.title} <span className="text-white/70">Cronograma</span>
              </h2>
              <p className="text-white/90 text-xs font-mono uppercase tracking-[0.2em]">
                {institution.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {isAdmin && (
              <div className="px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl flex items-center gap-2 animate-pulse">
                <Shield size={16} className="text-[#3B82F6]" />
                <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">Acesso Administrativo</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-[10px] font-mono text-white/50 uppercase tracking-widest">
              <span>Progresso</span>
              <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#3B82F6] transition-all duration-1000" 
                  style={{ width: `${(unlockedWeeks.length / weeks.length) * 100}%` }}
                />
              </div>
              <span className="text-white/95">{unlockedWeeks.length}/{weeks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {weeks.map((week) => {
          const isUnlocked = unlockedWeeks.includes(week);
          return (
            <motion.div
              key={week}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: week * 0.05 }}
              whileHover={{ y: -4 }}
              className={cn(
                "group relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden",
                isUnlocked 
                  ? "bg-[#0D0D0D] border-white/10 hover:border-[#3B82F6]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]" 
                  : "bg-black/40 border-white/5 opacity-40 grayscale"
              )}
            >
              {/* Card Background Accents */}
              {isUnlocked && (
                <>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
              )}

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-white/60 group-hover:text-[#3B82F6]/20 transition-colors leading-none mb-1">
                      {week < 10 ? `0${week}` : week}
                    </span>
                    <div className="h-[2px] w-6 bg-[#3B82F6]/40" />
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl border transition-colors",
                    isUnlocked ? "bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]" : "bg-white/5 border-white/10 text-white/10"
                  )}>
                    {isUnlocked ? <Zap size={20} /> : <Lock size={20} />}
                  </div>
                </div>
                
                <div className="space-y-1 mb-8">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Semana {week}</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isUnlocked ? "bg-[#3B82F6] animate-pulse" : "bg-white/10")} />
                    <p className="text-[10px] font-mono text-white/90 uppercase tracking-[0.2em]">
                      {isUnlocked ? "Operação Liberada" : "Acesso Restrito"}
                    </p>
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => handleDownload(week)}
                      disabled={isWatermarking}
                      className="w-full py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#3B82F6] hover:text-black hover:border-[#3B82F6] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isWatermarking ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                      {isWatermarking ? "Processando..." : "Download PDF"}
                    </button>
                    {isAdmin && (
                      <div className="flex gap-2">
                        {week !== 1 && (
                          <button 
                            onClick={() => handleLock(week)}
                            className="flex-1 py-2 border border-red-500/30 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <Lock size={12} />
                            Bloquear
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setEditingWeek(week);
                            setNewUrl(pdfUrls[week] || "");
                          }}
                          className="flex-1 py-2 border border-[#3B82F6]/30 text-[#3B82F6] text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-[#3B82F6]/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit size={12} />
                          Editar PDF
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full py-4 bg-white/5 border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                      <Lock size={16} />
                      Bloqueado
                    </div>
                    <p className="text-[9px] font-mono text-white/80 uppercase tracking-widest text-center">
                      Aguarde a liberação pelo administrador
                    </p>
                    {isAdmin && (
                      <button 
                        onClick={() => handleUnlock(week)}
                        className="w-full py-3 border border-[#3B82F6]/30 text-[#3B82F6] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#3B82F6] hover:text-black hover:border-[#3B82F6] transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Zap size={14} />
                        Liberar (Admin)
                      </button>
                    )}
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setEditingWeek(week);
                          setNewUrl(pdfUrls[week] || "");
                        }}
                        className="w-full py-2 border border-white/10 text-white/70 text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={12} />
                        Vincular PDF (Admin)
                      </button>
                    )}
                  </div>
                )}

                {/* Admin PDF Edit Modal Overlay */}
                <AnimatePresence>
                  {editingWeek === week && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-black/95 p-6 flex flex-col justify-center"
                    >
                      <h4 className="text-sm font-black text-[#3B82F6] uppercase tracking-widest mb-4">Link do PDF - Semana {week}</h4>
                      <input 
                        type="text" 
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://exemplo.com/arquivo.pdf"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs mb-4 focus:border-[#3B82F6] outline-none"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdatePdf(week)}
                          className="flex-1 py-2 bg-[#3B82F6] text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                        >
                          Salvar
                        </button>
                        <button 
                          onClick={() => setEditingWeek(null)}
                          className="flex-1 py-2 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tactical Corner Accents */}
              <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/10" />
              <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/10" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface Student {
  uid: string;
  email: string;
  role: string;
}

function StudentManagement({ onBack }: { onBack: () => void }) {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = React.useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, email, name, role');
        
        if (error) throw error;

        const studentMap = new Map<string, Student>();
        profiles?.forEach((profile) => {
          const email = profile.email || "";
          const isHardcodedAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
          
          if (!isHardcodedAdmin && profile.role !== 'admin') {
            const key = email.toLowerCase() || profile.id;
            if (!studentMap.has(key)) {
              studentMap.set(key, {
                uid: profile.id,
                email: email || profile.name || "Usuário sem e-mail",
                role: profile.role || 'student'
              });
            }
          }
        });
        setStudents(Array.from(studentMap.values()));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching students from Supabase:', err);
        try {
          const q = query(collection(db, 'users'));
          const querySnapshot = await getDocs(q);
          const studentList: Student[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (!ADMIN_EMAILS.some(email => email.toLowerCase() === data.email?.toLowerCase())) {
              studentList.push({
                uid: data.uid || docSnap.id,
                email: data.email || "Usuário sem e-mail",
                role: data.role || 'student'
              });
            }
          });
          setStudents(studentList);
          setIsLoading(false);
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.LIST, 'users');
        }
      }
    };
    fetchStudents();
  }, []);

  const fetchStudentProgress = async (studentUid: string) => {
    const progress: Record<string, number[]> = {};
    for (const inst of schedules) {
      const docRef = doc(db, 'user_progress', studentUid, 'institutions', inst.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        progress[inst.id] = docSnap.data().unlockedWeeks || [1];
      } else {
        progress[inst.id] = [1];
      }
    }
    setStudentProgress(progress);
  };

  const handleToggleWeek = async (studentUid: string, instId: string, week: number, isUnlocked: boolean) => {
    const docRef = doc(db, 'user_progress', studentUid, 'institutions', instId);
    try {
      const currentWeeks = studentProgress[instId] || [];
      const newWeeks = isUnlocked 
        ? currentWeeks.filter(w => w !== week)
        : [...currentWeeks, week];

      await setDoc(docRef, { unlockedWeeks: newWeeks }, { merge: true });
      
      setStudentProgress(prev => ({
        ...prev,
        [instId]: newWeeks
      }));

      setSuccessMsg(`Semana ${week} ${isUnlocked ? 'bloqueada' : 'liberada'} com sucesso!`);
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `user_progress/${studentUid}/institutions/${instId}`);
    }
  };

  const filteredStudents = students.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/5 hover:bg-[#3B82F6] rounded-xl text-white/50 hover:text-black transition-all border border-white/10"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gerenciar Alunos</h2>
        </div>
        <div className="relative w-64 flex flex-col items-end gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input 
              type="text"
              placeholder="Buscar por e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-[#3B82F6] outline-none"
            />
          </div>
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 bg-[#3B82F6]/20 border border-[#3B82F6]/30 px-3 py-1 rounded-lg"
              >
                <p className="text-[9px] font-black text-[#3B82F6] uppercase tracking-widest">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#0D0D0D] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">Lista de Alunos</span>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-white/50 text-xs font-mono uppercase tracking-widest">Carregando...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-white/50 text-xs font-mono uppercase tracking-widest">Nenhum aluno encontrado</div>
            ) : filteredStudents.map(student => (
              <button
                key={student.uid}
                onClick={() => {
                  setSelectedStudent(student);
                  fetchStudentProgress(student.uid);
                }}
                className={cn(
                  "w-full p-4 text-left transition-colors flex items-center justify-between group",
                  selectedStudent?.uid === student.uid ? "bg-[#3B82F6]/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "text-xs font-bold transition-colors",
                    selectedStudent?.uid === student.uid ? "text-[#3B82F6]" : "text-white/95 group-hover:text-white"
                  )}>
                    {student.email}
                  </span>
                  <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">ID: {student.uid.slice(0, 8)}...</span>
                </div>
                <ChevronRight size={14} className={cn(
                  "transition-transform",
                  selectedStudent?.uid === student.uid ? "text-[#3B82F6] translate-x-1" : "text-white/10"
                )} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-3xl p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{selectedStudent.email}</h3>
                  <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Gerenciar progresso individual</p>
                </div>
                <div className="p-3 bg-[#3B82F6]/10 rounded-2xl border border-[#3B82F6]/20">
                  <Users size={20} className="text-[#3B82F6]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schedules.map(inst => (
                  <div key={inst.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Image src={inst.logo} alt={inst.title} width={24} height={24} className="object-contain" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">{inst.title}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                        const isUnlocked = (studentProgress[inst.id] || [1]).includes(week);
                        return (
                          <button
                            key={week}
                            onClick={() => handleToggleWeek(selectedStudent.uid, inst.id, week, isUnlocked)}
                            disabled={week === 1}
                            className={cn(
                              "aspect-square rounded-lg text-[10px] font-bold transition-all flex items-center justify-center border",
                              week === 1 ? "bg-[#3B82F6]/20 border-[#3B82F6]/40 text-[#3B82F6] cursor-not-allowed" :
                              isUnlocked 
                                ? "bg-[#3B82F6] border-[#3B82F6] text-white" 
                                : "bg-white/5 border-white/10 text-white/20 hover:border-white/40"
                            )}
                          >
                            {week}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8">
              <Users size={48} className="text-white/5 mb-4" />
              <p className="text-sm font-mono text-white/50 uppercase tracking-[0.2em]">Selecione um aluno para gerenciar o progresso</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Schedule() {
  const { user: supabaseUser } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = React.useState<typeof schedules[0] | null>(null);
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'schedules' | 'students'>('schedules');
  const isAdmin = !!supabaseUser?.email && ADMIN_EMAILS.some(email => email.toLowerCase() === supabaseUser.email!.toLowerCase());

  React.useEffect(() => {
    if (supabaseUser) {
      const syncUser = async () => {
        try {
          const userDocRef = doc(db, 'users', supabaseUser.id);
          await setDoc(userDocRef, {
            uid: supabaseUser.id,
            email: supabaseUser.email,
            role: isAdmin ? 'admin' : 'student',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error('[Firebase] Error syncing user:', err);
        }
      };
      syncUser();
    }
  }, [supabaseUser, isAdmin]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (fUser) => {
      setFirebaseUser(fUser);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (firebaseUser && supabaseUser && firebaseUser.email?.toLowerCase() !== supabaseUser.email?.toLowerCase()) {
      firebaseAuth.signOut();
    }
  }, [firebaseUser, supabaseUser]);

  const handleAdminLogin = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (error: any) {
      console.error('Firebase Admin Login Error:', error);
      const errorCode = error.code;
      const errorMessage = error.message;
      
      if (errorCode === 'auth/popup-closed-by-user') {
        setAuthError('A janela de login foi fechada antes de completar. Tente novamente.');
      } else if (errorCode === 'auth/blocked-at-popup-manager') {
        setAuthError('O navegador bloqueou o popup. Ative as permissões de popup ou tente outro navegador.');
      } else if (errorCode === 'auth/unauthorized-domain') {
        setAuthError('Este domínio não está autorizado no Firebase. Adicione este domínio nas configurações do Firebase Auth.');
      } else {
        setAuthError(`Erro (${errorCode}): ${errorMessage}`);
      }
    }
  };

  const handleAdminLogout = async () => {
    try {
      await firebaseAuth.signOut();
      setAuthError(null);
    } catch (err) {
      console.error('Error signing out from Firebase:', err);
    }
  };

  const handleSelect = (institution: typeof schedules[0]) => {
    setSelectedInstitution(institution);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-12">
      {isAdmin && (
        <div className={cn(
          "p-4 rounded-2xl flex flex-col gap-4 transition-all duration-300",
          firebaseUser ? "bg-green-500/10 border border-green-500/20" : "bg-[#3B82F6]/10 border border-[#3B82F6]/20"
        )}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield size={20} className={firebaseUser ? "text-green-500" : "text-[#3B82F6]"} />
              <p className={cn(
                "text-xs font-mono uppercase tracking-widest",
                firebaseUser ? "text-green-500" : "text-[#3B82F6]"
              )}>
                {firebaseUser 
                  ? `Modo ADM Ativo: ${firebaseUser.email}` 
                  : "Você é um administrador. Ative o modo de edição para gerenciar PDFs e semanas."}
              </p>
            </div>
            <div className="flex gap-2">
              {!firebaseUser ? (
                <button 
                  onClick={handleAdminLogin}
                  className="px-6 py-2 bg-[#3B82F6] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-colors shrink-0"
                >
                  Ativar Modo ADM
                </button>
              ) : (
                <button 
                  onClick={handleAdminLogout}
                  className="px-6 py-2 bg-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all shrink-0 border border-white/10 hover:border-red-500/50"
                >
                  Sair do Modo ADM
                </button>
              )}
            </div>
          </div>
          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-[10px] font-mono text-red-500 uppercase tracking-wider text-center">
                {authError}
              </p>
            </div>
          )}
          {firebaseUser && firebaseUser.email !== supabaseUser?.email && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-[10px] font-mono text-red-500 uppercase tracking-wider text-center">
                Atenção: E-mail do Firebase ({firebaseUser.email}) diferente do e-mail principal ({supabaseUser?.email}).
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'students' && isAdmin && !!firebaseUser ? (
        <StudentManagement onBack={() => {
          setView('schedules');
          setSelectedInstitution(null);
        }} />
      ) : selectedInstitution ? (
        <WeeklyView 
          institution={selectedInstitution} 
          onBack={() => setSelectedInstitution(null)} 
          isAdmin={isAdmin && !!firebaseUser}
        />
      ) : (
        <>
          <header className="space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <div className="h-[1px] w-8 bg-[#3B82F6]" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#3B82F6]">
                    Semanas Legado Militar
                  </span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                  Cronogramas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#2563EB]">de Elite</span>
                </h1>
              </div>
              
              {isAdmin && !!firebaseUser && (
                <button 
                  onClick={() => setView('students')}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#3B82F6] hover:text-black hover:border-[#3B82F6] transition-all flex items-center gap-3"
                >
                  <Users size={16} />
                  Gerenciar Alunos
                </button>
              )}
            </div>
            <p className="text-white/70 max-w-2xl text-sm font-medium leading-relaxed">
              Acesse o planejamento estratégico definitivo para sua aprovação. 
              Materiais exclusivos desenvolvidos pela mentoria Legado Militar.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {schedules.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleSelect(item)}
                className="group relative bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-[#3B82F6]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-8">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-white/50 tracking-widest uppercase">
                    {item.tag}
                  </span>
                  <Shield size={14} className="text-[#3B82F6]/40 group-hover:text-[#3B82F6] transition-colors" />
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-[#3B82F6]/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image 
                      src={item.logo} 
                      alt={item.title} 
                      fill 
                      priority={index < 2}
                      className="object-contain filter brightness-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-1">
                      {item.title}
                    </h2>
                    <p className="text-[9px] font-mono text-white/60 uppercase tracking-[0.2em] leading-tight max-w-[140px] mx-auto">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                    <span className="text-white/60 font-mono">Status</span>
                    <span className="text-[#3B82F6] font-bold">Disponível</span>
                  </div>
                  <div className="h-[1px] w-full bg-white/5" />
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                    <span className="text-white/60 font-mono">Formato</span>
                    <span className="text-white/80 font-bold italic">PDF HD</span>
                  </div>
                </div>

                <div className="relative">
                  <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:bg-[#3B82F6] group-hover:text-black group-hover:border-[#3B82F6] transition-all duration-300 flex items-center justify-center">
                    Acessar Cronograma
                  </button>
                </div>

                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-10 group-hover:opacity-30 transition-opacity">
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3B82F6]" />
                </div>
              </motion.div>
            ))}
          </div>

          <footer className="flex flex-col items-center gap-6 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-white/10" />
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-[0.8em]">
                Legado Militar © 2024
              </p>
              <div className="h-[1px] w-12 bg-white/10" />
            </div>
            <div className="flex gap-8">
              {[Award, Star, Zap].map((Icon, i) => (
                <Icon key={i} size={18} className="text-white/10" />
              ))}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
