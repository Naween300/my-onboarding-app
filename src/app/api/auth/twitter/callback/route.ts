import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TwitterService } from '@/lib/twitter-service';

export async function GET(request: NextRequest) {
  console.log('🐦 Twitter callback route accessed');
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('Twitter callback params:', { 
      hasCode: !!code, 
      state, 
      error
    });

    if (error) {
      console.error('Twitter OAuth error:', error);
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

    // Extract user ID from state
    const stateParts = state.split('_');
    const timestamp = stateParts.pop();
    const userId = stateParts.join('_');
    
    if (!userId) {
      console.error('Invalid state format:', state);
      return NextResponse.redirect(
        new URL('/socials?error=invalid_state', request.url)
      );
    }

    console.log('Processing OAuth for user:', userId);

    const twitterService = new TwitterService();
    const tokenData = await twitterService.getAccessToken(code);

    console.log('Token exchange result:', { 
      success: !!tokenData.access_token
    });

    if (!tokenData.access_token) {
      throw new Error('No access token received from Twitter');
    }

    // Get user profile
    const profile = await twitterService.getUserProfile(tokenData.access_token);
    console.log('Profile retrieved:', { 
      name: profile.name, 
      username: profile.username 
    });

    // Store connection in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const { error: dbError } = await supabase
      .from('user_twitter_connections')
      .upsert({
        clerk_user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        profile_id: profile.id,
        profile_name: profile.name,
        profile_username: profile.username,
        profile_email: profile.email || null,
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

    console.log('✅ Twitter connection saved successfully');
    
    return NextResponse.redirect(
      new URL('/socials?success=twitter_connected', request.url)
    );

  } catch (error) {
    console.error('❌ Twitter callback error:', error);
    return NextResponse.redirect(
      new URL('/socials?error=callback_failed', request.url)
    );
  }
} 