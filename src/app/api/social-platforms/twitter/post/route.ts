import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { TwitterService } from '../../../../../lib/twitter-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, mediaUrl } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get active Twitter connection
    const { data: connection } = await supabase
      .from('user_twitter_connections')
      .select('access_token, profile_name, profile_username, expires_at')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single();

    if (!connection) {
      return NextResponse.json({ 
        error: 'Twitter account not connected' 
      }, { status: 400 });
    }

    // Check token expiration
    if (new Date(connection.expires_at) < new Date()) {
      return NextResponse.json({ 
        error: 'Twitter token expired. Please reconnect.' 
      }, { status: 400 });
    }

    // Post to Twitter
    const twitterService = new TwitterService();
    const result = await twitterService.postTweet(connection.access_token, content, mediaUrl);
    
    if (result.data?.id) {
      return NextResponse.json({ 
        success: true, 
        message: `Posted to Twitter as @${connection.profile_username}`,
        tweetId: result.data.id
      });
    } else {
      return NextResponse.json({ 
        error: 'Twitter posting failed',
        details: result 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Twitter posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post to Twitter' },
      { status: 500 }
    );
  }
} 