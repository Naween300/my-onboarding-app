import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get active LinkedIn connection
    const { data: connection } = await supabase
      .from('user_linkedin_connections')
      .select('access_token, profile_id, profile_name, expires_at')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single();

    if (!connection) {
      return NextResponse.json({ 
        error: 'LinkedIn account not connected' 
      }, { status: 400 });
    }

    // Check token expiration
    if (new Date(connection.expires_at) < new Date()) {
      return NextResponse.json({ 
        error: 'LinkedIn token expired. Please reconnect.' 
      }, { status: 400 });
    }

    // Post to LinkedIn
    const postData = {
      author: `urn:li:person:${connection.profile_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    
    if (result.id) {
      return NextResponse.json({ 
        success: true, 
        message: `Posted to LinkedIn as ${connection.profile_name}`,
        postId: result.id
      });
    } else {
      return NextResponse.json({ 
        error: 'LinkedIn posting failed',
        details: result 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post to LinkedIn' },
      { status: 500 }
    );
  }
} 