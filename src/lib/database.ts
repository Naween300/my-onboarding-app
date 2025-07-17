// src/lib/database.ts
import { supabase, OnboardingRecord } from './supabase'
import { OnboardingData } from './types'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

// ✅ Create authenticated Supabase client function
export function createAuthenticatedSupabaseClient(getToken: any) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          // ✅ Get Clerk JWT token for authentication
          const clerkToken = await getToken({ template: 'supabase' })
          
          const headers = new Headers(options?.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          }
          
          return fetch(url, { ...options, headers })
        },
      },
    }
  )
}

export class DatabaseService {
  // ✅ FIXED: Convert OnboardingData to database format with proper validation
  private static transformToDbFormat(data: Partial<OnboardingData>): Partial<OnboardingRecord> {
    // Validate required fields first
    if (!data.business_offering || !data.business_category || !data.business_name || !data.location_type) {
      throw new Error(`Missing required fields: business_offering=${data.business_offering}, business_category=${data.business_category}, business_name=${data.business_name}, location_type=${data.location_type}`);
    }

    return {
      // Step 1: Business Basics
      business_offering: data.business_offering,
      business_category: data.business_category,
      business_name: data.business_name,
      location_type: data.location_type,
      location_details: data.location_details || '',

      // Step 2: Goals & Style
      product_types: data.product_types || [],
      product_sales_channels: data.product_sales_channels || [],
      customer_purchase_pattern: data.customer_purchase_pattern || '',
      product_price_range: data.product_price_range || '',
      service_types: data.service_types || [],
      service_delivery_methods: data.service_delivery_methods || [],
      service_engagement_type: data.service_engagement_type || '',
      service_price_range: data.service_price_range || '',
      primary_focus: data.primary_focus || '',
      products_services_connection: data.products_services_connection || '',

      // Step 3: Market & Brand
      ideal_customers: data.ideal_customers || [],
      customer_biggest_challenge: data.customer_biggest_challenge || '',
      audience_topics: data.audience_topics || [],

      // Step 4: Goals & Brand Identity
      top_goals: data.top_goals || [],
      primary_business_goal: data.primary_business_goal || '',
      brand_personality: data.brand_personality || [],
      differentiators: data.differentiators || [],

      // Step 5: Brand Setup
      logo_url: data.logo_url || '',
      primary_color: data.primary_color || '#3B82F6',
      secondary_color: data.secondary_color || '#EF4444',
      website: data.website || '',
      phone: data.phone || '',
      social_handles: data.social_handles || '',
      current_social_presence: data.current_social_presence || { facebook: 'none', instagram: 'none', linkedin: 'none' },

      // Step 6: Optimization/Settings
      team_size: data.team_size || 'just_me',
      business_age: data.business_age || 'less_1_year',
      project_duration: data.project_duration || 'same_day',
      monthly_budget: data.monthly_budget || 500,
      results_timeline: data.results_timeline || '',

      // Progress/Meta
      onboarding_step: data.onboarding_step || 1,
      is_completed: data.is_completed || false,
      completion_percentage: data.completion_percentage || 0,
      completed_at: data.is_completed ? new Date().toISOString() : '',
      updated_at: new Date().toISOString(),
    };
  }

  private static transformFromDbFormat(data: OnboardingRecord): Partial<OnboardingData> {
    return {
      // Step 1
      business_offering: data.business_offering,
      business_category: data.business_category,
      business_name: data.business_name,
      location_type: data.location_type,
      location_details: data.location_details,

      // Step 2
      product_types: data.product_types,
      product_sales_channels: data.product_sales_channels,
      customer_purchase_pattern: data.customer_purchase_pattern,
      product_price_range: data.product_price_range,
      service_types: data.service_types,
      service_delivery_methods: data.service_delivery_methods,
      service_engagement_type: data.service_engagement_type,
      service_price_range: data.service_price_range,
      primary_focus: data.primary_focus,
      products_services_connection: data.products_services_connection,

      // Step 3
      ideal_customers: data.ideal_customers,
      customer_biggest_challenge: data.customer_biggest_challenge,
      audience_topics: data.audience_topics,

      // Step 4
      top_goals: data.top_goals,
      primary_business_goal: data.primary_business_goal,
      brand_personality: data.brand_personality,
      differentiators: data.differentiators,

      // Step 5
      logo_url: data.logo_url,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      website: data.website,
      phone: data.phone,
      social_handles: data.social_handles,
      current_social_presence: data.current_social_presence,

      // Step 6
      team_size: data.team_size,
      business_age: data.business_age,
      project_duration: data.project_duration,
      monthly_budget: data.monthly_budget,
      results_timeline: data.results_timeline,

      // Progress/Meta
      onboarding_step: data.onboarding_step,
      is_completed: data.is_completed,
      completion_percentage: data.completion_percentage,
      completed_at: data.is_completed ? new Date().toISOString() : '',
      updated_at: new Date().toISOString(),
    };
  }

  // ✅ ENHANCED: Better validation and error handling
  static async saveOnboardingData(
    data: Partial<OnboardingData>, 
    logoFileName?: string
  ): Promise<{ data: OnboardingRecord | null, error: any }> {
    try {
      console.log('💾 Attempting to save onboarding data:', data)
      
      // Validate required fields before transformation
      if (!data.business_offering || !data.business_category || !data.business_name || !data.location_type) {
        const error = new Error(`Missing required fields: business_offering="${data.business_offering}", business_category="${data.business_category}", business_name="${data.business_name}", location_type="${data.location_type}"`);
        console.error('❌ Validation error:', error.message);
        return { data: null, error };
      }
      
      const dbData = this.transformToDbFormat(data)
      
      if (logoFileName) {
        dbData.logo_url = logoFileName
      }

      console.log('📝 Transformed data for database:', dbData)
      
      // Test database connection first
      const { data: testData, error: testError } = await supabase
        .from('onboarding')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        return { data: null, error: testError };
      }
      
      console.log('✅ Database connection test passed');
      
      const { data: result, error } = await supabase
        .from('onboarding')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase insert error:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          dbData // Log the data that failed to insert
        });
        return { data: null, error }
      }

      console.log('✅ Successfully saved onboarding data:', result)
      return { data: result, error: null }
    } catch (err) {
      console.error('❌ Unexpected error in saveOnboardingData:', err)
      return { data: null, error: err }
    }
  }

  static async updateOnboardingData(
    id: string, 
    data: Partial<OnboardingData>,
    logoFileName?: string
  ): Promise<{ data: OnboardingRecord | null, error: any }> {
    try {
      console.log('🔄 Updating onboarding data for ID:', id, 'with data:', data)
      
      const dbData = this.transformToDbFormat(data)
      
      if (logoFileName) {
        dbData.logo_url = logoFileName
      }

      console.log('📝 Transformed update data:', dbData)
      
      const { data: result, error } = await supabase
        .from('onboarding')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating onboarding data:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return { data: null, error }
      }

      console.log('✅ Successfully updated onboarding data:', result)
      return { data: result, error: null }
    } catch (err) {
      console.error('❌ Unexpected error in updateOnboardingData:', err)
      return { data: null, error: err }
    }
  }

  static async saveStepData(
    id: string | null,
    stepData: Partial<OnboardingData>,
    logoFileName?: string
  ): Promise<{ data: OnboardingRecord | null, error: any, isNew: boolean }> {
    console.log('📝 Saving step data - ID:', id, 'Data:', stepData)
    
    try {
      if (id) {
        const result = await this.updateOnboardingData(id, stepData, logoFileName)
        return { ...result, isNew: false }
      } else {
        const result = await this.saveOnboardingData(stepData, logoFileName)
        return { ...result, isNew: true }
      }
    } catch (err) {
      console.error('❌ Error in saveStepData:', err)
      return { data: null, error: err, isNew: false }
    }
  }

  static async getOnboardingData(clerkUserId: string, getToken: any) {
    try {
      // ✅ Use authenticated client instead of default
      const supabase = createAuthenticatedSupabaseClient(getToken);
      
      console.log('📥 Fetching onboarding data for:', clerkUserId);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          onboarding (
            business_name,
            business_type,
            budget,
            timeline,
            brand_colors,
            goals,
            brand_personality
          )
        `)
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (error) {
        // ✅ Enhanced error handling for empty objects
        if (Object.keys(error).length === 0 || !error.message) {
          throw new Error('RLS Policy Violation: Access denied. User may not be properly authenticated or policies are blocking access.');
        }
        throw new Error(error.message);
      }

      return { data: profile, error: null };
    } catch (error: any) {
      console.error('❌ Error fetching onboarding data:', error.message || error);
      return { data: null, error };
    }
  }

  // Enhanced onboarding upsert for new table
  static async saveEnhancedOnboardingData({
    clerk_user_id,
    onboardingData,
    logoFile
  }: {
    clerk_user_id: string,
    onboardingData: any,
    logoFile?: File | null
  }): Promise<{ data: any, error: any }> {
    try {
      let logo_url = onboardingData.logo_url || null;
      // 1. Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${clerk_user_id}_logo.${fileExt}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });
        if (storageError) {
          return { data: null, error: storageError };
        }
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
        logo_url = publicUrlData?.publicUrl || null;
      }
      // 2. Map onboardingData to table columns
      const dbData = {
        clerk_user_id,
        // Step 1
        business_offering: onboardingData.business_offering,
        business_category: onboardingData.business_category,
        business_name: onboardingData.business_name,
        location_type: onboardingData.location_type,
        location_details: onboardingData.location_details,
        // Step 2
        product_types: onboardingData.product_types || null,
        product_sales_channels: onboardingData.product_sales_channels || null,
        customer_purchase_pattern: onboardingData.customer_purchase_pattern || null,
        product_price_range: onboardingData.product_price_range || null,
        service_types: onboardingData.service_types || null,
        service_delivery_methods: onboardingData.service_delivery_methods || null,
        service_engagement_type: onboardingData.service_engagement_type || null,
        service_price_range: onboardingData.service_price_range || null,
        primary_focus: onboardingData.primary_focus || null,
        products_services_connection: onboardingData.products_services_connection || null,
        // Step 3
        ideal_customers: onboardingData.ideal_customers || null,
        customer_biggest_challenge: onboardingData.customer_biggest_challenge || null,
        customer_biggest_challenge_other: onboardingData.customer_biggest_challenge_other || null,
        competitors: onboardingData.competitors || null,
        competitors_skipped: onboardingData.competitors_skipped || false,
        audience_topics: onboardingData.audience_topics || null,
        // Step 4
        top_goals: onboardingData.top_goals || null,
        main_goal: onboardingData.main_goal || null,
        brand_personality: onboardingData.brand_personality || null,
        differentiators: onboardingData.differentiators || null,
        // Step 5
        logo_url,
        brand_colors: onboardingData.brandColors || { primary: '#3B82F6', secondary: '#EF4444' },
        contact_info: onboardingData.contactInfo || { website: '', phone: '', socialHandles: '' },
        social_media_presence: onboardingData.socialMedia || { facebook: 'none', instagram: 'none', linkedin: 'none' },
        // Step 6
        team_size: onboardingData.team_size || null,
        business_age: onboardingData.business_age || null,
        project_duration: onboardingData.project_duration || null,
        budget: onboardingData.budget || 500,
        results_timeline: onboardingData.results_timeline || null,
        // Progress
        onboarding_step: onboardingData.onboarding_step || 1,
        is_completed: onboardingData.is_completed || false,
        completion_percentage: onboardingData.completion_percentage || 0,
        completed_at: onboardingData.is_completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      // 3. Upsert to user_enhanced_onboarding
      const { data, error } = await supabase
        .from('user_enhanced_onboarding')
        .upsert(dbData, { onConflict: 'clerk_user_id' })
        .select()
        .single();
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // ✅ ADD: Database connection test method
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase connection...');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
      console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      
      const { data, error } = await supabase
        .from('onboarding')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }
      
      console.log('✅ Connection test passed. Table accessible.');
      return true;
    } catch (err) {
      console.error('❌ Connection test error:', err);
      return false;
    }
  }

  // Keep the rest of your methods unchanged
  static async getAllOnboardingData(): Promise<{ data: OnboardingRecord[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('onboarding')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all onboarding data:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { data: null, error: err }
    }
  }

  static async deleteOnboardingData(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('onboarding')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting onboarding data:', error)
        return { error }
      }

      return { error: null }
    } catch (err) {
      console.error('Unexpected error:', err)
      return { error: err }
    }
  }
}
