import { createClient } from '@supabase/supabase-js';

async function forceVunesp() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Forcing Vunesp update...');

  // Update 2013
  const { error: e1 } = await supabase
    .from('questions')
    .update({ institution: 'Vunesp' })
    .eq('year', 2013);
  if (e1) console.error('Error 2013:', e1);
  else console.log('Updated 2013');

  // Update 2014
  const { error: e2 } = await supabase
    .from('questions')
    .update({ institution: 'Vunesp' })
    .eq('year', 2014);
  if (e2) console.error('Error 2014:', e2);
  else console.log('Updated 2014');

  // Update org APMBB
  const { error: e3 } = await supabase
    .from('questions')
    .update({ institution: 'Vunesp' })
    .eq('org', 'APMBB');
  if (e3) console.error('Error APMBB:', e3);
  else console.log('Updated APMBB');

  // Final check
  const { data } = await supabase
    .from('questions')
    .select('id')
    .eq('institution', 'Vunesp');
  
  console.log(`Total questions with institution 'Vunesp': ${data?.length || 0}`);
}

forceVunesp();
