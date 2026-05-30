import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

/**
 * Interface para os dados do lote
 */
interface BatchInfo {
  year: string;
  org: string;
  institution: string;
}

/**
 * Interface para os arquivos (imagens ou PDFs)
 */
interface FileData {
  data: string;
  mimeType: string;
}

/**
 * Analisa questões usando a API do Gemini.
 * Otimizado para grandes lotes (20+ questões) e múltiplas imagens.
 */
export async function analyzeQuestionsClient(
  rawText: string, 
  filesData: FileData[], 
  batchInfo: BatchInfo
) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.error("[Gemini] API Key is missing or invalid.");
    throw new Error("Chave de API do Gemini não encontrada. Configure a variável NEXT_PUBLIC_GEMINI_API_KEY para habilitar a importação inteligente.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const batchContext = `Contexto do Lote: Ano ${batchInfo.year || 'Não especificado'}, Órgão/Prova: ${batchInfo.org || 'Não especificado'}, Banca: ${batchInfo.institution || 'Não especificada'}.`;
  
  const safeUserInstructions = (rawText || "").trim();
  const instructions = safeUserInstructions ? `Instruções Adicionais: ${safeUserInstructions}` : 'Extraia todas as questões do material fornecido.';

  const systemInstruction = `Você é um sistema especialista em questões de concursos públicos e militares de altíssima precisão. Sua tarefa é converter o conteúdo fornecido (imagens de prints, PDFs ou texto) em um objeto JSON estruturado.

### CONTEXTO DO LOTE
${batchContext}

### REGRAS DE OURO (MANDATÓRIAS)
1. EXTRAÇÃO EXAUSTIVA:
   - Extraia ABSOLUTAMENTE TODAS as questões visíveis ou presentes no conteúdo. Não ignore nenhuma.
   - Mesmo que haja 20, 30 ou 50 questões, extraia todas elas.
2. FIDELIDADE TOTAL:
   - O texto da questão deve ser idêntico ao original.
   - Preserve a formatação básica se houver tabelas ou textos de apoio.
3. ESTRUTURAÇÃO DE DADOS:
   - 'subject' (Disciplina): Identifique a matéria (ex: Português, Direito Constitucional).
   - 'topic' (Assunto): Assunto específico (ex: Crase, Controle de Constitucionalidade).
   - 'institution' (Banca): Se não identificada na imagem, use "${batchInfo.institution || 'Geral'}".
   - 'org' (Órgão): Se não identificada na imagem, use "${batchInfo.org || 'Geral'}". IMPORTANTE: Sempre use a abreviação "PMSP" em vez de "Polícia Militar do Estado de São Paulo".
   - 'correct_index': Índice da resposta correta (0 para A, 1 para B, 2 para C, 3 para D, 4 para E).
4. ATRIBUTOS ADICIONAIS:
   - 'is_outdated': Marque como true se a questão tratar de lei revogada ou fato histórico datado.
   - 'difficulty': Estime a dificuldade (Fácil, Médio, Difícil).
   - 'explanation': Forneça uma breve explicação do porquê a alternativa é a correta.
5. RESPOSTA:
   - Retorne APENAS o JSON no formato de array de objetos.`;

  const prompt = `Analise o material fornecido (imagens/texto) e extraia TODAS as questões, uma por uma. 
${instructions}
Certifique-se de que o JSON esteja completo e não truncado.`;

  const withRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (err: any) {
         lastError = err;
         const msg = (err.message || "").toLowerCase();
         // Erros que valem a pena tentar novamente (Quota, Overloaded, Service Unavailable)
         if (msg.includes('429') || msg.includes('exhausted') || msg.includes('quota') || 
             msg.includes('500') || msg.includes('503') || msg.includes('504') || 
             msg.includes('overloaded') || msg.includes('deadline')) {
           const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
           console.warn(`[Gemini] Erro de rede ou quota. Tentando novamente (${i + 1}/${maxRetries}) em ${Math.round(delay)}ms...`);
           await new Promise(r => setTimeout(r, delay));
           continue;
         }
         throw err;
       }
    }
    throw lastError;
  };

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...filesData.map(f => ({ 
          inlineData: {
            data: f.data.includes(',') ? f.data.split(',')[1] : f.data,
            mimeType: f.mimeType
          }
        })),
        { text: prompt }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["subject", "topic", "text", "option_a", "option_b", "correct_index"],
            properties: {
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              text: { type: Type.STRING },
              option_a: { type: Type.STRING },
              option_b: { type: Type.STRING },
              option_c: { type: Type.STRING },
              option_d: { type: Type.STRING },
              option_e: { type: Type.STRING },
              correct_index: { type: Type.INTEGER },
              year: { type: Type.INTEGER },
              institution: { type: Type.STRING },
              org: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              explanation: { type: Type.STRING },
              video_url: { type: Type.STRING },
              has_image: { type: Type.BOOLEAN },
              is_outdated: { type: Type.BOOLEAN }
            }
          }
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    }));
    
    const responseText = response.text;
    
    if (!responseText) {
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      
      if (finishReason === 'SAFETY') {
        throw new Error("O conteúdo foi bloqueado pelos filtros de segurança da IA. Tente enviar menos arquivos ou verifique se o conteúdo é apropriado.");
      }
      
      if (finishReason === 'RECITATION') {
        throw new Error("O conteúdo foi bloqueado por detecção de direitos autorais. Tente tirar prints mais focados nas questões.");
      }

      throw new Error("A IA não retornou nenhum conteúdo. Isso pode ocorrer por limite de tamanho ou erro interno do Gemini. Tente enviar de 5 em 5 imagens.");
    }
    
    try {
      return JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("[Gemini] Erro de parse JSON:", responseText);
      throw new Error("Falha ao processar o formato de resposta da IA. O lote pode ser muito grande, tente reduzir a quantidade de questões.");
    }
  } catch (e: any) {
    console.error("[Gemini] Erro geral na chamada:", e);
    throw e;
  }
}
