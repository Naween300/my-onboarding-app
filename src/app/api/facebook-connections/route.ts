import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { clerk_user_id, page_id, page_name } = await request.json();

    // ✅ Service role key is available on server-side
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Available on server
    );

    const connectionData = {
      clerk_user_id,
      page_id,
      page_name,
      connected_at: new Date().toISOString(),
      is_active: true
    };

    const { data, error } = await supabase
      .from('facebook_connections')
      .insert(connectionData)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userID = request.headers.get('X-User-ID');

    if (!userID) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // ✅ Service role key is available on server-side
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Available on server
    );

    const { data, error } = await supabase
      .from('facebook_connections')
      .select('*')
      .eq('clerk_user_id', userID)
      .eq('is_active', true)
      .order('connected_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 