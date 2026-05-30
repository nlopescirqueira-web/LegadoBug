import { createClient } from '@supabase/supabase-js';

async function checkTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking questions table structure...');

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching questions:', error);
  } else {
    console.log('Columns in questions table:', Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  }
}

checkTable();
