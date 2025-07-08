import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔌 Disconnecting LinkedIn for user:', userId);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current connection details for logging
    const { data: currentConnection } = await supabase
      .from('user_linkedin_connections')
      .select('profile_name, profile_email')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single();

    // Mark connection as inactive instead of deleting (for audit trail)
    const { error } = await supabase
      .from('user_linkedin_connections')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Database error during disconnect:', error);
      return NextResponse.json({ 
        error: 'Failed to disconnect LinkedIn account' 
      }, { status: 500 });
    }

    console.log('✅ LinkedIn disconnected successfully:', {
      user: userId,
      profile: currentConnection?.profile_name
    });

    return NextResponse.json({ 
      success: true,
      message: `Disconnected from ${currentConnection?.profile_name || 'LinkedIn'}`
    });

  } catch (error) {
    console.error('❌ LinkedIn disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn account' },
      { status: 500 }
    );
  }
} 