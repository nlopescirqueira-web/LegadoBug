import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePrfVunesp() {
  console.log('Deleting questions with org=PRF and institution=Vunesp/VUNESP...');
  
  // Try both cases for institution
  const { data: vunespData, error: vunespError } = await supabase
    .from('questions')
    .delete()
    .eq('org', 'PRF')
    .eq('institution', 'Vunesp')
    .select();

  const { data: vunespCapsData, error: vunespCapsError } = await supabase
    .from('questions')
    .delete()
    .eq('org', 'PRF')
    .eq('institution', 'VUNESP')
    .select();

  if (vunespError) console.error('Error deleting Vunesp:', vunespError);
  if (vunespCapsError) console.error('Error deleting VUNESP:', vunespCapsError);

  console.log(`Deleted ${vunespData?.length || 0} questions with 'Vunesp'`);
  console.log(`Deleted ${vunespCapsData?.length || 0} questions with 'VUNESP'`);
}

deletePrfVunesp();
