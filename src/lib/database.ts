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
    if (!data.businessType || !data.businessName) {
      throw new Error(`Missing required fields: businessType=${data.businessType}, businessName=${data.businessName}`);
    }

    return {
      // Step 1: Business Basics (Required fields)
      business_type: data.businessType,
      business_name: data.businessName,
      location_type: data.locationType || 'online',
      location: data.location || '', // Use null instead of undefined
      customer_type: data.customerType || 'b2c',
      
      // Step 2: Goals & Style (Required JSONB fields)
      goals: data.goals || [],
      brand_personality: data.brandPersonality || [],
      social_media_presence: data.socialMediaPresence || {
        facebook: 'none',
        instagram: 'none',
        linkedin: 'none'
      },
      
      // Step 3: Brand Setup (Required fields)
      brand_colors: data.brandColors || {
        primary: '#3B82F6',
        secondary: '#EF4444'
      },
      contact_info: data.contactInfo || undefined, // Use null for optional JSONB
      budget: data.budget || 500,
      timeline: data.timeline || 'steady'
    }
  }

  // Convert database format back to OnboardingData format
  private static transformFromDbFormat(data: OnboardingRecord): Partial<OnboardingData> {
    return {
      // Step 1
      businessType: data.business_type,
      businessName: data.business_name,
      locationType: data.location_type,
      location: data.location,
      customerType: data.customer_type,
      
      // Step 2
      goals: data.goals,
      brandPersonality: data.brand_personality,
      socialMediaPresence: data.social_media_presence,
      
      // Step 3
      brandColors: data.brand_colors,
      contactInfo: data.contact_info
        ? {
            website: data.contact_info.website ?? '',
            phone: data.contact_info.phone ?? '',
            socialHandles: data.contact_info.socialHandles ?? '',
          }
        : { website: '', phone: '', socialHandles: '' },
      budget: data.budget,
      timeline: data.timeline
    }
  }

  // ✅ ENHANCED: Better validation and error handling
  static async saveOnboardingData(
    data: Partial<OnboardingData>, 
    logoFileName?: string
  ): Promise<{ data: OnboardingRecord | null, error: any }> {
    try {
      console.log('💾 Attempting to save onboarding data:', data)
      
      // Validate required fields before transformation
      if (!data.businessType || !data.businessName) {
        const error = new Error(`Missing required fields: businessType="${data.businessType}", businessName="${data.businessName}"`);
        console.error('❌ Validation error:', error.message);
        return { data: null, error };
      }
      
      const dbData = this.transformToDbFormat(data)
      
      if (logoFileName) {
        dbData.logo_file_name = logoFileName
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
        dbData.logo_file_name = logoFileName
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
        target_market: onboardingData.target_market,
        ideal_customers: onboardingData.ideal_customers || null,
        customer_biggest_challenge: onboardingData.customer_biggest_challenge || null,
        audience_topics: onboardingData.audience_topics || null,
        // Step 4
        top_goals: onboardingData.top_goals || null,
        primary_business_goal: onboardingData.primary_business_goal || null,
        brand_personality: onboardingData.brand_personality || null,
        differentiators: onboardingData.differentiators || null,
        // Step 5
        logo_url,
        primary_color: onboardingData.primary_color,
        secondary_color: onboardingData.secondary_color,
        website: onboardingData.website,
        phone: onboardingData.phone,
        social_handles: onboardingData.social_handles ? JSON.stringify(onboardingData.social_handles) : null,
        current_social_presence: onboardingData.current_social_presence ? JSON.stringify(onboardingData.current_social_presence) : null,
        // Step 6
        team_size: onboardingData.team_size,
        business_age: onboardingData.business_age,
        project_duration: onboardingData.project_duration,
        monthly_budget: onboardingData.monthly_budget,
        results_timeline: onboardingData.results_timeline,
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
