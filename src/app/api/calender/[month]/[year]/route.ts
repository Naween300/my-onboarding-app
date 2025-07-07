import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ month: string; year: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Await params before accessing its properties
    const { month, year } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔍 Fetching calendar for:', { 
      userId, 
      month, 
      year 
    });

    const { data: calendar, error } = await supabase
      .from('content_calendars')
      .select(`
        *,
        daily_content (*)
      `)
      .eq('clerk_user_id', userId)
      .eq('month', parseInt(month))
      .eq('year', parseInt(year))
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('📊 Calendar found:', !!calendar);
    console.log('📝 Daily content count:', calendar?.daily_content?.length || 0);

    return NextResponse.json(calendar);
  } catch (error: any) {
    console.error('❌ Failed to fetch calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar', details: error.message },
      { status: 500 }
    );
  }
} 