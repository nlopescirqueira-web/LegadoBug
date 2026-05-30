import { createClient } from '@supabase/supabase-js';

async function testOne() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const id = '6354a2d5-da1f-440a-9f62-63f4f548334c';
  console.log(`Testing update for ID: ${id}...`);

  const { data: before } = await supabase.from('questions').select('institution').eq('id', id).single();
  console.log('Before:', before);

  const { error } = await supabase
    .from('questions')
    .update({ institution: 'Vunesp' })
    .eq('id', id);

  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update call finished.');
  }

  const { data: after } = await supabase.from('questions').select('institution').eq('id', id).single();
  console.log('After:', after);
}

testOne();
