import { createClient } from '@supabase/supabase-js';

async function testCaps() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const id = 'f9fa8b8a-14e3-4c52-bd15-c2e7a95c3e96';
  console.log(`Testing update for ID: ${id}...`);

  const { data: before } = await supabase.from('questions').select('institution').eq('id', id).single();
  console.log('Before:', before);

  const { error } = await supabase
    .from('questions')
    .update({ institution: 'VUNESP' })
    .eq('id', id);

  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update call finished.');
  }

  const { data: after } = await supabase.from('questions').select('institution').eq('id', id).single();
  console.log('After:', after);
}

testCaps();
