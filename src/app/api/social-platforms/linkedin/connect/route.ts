import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    console.log('🔍 LinkedIn connect request for user:', userId);
    console.log('🔑 Environment check:', { 
      hasClientId: !!clientId, 
      hasRedirectUri: !!redirectUri,
      redirectUri 
    });

    if (!clientId || !redirectUri) {
      console.error('❌ Missing LinkedIn credentials');
      return NextResponse.json({ 
        error: 'LinkedIn credentials not configured' 
      }, { status: 500 });
    }

    // Generate LinkedIn OAuth URL with proper scopes
    const scope = 'openid profile email w_member_social';
    const state = `user_${userId}_${Date.now()}`;
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope
    }).toString()}`;

    console.log('✅ Generated LinkedIn auth URL:', authUrl);
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('❌ LinkedIn connection error:', error);
    return NextResponse.json(
      { error: 'Failed to generate LinkedIn auth URL' },
      { status: 500 }
    );
  }
} 