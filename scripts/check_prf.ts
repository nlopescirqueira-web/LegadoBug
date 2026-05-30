import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrf() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, year, institution, org')
    .eq('org', 'PRF');

  if (error) console.error(error);
  console.log(`Found ${data?.length || 0} PRF questions:`);
  data?.forEach(q => console.log(q));
}

checkPrf();
