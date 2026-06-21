import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAILS = [
  'victorpedrorb6@gmail.com',
  'pedroxygaming@gmail.com',
  'pedrohribeiro35@gmail.com',
];

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !caller) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!ADMIN_EMAILS.includes(caller.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (userId === caller.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    await supabaseAdmin.from('study_sessions').delete().eq('user_id', userId);
    await supabaseAdmin.from('simulado_attempts').delete().eq('user_id', userId);
    await supabaseAdmin.from('question_responses').delete().eq('user_id', userId);
    await supabaseAdmin.from('question_comments').delete().eq('user_id', userId);
    await supabaseAdmin.from('flashcards').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      return NextResponse.json({ error: 'Data deleted but auth removal failed: ' + deleteAuthError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
