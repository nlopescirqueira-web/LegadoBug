import { createClient } from '@supabase/supabase-js';

async function inspect2013() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Inspecting 2013/2014 questions...');

  const { data, error } = await supabase
    .from('questions')
    .select('id, year, institution, org')
    .or('year.eq.2013,year.eq.2014');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data?.length || 0} questions.`);
    data?.forEach(q => {
      console.log(`ID: ${q.id}, Year: ${q.year} (${typeof q.year}), Inst: ${q.institution}, Org: ${q.org}`);
    });
  }
}

inspect2013();
