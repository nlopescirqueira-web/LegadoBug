'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import { useRouter } from 'next/navigation';
import SmartImport from '@/components/SmartImport';
import { supabase } from '@/lib/supabase';
import { Upload, CheckCircle2, XCircle, Loader2, Video, Trash2, ArrowUp, ArrowDown, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface QuestionRow {
  id: string;
  text: string;
  video_url: string | null;
  org: string;
  subject: string | null;
  created_at: string;
}

function BulkVideoUpload() {
  const [orgs, setOrgs] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [allQuestions, setAllQuestions] = useState<QuestionRow[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ index: number; status: 'ok' | 'error' | 'skip'; msg: string }[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showMode, setShowMode] = useState<'pending' | 'all'>('pending');

  const displayQuestions = showMode === 'pending'
    ? allQuestions.filter(q => !q.video_url)
    : allQuestions;

  React.useEffect(() => {
    async function fetchOrgs() {
      setLoadingOrgs(true);
      const { data } = await supabase
        .from('questions')
        .select('org');
      if (data) {
        const unique = [...new Set(data.map((d: { org: string }) => d.org).filter(Boolean))].sort();
        setOrgs(unique);
      }
      setLoadingOrgs(false);
    }
    fetchOrgs();
  }, []);

  const loadQuestions = useCallback(async (org: string) => {
    setSelectedOrg(org);
    setFiles([]);
    setResults([]);
    if (!org) { setAllQuestions([]); return; }
    setLoadingQuestions(true);
    const { data } = await supabase
      .from('questions')
      .select('id, text, video_url, org, subject, created_at')
      .eq('org', org)
      .order('created_at', { ascending: true });
    setAllQuestions(data || []);
    setLoadingQuestions(false);
  }, []);

  const moveQuestion = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= allQuestions.length) return;
    const updated = [...allQuestions];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setAllQuestions(updated);
    setResults([]);
  };

  const handleFiles = (fileList: FileList) => {
    const sorted = Array.from(fileList)
      .filter(f => f.type.startsWith('video/'))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setFiles(sorted);
    setResults([]);
  };

  const handleUploadAll = async () => {
    if (files.length === 0 || displayQuestions.length === 0) return;
    setUploading(true);
    const newResults: typeof results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const question = displayQuestions[i];

      if (!question) {
        newResults.push({ index: i, status: 'skip', msg: `Sem questão correspondente` });
        setResults([...newResults]);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        newResults.push({ index: i, status: 'error', msg: `${file.name} excede 50MB (${(file.size / 1024 / 1024).toFixed(1)}MB)` });
        setResults([...newResults]);
        continue;
      }

      try {
        const ext = file.name.split('.').pop() || 'mp4';
        const path = `${question.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('question-videos')
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('question-videos')
          .getPublicUrl(path);

        const { error: updateError } = await supabase
          .from('questions')
          .update({ video_url: urlData.publicUrl })
          .eq('id', question.id);

        if (updateError) throw updateError;

        newResults.push({ index: i, status: 'ok', msg: `OK` });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        newResults.push({ index: i, status: 'error', msg: message });
      }

      setResults([...newResults]);
    }

    setUploading(false);
    if (selectedOrg) loadQuestions(selectedOrg);
  };

  const successCount = results.filter(r => r.status === 'ok').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalCount = allQuestions.length;
  const withVideo = allQuestions.filter(q => q.video_url).length;
  const withoutVideo = totalCount - withVideo;

  const globalIndex = (q: QuestionRow) => allQuestions.indexOf(q) + 1;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-3">
        <Video size={24} className="text-emerald-400" />
        Upload de Vídeos em Lote
      </h2>
      <p className="text-sm text-white/50">
        Selecione o simulado, arraste os vídeos em ordem e envie. Questões que já têm vídeo são puladas automaticamente para permitir upload em lotes.
      </p>

      {/* Org selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Simulado / Filtro (org)</label>
        {loadingOrgs ? (
          <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 size={14} className="animate-spin" /> Carregando...</div>
        ) : (
          <select
            value={selectedOrg}
            onChange={e => loadQuestions(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">Selecione um simulado...</option>
            {orgs.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        )}
      </div>

      {loadingQuestions && (
        <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 size={14} className="animate-spin" /> Carregando questões...</div>
      )}

      {selectedOrg && !loadingQuestions && allQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/60">{totalCount} questões</span>
              <span className="text-emerald-400">{withVideo} com vídeo</span>
              <span className="text-amber-400">{withoutVideo} sem vídeo</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowMode('pending'); setFiles([]); setResults([]); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showMode === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-white/40 hover:text-white/60 border border-white/10'}`}>
                <EyeOff size={12} /> Só sem vídeo ({withoutVideo})
              </button>
              <button onClick={() => { setShowMode('all'); setFiles([]); setResults([]); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showMode === 'all' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/40 hover:text-white/60 border border-white/10'}`}>
                <Eye size={12} /> Todas ({totalCount})
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
                {showMode === 'pending' ? 'Questões sem vídeo (próximas a receber)' : 'Todas as questões'}
              </h3>
              {showMode === 'all' && <span className="text-[10px] text-amber-400/60">(use setas para reordenar)</span>}
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
              {displayQuestions.map((q, i) => (
                <div key={q.id} className={`flex items-start gap-2 px-3 py-2 rounded-xl border text-xs group ${
                  q.video_url ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'
                }`}>
                  <span className="font-black text-emerald-400/70 w-10 shrink-0 pt-0.5">Q{globalIndex(q)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 line-clamp-2">{q.text}</p>
                    <div className="flex gap-2 mt-1">
                      {q.subject && <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{q.subject}</span>}
                      {q.video_url && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">tem vídeo</span>}
                    </div>
                  </div>
                  {showMode === 'all' && (
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => moveQuestion(allQuestions.indexOf(q), allQuestions.indexOf(q) - 1)} disabled={allQuestions.indexOf(q) === 0}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-20"><ArrowUp size={12} className="text-white/50" /></button>
                      <button onClick={() => moveQuestion(allQuestions.indexOf(q), allQuestions.indexOf(q) + 1)} disabled={allQuestions.indexOf(q) === allQuestions.length - 1}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-20"><ArrowDown size={12} className="text-white/50" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File drop zone */}
          <label className={`flex flex-col items-center justify-center gap-3 w-full py-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            files.length > 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5'
          }`}>
            <Upload size={32} className="text-emerald-400/60" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/60">
              {files.length > 0 ? `${files.length} vídeos selecionados` : 'Arraste ou clique para selecionar os vídeos'}
            </span>
            <span className="text-[10px] text-white/30">Serão mapeados para as {displayQuestions.length} questões {showMode === 'pending' ? 'sem vídeo' : ''} na ordem acima</span>
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) handleFiles(e.target.files); }}
            />
          </label>

          {/* File → Question mapping preview */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.length > displayQuestions.length && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  <AlertTriangle size={14} />
                  <span>{files.length} vídeos, mas só {displayQuestions.length} questões {showMode === 'pending' ? 'sem vídeo' : ''}. Extras serão ignorados.</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Mapeamento: Arquivo → Questão</h3>
                <button onClick={() => { setFiles([]); setResults([]); }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 size={12} /> Limpar
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto space-y-1 pr-2">
                {files.map((file, i) => {
                  const q = displayQuestions[i];
                  const result = results.find(r => r.index === i);
                  const tooLarge = file.size > 50 * 1024 * 1024;
                  return (
                    <div key={i} className={`px-4 py-3 rounded-xl border text-xs transition-all ${
                      result?.status === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10' :
                      result?.status === 'error' || tooLarge ? 'border-red-500/30 bg-red-500/10' :
                      !q ? 'border-amber-500/30 bg-amber-500/5' :
                      'border-white/5 bg-white/[0.02]'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-emerald-400/70 w-10 shrink-0">{q ? `Q${globalIndex(q)}` : '—'}</span>
                        <span className="text-white/70 truncate flex-1">{file.name}</span>
                        <span className="text-white/30 shrink-0">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                        {tooLarge && <span className="text-red-400 font-bold shrink-0">EXCEDE 50MB</span>}
                        {result?.status === 'ok' && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                        {result?.status === 'error' && <XCircle size={14} className="text-red-400 shrink-0" />}
                      </div>
                      {q ? (
                        <div className="mt-1.5 ml-[52px]">
                          <p className="text-white/50 line-clamp-1">{q.text}</p>
                          {q.subject && <span className="text-[9px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded mt-1 inline-block">{q.subject}</span>}
                        </div>
                      ) : (
                        <div className="mt-1.5 ml-[52px] text-amber-400">Sem questão — será ignorado</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upload button */}
              <button
                onClick={handleUploadAll}
                disabled={uploading || files.length === 0}
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 disabled:opacity-30 transition-all flex items-center justify-center gap-3 text-sm"
              >
                {uploading ? (
                  <><Loader2 size={18} className="animate-spin" /> Enviando... ({successCount}/{files.length})</>
                ) : (
                  <><Upload size={18} /> Enviar {Math.min(files.length, displayQuestions.length)} vídeos</>
                )}
              </button>

              {/* Results summary */}
              {results.length > 0 && !uploading && (
                <div className="flex items-center gap-4 text-sm p-4 rounded-xl bg-white/5 border border-white/10">
                  {successCount > 0 && <span className="text-emerald-400 font-bold">{successCount} enviados com sucesso</span>}
                  {errorCount > 0 && <span className="text-red-400 font-bold">{errorCount} erros</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedOrg && !loadingQuestions && allQuestions.length === 0 && (
        <p className="text-white/30 text-sm">Nenhuma questão encontrada para este filtro.</p>
      )}
    </div>
  );
}

export default function BulkPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { refreshTotalQuestions } = useStudy();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading) return null;
  if (!isAdmin) return null;

  return (
    <div className="p-8 md:p-20 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-black mb-8">Gerador de Questões em Massa</h1>
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl">
            <SmartImport onComplete={() => {
              refreshTotalQuestions();
            }} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl">
          <BulkVideoUpload />
        </div>
      </div>
    </div>
  );
}
