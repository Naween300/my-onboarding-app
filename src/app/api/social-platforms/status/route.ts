import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get LinkedIn connection
    const { data: linkedinConnection } = await supabase
      .from('user_linkedin_connections')
      .select('profile_name, expires_at, is_active, profile_email')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single();

    // Get Twitter connection
    const { data: twitterConnection } = await supabase
      .from('user_twitter_connections')
      .select('profile_name, profile_username, expires_at, is_active')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single();

    const platforms = [
      {
        platform: 'linkedin',
        connected: !!linkedinConnection && 
                  linkedinConnection.is_active && 
                  new Date(linkedinConnection.expires_at) > new Date(),
        profile_name: linkedinConnection?.profile_name || null,
        profile_email: linkedinConnection?.profile_email || null
      },
      {
        platform: 'twitter',
        connected: !!twitterConnection && 
                  twitterConnection.is_active && 
                  new Date(twitterConnection.expires_at) > new Date(),
        profile_name: twitterConnection?.profile_name || null,
        profile_username: twitterConnection?.profile_username || null
      }
    ];

    return NextResponse.json({ platforms }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ 
      platforms: [{ platform: 'linkedin', connected: false, profile_name: null }]
    });
  }
} 