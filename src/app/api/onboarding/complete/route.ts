import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData = await request.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // STEP 1: Ensure user profile exists
    console.log('🔍 Checking if user profile exists for:', userId);
    
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('clerk_user_id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // User profile doesn't exist, create it
      console.log('📝 Creating user profile for:', userId);
      
      const { error: profileCreateError } = await supabase
        .from('user_profiles')
        .insert({
          clerk_user_id: userId,
          email: onboardingData.userEmail || 'unknown@example.com',
          name: onboardingData.userName || onboardingData.business_name || 'Unknown User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileCreateError) {
        console.error('❌ Failed to create user profile:', profileCreateError);
        return NextResponse.json({ 
          error: 'Failed to create user profile', 
          details: profileCreateError.message 
        }, { status: 500 });
      }
      
      console.log('✅ User profile created successfully');
    } else if (profileCheckError) {
      console.error('❌ Error checking user profile:', profileCheckError);
      return NextResponse.json({ 
        error: 'Database error checking user profile', 
        details: profileCheckError.message 
      }, { status: 500 });
    } else {
      console.log('✅ User profile already exists');
    }

    // STEP 2: Now save onboarding data
    const dbData = {
      clerk_user_id: userId,
      business_name: onboardingData.business_name || onboardingData.businessName,
      business_offering: onboardingData.business_offering || 'products',
      business_category: onboardingData.business_category || onboardingData.businessType,
      location_type: onboardingData.location_type || onboardingData.locationType,
      location_details: onboardingData.location_details || onboardingData.location,
      
      // Arrays
      product_types: Array.isArray(onboardingData.product_types) ? onboardingData.product_types : [],
      service_types: Array.isArray(onboardingData.service_types) ? onboardingData.service_types : [],
      ideal_customers: Array.isArray(onboardingData.ideal_customers) ? onboardingData.ideal_customers : [],
      top_goals: Array.isArray(onboardingData.top_goals) ? onboardingData.top_goals : [],
      brand_personality: Array.isArray(onboardingData.brand_personality) ? onboardingData.brand_personality : [],
      
      // Brand setup
      primary_color: onboardingData.brandColors?.primary,
      secondary_color: onboardingData.brandColors?.secondary,
      website: onboardingData.contactInfo?.website,
      phone: onboardingData.contactInfo?.phone,
      
      // JSONB fields
      social_handles: onboardingData.contactInfo || {},
      current_social_presence: onboardingData.socialMedia || {},
      
      // Optimization settings
      team_size: onboardingData.team_size,
      business_age: onboardingData.business_age,
      project_duration: onboardingData.project_duration,
      monthly_budget: onboardingData.budget,
      results_timeline: onboardingData.results_timeline,
      
      // Progress
      onboarding_step: 6,
      is_completed: true,
      completion_percentage: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: savedData, error: saveError } = await supabase
      .from('user_enhanced_onboarding')
      .upsert(dbData, { onConflict: 'clerk_user_id' })
      .select();

    if (saveError) {
      console.error('❌ Database save failed:', saveError);
      return NextResponse.json({ 
        error: 'Database save failed', 
        details: saveError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: savedData 
    });

  } catch (error: any) {
    console.error('❌ API Route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
} 