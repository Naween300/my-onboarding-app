import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ContentGenerator } from '@/lib/content-generation/content-generator';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateKey } = await request.json();

    // Get user's onboarding data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: onboardingData, error } = await supabase
      .from('user_enhanced_onboarding')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('is_completed', true)
      .single();

    if (error || !onboardingData) {
      return NextResponse.json({ 
        error: 'Complete your onboarding first' 
      }, { status: 400 });
    }

    // Generate content
    const contentGenerator = new ContentGenerator();
    const result = await contentGenerator.generateContent(templateKey, onboardingData);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 