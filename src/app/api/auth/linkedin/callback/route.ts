import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  console.log('🔥 LinkedIn callback route accessed');
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('LinkedIn callback params:', { 
      hasCode: !!code, 
      state, 
      error,
      fullUrl: request.url
    });

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return NextResponse.redirect(
        new URL('/socials?error=access_denied', request.url)
      );
    }

    if (!code || !state) {
      console.error('Missing required OAuth parameters');
      return NextResponse.redirect(
        new URL('/socials?error=missing_params', request.url)
      );
    }

    // FIX: Correct user ID extraction
    // State format: 'user_user_2yxaJ6FBlSR8qr8uigfkj2Kkb89_1751890029809'
    const stateMatch = state.match(/^user_(user_[a-zA-Z0-9]+)_\d+$/);
    const userId = stateMatch ? stateMatch[1] : null;
    
    console.log('Extracted user ID:', userId);
    console.log('State parsing debug:', { state, stateMatch, userId });

    if (!userId) {
      console.error('Failed to extract user ID from state:', state);
      return NextResponse.redirect(
        new URL('/socials?error=invalid_state', request.url)
      );
    }

    console.log('Processing OAuth for user:', userId);

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('Token exchange result:', { 
      success: !!tokenData.access_token,
      error: tokenData.error 
    });

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    const profile = await profileResponse.json();
    console.log('Profile retrieved:', { 
      name: profile.name, 
      email: profile.email 
    });

    // Store connection in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const { error: dbError } = await supabase
      .from('user_linkedin_connections')
      .upsert({
        clerk_user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        profile_id: profile.sub,
        profile_name: profile.name,
        profile_email: profile.email,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'clerk_user_id' 
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(
        new URL('/socials?error=database_error', request.url)
      );
    }

    console.log('✅ LinkedIn connection saved with correct user ID:', userId);
    
    // Success redirect
    return NextResponse.redirect(
      new URL('/socials?success=linkedin_connected', request.url)
    );

  } catch (error) {
    console.error('❌ LinkedIn callback error:', error);
    return NextResponse.redirect(
      new URL('/socials?error=callback_failed', request.url)
    );
  }
}
