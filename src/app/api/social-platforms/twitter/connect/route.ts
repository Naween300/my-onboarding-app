import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TwitterService } from '@/lib/twitter-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;

    console.log('🐦 Twitter connect request for user:', userId);

    if (!clientId || !redirectUri) {
      console.error('❌ Missing Twitter credentials');
      return NextResponse.json({ 
        error: 'Twitter credentials not configured' 
      }, { status: 500 });
    }

    const twitterService = new TwitterService();
    const authUrl = twitterService.generateAuthUrl(userId);

    console.log('✅ Generated Twitter auth URL');
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('❌ Twitter connection error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Twitter auth URL' },
      { status: 500 }
    );
  }
} 