'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Sparkles, Check, AlertCircle, Save, FileText, Image as ImageIcon, X, Upload } from 'lucide-react';
import { analyzeQuestionsClient } from '@/lib/gemini';
import { cn } from '@/lib/utils';

export default function SmartImport({ onComplete }: { onComplete: () => void }) {
  const [rawText, setRawText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<{ current: number; total: number } | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [batchYear, setBatchYear] = useState<string>('');
  const [batchOrg, setBatchOrg] = useState<string>('');
  const [batchInstitution, setBatchInstitution] = useState<string>('');
  const [batchTopic, setBatchTopic] = useState<string>('');
  const [batchDifficulty, setBatchDifficulty] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add paste support for screenshots and text
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // If we are already focused on an input or textarea, let the default behavior happen
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const newFiles: File[] = [];
      let pastedText = '';

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const file = new File([blob], `screenshot-${Date.now()}-${i}.png`, { type: blob.type });
            newFiles.push(file);
          }
        } else if (items[i].type === 'text/plain') {
          pastedText = e.clipboardData.getData('text');
        }
      }

      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        console.log(`[SmartImport] Added ${newFiles.length} images from paste.`);
      }

      if (pastedText) {
        setRawText(prev => prev ? prev + '\n' + pastedText : pastedText);
        console.log('[SmartImport] Text pasted from global handler.');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleParse = async () => {
    if (!rawText.trim() && files.length === 0) return;
    setIsParsing(true);
    setParseProgress(null);
    setError(null);

    try {
      let allJsonResults: any[] = [];
      const CHUNK_SIZE = 4; // 4 prints per call is very safe for token limits and response size

      if (files.length > 0) {
        const totalChunks = Math.ceil(files.length / CHUNK_SIZE);
        
        for (let i = 0; i < files.length; i += CHUNK_SIZE) {
          const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
          setParseProgress({ current: chunkIndex, total: totalChunks });
          
          const chunkFiles = files.slice(i, i + CHUNK_SIZE);
          const filesData = await Promise.all(chunkFiles.map(async (file) => ({
            data: await fileToBase64(file),
            mimeType: file.type
          })));

          // Send rawText only on the first chunk to avoid repeated processing of instructions
          const textToProcess = i === 0 ? rawText : "";

          const result = await analyzeQuestionsClient(
            textToProcess, 
            filesData, 
            { year: batchYear, org: batchOrg, institution: batchInstitution }
          );

          if (Array.isArray(result)) {
            allJsonResults = [...allJsonResults, ...result];
          }
          
          console.log(`[SmartImport] Chunk ${chunkIndex}/${totalChunks} processed. Current total: ${allJsonResults.length}`);
        }
      } else if (rawText.trim()) {
        const result = await analyzeQuestionsClient(
          rawText, 
          [], 
          { year: batchYear, org: batchOrg, institution: batchInstitution }
        );
        if (Array.isArray(result)) {
          allJsonResults = result;
        }
      }

      if (allJsonResults.length === 0) {
        throw new Error("Nenhuma questão foi detectada. Verifique se o conteúdo está nítido.");
      }

      setParsedQuestions(allJsonResults.map((q: any) => ({ 
        ...q, 
        image_url: '',
        correct_index: q.correct_index ?? 0
      })));
      console.log(`[SmartImport] Successfully parsed ${allJsonResults.length} questions.`);
    } catch (err: any) {
      console.error('[SmartImport] Error:', err);
      
      let userMessage = err.message || "Erro inesperado";
      
      if (userMessage.includes('429') || userMessage.includes('RESOURCE_EXHAUSTED') || userMessage.includes('quota')) {
        userMessage = "Limite de uso da IA atingido. Aguarde alguns segundos enquanto tentamos gerenciar o volume de dados.";
      }

      setError(`${userMessage}`);
    } finally {
      setIsParsing(false);
      setParseProgress(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const questionsToInsert = parsedQuestions.map((q, idx) => {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean);
        
        if (options.length < 2) {
          throw new Error(`Questão ${idx + 1} possui menos de 2 alternativas. Verifique a extração da IA.`);
        }

        // Robust check for correct index (handles various possible keys from AI)
        let correctIndex = typeof q.correct_index === 'number' ? q.correct_index : 
                          (typeof q.correct_option_index === 'number' ? q.correct_option_index : 
                          (typeof q.answer_index === 'number' ? q.answer_index : null));

        // If still null, try to parse from string if AI returned it as string
        if (correctIndex === null && q.correct_index !== undefined) {
          const parsed = parseInt(q.correct_index);
          if (!isNaN(parsed)) correctIndex = parsed;
        }

        // Final fallback to 0 if absolutely missing, but log a warning
        if (correctIndex === null) {
          console.warn(`[SmartImport] Question ${idx + 1} missing correct index. Defaulting to 0.`);
          correctIndex = 0;
        }

        const rawOrg = batchOrg || q.org || 'PMESP';
        const org = rawOrg.toLowerCase().includes('polícia militar do estado de são paulo') ? 'PMSP' : rawOrg;
        
        return {
          subject: q.subject || 'Geral',
          topic: batchTopic || q.topic || '',
          subtopic: q.subtopic || '',
          text: q.text || '',
          options: options,
          correct_option_index: correctIndex,
          year: batchYear ? parseInt(batchYear) : (q.year || new Date().getFullYear()),
          institution: batchInstitution || q.institution || 'VUNESP',
          org: org,
          difficulty: batchDifficulty || q.difficulty || 'Médio',
          explanation: q.explanation || '',
          is_unpublished: false,
          image_url: q.image_url || '',
          video_url: q.video_url || q.videoUrl || '',
          is_outdated: !!q.is_outdated
        };
      });

      console.log('Questions to insert:', questionsToInsert);

      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        throw insertError;
      }
      
      setSuccess(`${questionsToInsert.length} questões importadas com sucesso para ${batchOrg || 'PRF'} (${batchYear || 'Atual'})!`);
      setParsedQuestions([]);
      setRawText('');
      setFiles([]);
      
      // Delay completion to show success message
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestionImage = (index: number, url: string) => {
    setParsedQuestions(prev => prev.map((q, i) => i === index ? { ...q, image_url: url } : q));
  };

  const updateQuestionTopic = (index: number, topic: string) => {
    setParsedQuestions(prev => prev.map((q, i) => i === index ? { ...q, topic } : q));
  };

  const updateQuestionSubject = (index: number, subject: string) => {
    setParsedQuestions(prev => prev.map((q, i) => i === index ? { ...q, subject } : q));
  };

  const updateQuestionDetailed = (index: number, field: string, value: any) => {
    setParsedQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const removeParsedQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Importação e Geração com IA</h3>
            <p className="text-sm text-white/70">Envie PDFs, imagens ou peça para a IA gerar questões inéditas digitando no campo abaixo.</p>
            <div className="mt-2 p-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg">
              <p className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={12} /> Recomendações para Importação em Massa
              </p>
              <p className="text-[10px] text-[#3B82F6]/80 mt-1">
                • <b>Fluxo de Alta Performance:</b> A IA está otimizada para processar entre 15 e 30 questões por vez com máxima velocidade e precisão.<br />
                • <b>Resiliência:</b> Implementamos retentativas automáticas e buffers de segurança para lidar com grandes volumes de dados.<br />
                • <b>Dica:</b> Se estiver copiando texto, tente manter o formato original. A IA detecta Disciplina e Assunto automaticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Ano (Lote)</label>
            <input 
              type="number"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              placeholder="Ex: 2024"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-white/20 text-xs"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Banca (Lote)</label>
            <input 
              type="text"
              value={batchInstitution}
              onChange={(e) => setBatchInstitution(e.target.value)}
              placeholder="Ex: VUNESP, CESPE"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-white/20 text-xs"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Órgão (Lote)</label>
            <input 
              type="text"
              value={batchOrg}
              onChange={(e) => setBatchOrg(e.target.value)}
              placeholder="Ex: PRF, PMDF"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-white/20 text-xs"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Assunto (Lote - Opcional)</label>
            <input 
              type="text"
              value={batchTopic}
              onChange={(e) => setBatchTopic(e.target.value)}
              placeholder="Vazio = Usar da IA"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-white/20 text-xs"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Dificuldade (Lote)</label>
            <select 
              value={batchDifficulty}
              onChange={(e) => setBatchDifficulty(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs appearance-none"
            >
              <option value="">IA Define</option>
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>
          <p className="sm:col-span-2 lg:col-span-4 text-[9px] text-[#3B82F6]/60 font-medium italic">
            * Estes valores serão aplicados a todas as questões deste lote, ignorando o que a IA detectar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2 relative group">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Texto Adicional (Opcional)</label>
              {rawText && (
                <button 
                  onClick={() => setRawText('')}
                  className="text-[9px] text-red-400 font-bold uppercase hover:text-red-300 transition-colors"
                >
                  Limpar Texto
                </button>
              )}
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Cole aqui textos extras ou instruções para a IA..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Arquivos (PDF, Imagens)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6]/50 hover:bg-white/5 cursor-pointer transition-all"
            >
              <Upload className="text-white/50" size={24} />
              <span className="text-xs text-white/60">Clique para selecionar arquivos</span>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                {file.type.includes('pdf') ? <FileText size={14} className="text-red-400" /> : <ImageIcon size={14} className="text-blue-400" />}
                <span className="text-[10px] text-white truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => removeFile(idx)} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={isParsing || (!rawText.trim() && files.length === 0)}
          className="w-full py-3 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3B82F6]/10"
        >
          {isParsing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {parseProgress 
                ? `Processando Parte ${parseProgress.current} de ${parseProgress.total}...` 
                : "Preparando arquivos..."}
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Analisar Provas e Gabaritos
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <Check size={20} />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {parsedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-bold flex items-center gap-2">
              <Check className="text-emerald-500" size={20} />
              {parsedQuestions.length} Questões Extraídas
            </h4>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Todas no Banco
            </button>
          </div>

          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {parsedQuestions.map((q, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative group">
                      <input 
                        type="text"
                        value={q.subject}
                        onChange={(e) => updateQuestionSubject(idx, e.target.value)}
                        className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-1 rounded uppercase tracking-wider border border-amber-500/30 hover:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 w-28 bg-transparent outline-none transition-all"
                        placeholder="DISCIPLINA"
                        title="Clique para editar a Disciplina"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 hover:border-emerald-500/60 transition-all">
                      <span>Assunto:</span>
                      <input 
                        type="text"
                        value={q.topic || ''}
                        onChange={(e) => updateQuestionTopic(idx, e.target.value)}
                        className="bg-transparent border-none focus:ring-0 min-w-[120px] px-1 outline-none text-emerald-300 placeholder:text-emerald-500/50"
                        placeholder="Digite o assunto..."
                        title="Clique para editar o Assunto"
                      />
                    </div>
                    <select 
                      value={q.difficulty}
                      onChange={(e) => updateQuestionDetailed(idx, 'difficulty', e.target.value)}
                      className="text-[10px] font-black bg-white/10 text-gray-300 px-2 py-1 rounded uppercase tracking-wider border border-white/10 hover:border-white/30 transition-all bg-zinc-900 border-none outline-none focus:ring-0"
                    >
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                    
                    <input 
                      type="number"
                      value={batchYear || q.year}
                      onChange={(e) => updateQuestionDetailed(idx, 'year', e.target.value)}
                      disabled={!!batchYear}
                      className="text-[10px] font-black bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider w-14 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
                      title={batchYear ? "Valor global aplicado" : "Clique para editar o Ano"}
                    />

                    <input 
                      type="text"
                      value={batchInstitution || q.institution}
                      onChange={(e) => updateQuestionDetailed(idx, 'institution', e.target.value)}
                      disabled={!!batchInstitution}
                      className="text-[10px] font-black bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider w-20 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
                      title={batchInstitution ? "Valor global aplicado" : "Clique para editar a Banca"}
                    />

                    <input 
                      type="text"
                      value={batchOrg || q.org}
                      onChange={(e) => updateQuestionDetailed(idx, 'org', e.target.value)}
                      disabled={!!batchOrg}
                      className="text-[10px] font-black bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider w-20 bg-transparent border-none outline-none focus:ring-0 disabled:opacity-50"
                      title={batchOrg ? "Valor global aplicado" : "Clique para editar o Órgão"}
                    />

                    {q.has_image && (
                      <span className="text-[10px] font-black bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon size={10} /> Possui Imagem
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => updateQuestionDetailed(idx, 'is_outdated', !q.is_outdated)}
                      className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider transition-all border",
                        q.is_outdated 
                          ? "bg-red-500/20 text-red-500 border-red-500/30" 
                          : "bg-white/10 text-gray-400 border-white/10 hover:bg-white/20"
                      )}
                    >
                      {q.is_outdated ? 'Desatualizada' : 'Normal'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-emerald-500 font-bold">Gabarito: {String.fromCharCode(65 + q.correct_index)}</span>
                    <button 
                      onClick={() => removeParsedQuestion(idx)}
                      className="p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-all"
                      title="Excluir esta questão"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                
                <textarea 
                  value={q.text}
                  onChange={(e) => updateQuestionDetailed(idx, 'text', e.target.value)}
                  className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-[#3B82F6]/30 rounded p-1 text-sm text-white focus:outline-none resize-none transition-all"
                  rows={2}
                />
                
                {q.has_image && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#3B82F6]/60 uppercase tracking-widest">URL da Imagem (Necessário para questões com imagem)</label>
                    <input 
                      type="text"
                      placeholder="Cole o link da imagem aqui..."
                      value={q.image_url}
                      onChange={(e) => updateQuestionImage(idx, e.target.value)}
                      className="w-full bg-black/40 border border-[#3B82F6]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50"
                    />
                  </div>
                )}

                <div className="text-[10px] text-white/60 italic">
                  {q.option_a} | {q.option_b} | {q.option_c} ...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
