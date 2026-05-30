import { createClient } from '@supabase/supabase-js';

async function fixVunesp() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Starting Vunesp fix...');

  // 1. Update by year (trying both number and string)
  const { count: count1, error: error1 } = await supabase
    .from('questions')
    .update({ institution: 'Vunesp' })
    .or('year.eq.2013,year.eq.2014,year.eq."2013",year.eq."2014"');

  if (error1) console.error('Error updating by year:', error1);
  else console.log(`Updated ${count1} questions by year.`);

  // 2. Update by org APMBB
  const { count: count2, error: error2 } = await supabase
    .from('questions')
    .update({ institution: 'Vunesp' })
    .eq('org', 'APMBB');

  if (error2) console.error('Error updating by org APMBB:', error2);
  else console.log(`Updated ${count2} questions by org APMBB.`);

  // 3. Check results
  const { data: checkData } = await supabase
    .from('questions')
    .select('id, year, institution, org')
    .eq('institution', 'Vunesp');
  
  console.log(`Total questions now with institution 'Vunesp': ${checkData?.length || 0}`);
}

fixVunesp();
