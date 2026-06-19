import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixScores() {
  console.log('Fetching all finished attempts...');
  const { data: attempts, error: attErr } = await supabase
    .from('simulado_attempts')
    .select('*')
    .not('finished_at', 'is', null);

  if (attErr) { console.error('Error fetching attempts:', attErr); return; }
  if (!attempts || attempts.length === 0) { console.log('No finished attempts found.'); return; }

  console.log(`Found ${attempts.length} finished attempts. Fetching simulados...`);

  const { data: simulados, error: simErr } = await supabase
    .from('simulados')
    .select('id, questions');

  if (simErr) { console.error('Error fetching simulados:', simErr); return; }

  const simMap = new Map((simulados || []).map(s => [s.id, s]));

  const allQuestionIds = new Set<string>();
  for (const sim of (simulados || [])) {
    for (const q of (sim.questions || [])) {
      allQuestionIds.add(q.question_id);
    }
  }

  console.log(`Fetching ${allQuestionIds.size} questions...`);
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, correct_option_index')
    .in('id', [...allQuestionIds]);

  if (qErr) { console.error('Error fetching questions:', qErr); return; }

  const qMap = new Map((questions || []).map(q => [q.id, q.correct_option_index]));

  let fixed = 0;
  for (const attempt of attempts) {
    const sim = simMap.get(attempt.simulado_id);
    if (!sim) { console.log(`  Skipping attempt ${attempt.id}: simulado not found`); continue; }

    const simQuestionIds = (sim.questions || []).map((q: any) => q.question_id);
    const totalQ = simQuestionIds.length;
    const answers = attempt.answers || {};

    let correct = 0;
    for (const qId of simQuestionIds) {
      const userAnswer = answers[qId];
      if (userAnswer !== undefined && userAnswer !== null) {
        const correctIdx = qMap.get(qId);
        if (correctIdx !== undefined && userAnswer === correctIdx) {
          correct++;
        }
      }
    }

    const score = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

    if (score !== attempt.score || correct !== attempt.correct_answers || totalQ !== attempt.total_questions) {
      console.log(`  Fixing attempt ${attempt.id}: ${attempt.correct_answers}/${attempt.total_questions} (${attempt.score}%) → ${correct}/${totalQ} (${score}%)`);
      const { error: upErr } = await supabase
        .from('simulado_attempts')
        .update({ score, correct_answers: correct, total_questions: totalQ })
        .eq('id', attempt.id);
      if (upErr) console.error(`    Error updating:`, upErr);
      else fixed++;
    } else {
      console.log(`  Attempt ${attempt.id}: OK (${correct}/${totalQ} = ${score}%)`);
    }
  }

  console.log(`\nDone! Fixed ${fixed} of ${attempts.length} attempts.`);
}

fixScores().catch(console.error);
