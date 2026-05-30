import { createClient } from '@supabase/supabase-js';

async function debugQuestions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking questions from 2013 and 2014...');

  const { data, error } = await supabase
    .from('questions')
    .select('id, year, institution, org')
    .in('year', [2013, 2014]);

  if (error) {
    console.error('Error fetching questions:', error);
  } else {
    console.log(`Found ${data?.length || 0} questions for 2013/2014.`);
    if (data && data.length > 0) {
      console.log('Sample data:', data.slice(0, 5));
      
      const vunespCount = data.filter(q => q.institution === 'VUNESP').length;
      console.log(`Questions with institution 'VUNESP': ${vunespCount}`);
    }
  }
  
  console.log('Checking all unique institutions in DB...');
  const { data: instData } = await supabase.from('questions').select('institution');
  const uniqueInsts = Array.from(new Set(instData?.map(i => i.institution)));
  console.log('Unique institutions:', uniqueInsts);
}

debugQuestions();
