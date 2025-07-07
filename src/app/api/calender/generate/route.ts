import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { ContentCalendarService } from '@/lib/content-calendar-service';
import { StrategyService } from '@/lib/strategies';

async function getUserProfile(userId: string, supabase: any) {
  try {
    console.log('🔍 Fetching user profile for:', userId);
    
    const { data, error } = await supabase
      .from('onboarding')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching onboarding data:', error);
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    if (!data) {
      throw new Error('No onboarding data found for user');
    }

    console.log('✅ Onboarding data found:', {
      business_name: data.business_name,
      business_type: data.business_type,
      customer_type: data.customer_type
    });

    // Transform onboarding data for content generation
    return {
      business_name: data.business_name || 'Your Business',
      business_type: data.business_type || 'technology',
      industry: data.business_type || 'General',
      location: data.location || 'Local Area',
      customer_type: data.customer_type || 'b2c',
      brand_voice: Array.isArray(data.brand_personality) 
        ? data.brand_personality[0] 
        : 'Professional',
      target_audience: data.customer_type === 'b2b' 
        ? 'Business Owners' 
        : 'Consumers',
      goals: Array.isArray(data.goals) ? data.goals : [],
      budget: data.budget || 500,
      timeline: data.timeline || 'steady'
    };
  } catch (error) {
    console.error('❌ Error in getUserProfile:', error);
    // Return fallback data instead of throwing
    return {
      business_name: 'Your Business',
      business_type: 'technology',
      industry: 'General',
      location: 'Local Area',
      customer_type: 'b2c',
      brand_voice: 'Professional',
      target_audience: 'Business Owners',
      goals: [],
      budget: 500,
      timeline: 'steady'
    };
  }
}

export async function POST(request: NextRequest) {
  let userId = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting calendar generation for user:', userId);

    const { month, year } = await request.json();
    console.log('📅 Generating calendar for:', { month, year });

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user strategy
    const strategyService = new StrategyService(supabase);
    const userStrategy = await strategyService.getUserStrategy(userId);
    
    if (!userStrategy) {
      console.error('❌ No strategy found for user:', userId);
      return NextResponse.json({ error: 'No strategy assigned' }, { status: 400 });
    }

    console.log('✅ User strategy found:', userStrategy.assignment.strategy_id);

    // Get user profile from onboarding
    const userProfile = await getUserProfile(userId, supabase);
    console.log('✅ User profile retrieved:', {
      business_name: userProfile.business_name,
      business_type: userProfile.business_type
    });

    // Generate calendar
    const calendarService = new ContentCalendarService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      process.env.OPENAI_API_KEY!
    );

    const calendar = await calendarService.generateMonthlyCalendar(
      userId,
      userStrategy.assignment.strategy_id,
      month,
      year,
      userProfile
    );

    console.log('✅ Calendar generated successfully');
    return NextResponse.json({ success: true, calendar });
  } catch (error: any) {
    console.error('❌ Calendar generation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate calendar', 
        details: error.message,
        userId: userId || 'unknown'
      },
      { status: 500 }
    );
  }
}
