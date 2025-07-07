import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { contentId, status } = await request.json();
    
    if (!contentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: contentId and status' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update the content status
    const { error } = await supabase
      .from('daily_content')
      .update({ status })
      .eq('id', contentId);

    if (error) {
      console.error('❌ Error updating content status:', error);
      return NextResponse.json(
        { error: 'Failed to update content status' },
        { status: 500 }
      );
    }

    console.log('✅ Content status updated successfully:', { contentId, status });

    return NextResponse.json({ 
      success: true, 
      message: 'Content status updated successfully' 
    });

  } catch (error) {
    console.error('❌ Error in update-status route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 