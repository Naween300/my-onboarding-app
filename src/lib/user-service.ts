import { supabase } from './supabase-client'
import { OnboardingData } from './types'

export class UserService {
  // ✅ Test authentication context
  static async testAuthenticationContext() {
    try {
      const { data: authTest, error: authError } = await supabase
        .rpc('test_authorization_header');
        
      console.log('🔍 Auth test results:', {
        role: authTest?.role,
        userId: authTest?.sub,
        error: authError
      });
      
      return { role: authTest?.role, userId: authTest?.sub, error: authError };
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      return { role: null, userId: null, error };
    }
  }

  // ✅ Enhanced method with authentication testing
  static async getUserOnboardingData(clerkUserId: string) {
    try {
      console.log('📥 Loading onboarding data for Clerk user:', clerkUserId);
      
      // ✅ Test authentication context first
      const { data: authTest, error: authError } = await supabase
        .rpc('test_authorization_header');
        
      console.log('🔍 Auth test results:', {
        role: authTest?.role,
        userId: authTest?.sub,
        error: authError
      });
      
      if (!authTest || authTest.role !== 'authenticated') {
        console.warn('⚠️ User not properly authenticated:', authTest?.role);
        return { 
          data: null, 
          error: new Error(`Authentication issue: User role is ${authTest?.role}, expected 'authenticated'`) 
        };
      }
      
      if (authTest.sub !== clerkUserId) {
        console.warn('⚠️ JWT user ID mismatch:', { jwtSub: authTest.sub, clerkUserId });
      }
      
      const { data, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (error) {
        console.error('❌ Supabase SELECT error details:', {
          message: error.message || 'Unknown error',
          code: error.code || 'NO_CODE',
          details: error.details || 'No details',
          hint: error.hint || 'No hint'
        });
        
        // Check if it's an empty error object (RLS issue)
        if (Object.keys(error).length === 0 || !error.message) {
          return { 
            data: null, 
            error: new Error('RLS Policy Violation: User not authenticated or policies blocking access') 
          };
        }
        
        return { data: null, error };
      }

      console.log('✅ Successfully loaded user onboarding data:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Unexpected error in getUserOnboardingData:', error);
      return { data: null, error };
    }
  }

  // ✅ Use this for creating user profiles
  static async upsertUserProfile(clerkUserId: string, userData: {
    email: string
    name?: string
    avatar_url?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          clerk_user_id: clerkUserId,
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}
