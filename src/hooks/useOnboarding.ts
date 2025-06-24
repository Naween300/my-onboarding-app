import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/nextjs';
import { OnboardingData } from '@/lib/types'
import { DatabaseService } from '@/lib/database'
import { StorageService } from '@/lib/storage'

interface UseOnboardingReturn {
  data: Partial<OnboardingData>
  isLoading: boolean
  error: string | null
  currentId: string | null
  updateData: (newData: Partial<OnboardingData>) => void
  saveStepData: (stepData: Partial<OnboardingData>) => Promise<boolean>
  saveCompleteData: () => Promise<boolean>
  loadFromDatabase: () => Promise<void>
  resetData: () => void
}

// ✅ FIXED: Remove empty strings for required fields
const initialData: Partial<OnboardingData> = {
  // Don't set businessType and businessName to empty strings
  locationType: 'online',
  customerType: 'b2c',
  goals: [],
  brandPersonality: [],
  socialMediaPresence: {
    facebook: 'none',
    instagram: 'none',
    linkedin: 'none'
  },
  brandColors: {
    primary: '#3B82F6',
    secondary: '#EF4444'
  },
  contactInfo: {
    website: '',
    phone: '',
    socialHandles: ''
  },
  budget: 500,
  timeline: 'steady'
}

export const useOnboarding = (): UseOnboardingReturn & { testAuth: () => Promise<boolean> } => {
  const [data, setData] = useState<Partial<OnboardingData>>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const { getToken } = useAuth();
  const { user } = useUser();

  // Create Supabase client directly in the hook
  const createSupabaseClient = () => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await getToken({ template: 'supabase' });
            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`);
            }
            return fetch(url, { ...options, headers });
          },
        },
      }
    );
  };

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    console.log('🔄 updateData called with:', newData);
    
    setData(prevData => {
      const updatedData = {
        ...prevData,
        ...newData
      };
      
      console.log('✅ Data state updated to:', updatedData);
      return updatedData;
    });
  }, [])

  // ✅ ENHANCED: Better validation and error handling
  const saveStepData = useCallback(async (stepData: Partial<OnboardingData>): Promise<boolean> => {
    console.log('💾 saveStepData called with:', stepData)
    console.log('📊 Current data state:', data)
    console.log('🆔 Current ID:', currentId)
    
    setIsLoading(true)
    setError(null)

    try {
      // Update local state first
      const updatedData = { ...data, ...stepData }
      setData(updatedData)
      console.log('🔄 Updated data to save:', updatedData)

      // ✅ CRITICAL: Validate required fields before database call
      if (!updatedData.businessType || !updatedData.businessName) {
        const missingFields = [];
        if (!updatedData.businessType) missingFields.push('businessType');
        if (!updatedData.businessName) missingFields.push('businessName');
        
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error('❌ Validation failed:', errorMsg);
        console.error('❌ Current data:', updatedData);
        setError(errorMsg);
        return false;
      }

      let logoFileName: string | undefined

      // Handle logo upload if present in step data
      if (stepData.logo && updatedData.businessName) {
        console.log('📁 Uploading logo...')
        
        const { fileName, publicUrl, error: uploadError } = await StorageService.uploadLogo(
          stepData.logo, 
          updatedData.businessName
        )
        
        if (uploadError) {
          console.error('❌ Logo upload failed:', uploadError)
          setError('Failed to upload logo')
          return false
        }
        
        logoFileName = fileName || undefined
        console.log('✅ Logo uploaded:', { fileName, publicUrl })
      }

      // ✅ ENHANCED: Call DatabaseService with validation
      console.log('💾 Calling DatabaseService.saveStepData...')
      const { data: savedData, error: saveError, isNew } = await DatabaseService.saveStepData(
        currentId,
        updatedData,
        logoFileName
      )
      
      if (saveError) {
        console.error('❌ DatabaseService error:', saveError)
        console.error('❌ Error details:', {
          message: saveError.message,
          code: saveError.code,
          details: saveError.details,
          hint: saveError.hint
        });
        setError(`Database error: ${saveError.message || JSON.stringify(saveError)}`)
        return false
      }

      console.log('✅ DatabaseService returned:', { savedData, isNew })
      
      // Update current ID if this is a new record
      if (isNew && savedData?.id) {
        setCurrentId(savedData.id)
        localStorage.setItem('onboardingId', savedData.id)
        console.log('🆕 New record ID stored:', savedData.id)
      }

      console.log('✅ Step data saved successfully to database')
      return true
      
    } catch (err) {
      console.error('❌ Unexpected error in saveStepData:', err)
      setError(`Hook error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [data, currentId])

  // ✅ ENHANCED: Better validation for complete data save
  const saveCompleteData = useCallback(async (): Promise<boolean> => {
    console.log('💾 saveCompleteData called with current data:', data);
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Validate required fields
      const requiredFields = ['businessType', 'businessName', 'goals', 'brandPersonality'];
      const missingFields = requiredFields.filter(field => {
        const value = (data as any)[field];
        return !value || (Array.isArray(value) && value.length === 0);
      });
      
      if (missingFields.length > 0) {
        const errorMsg = `Cannot save: Missing required fields: ${missingFields.join(', ')}`;
        console.error('❌ Final validation failed:', errorMsg);
        console.error('❌ Current data state:', data);
        setError(errorMsg);
        return false;
      }

      if (!user) {
        setError('User not authenticated');
        return false;
      }

      // ✅ Create Supabase client
      const supabase = createSupabaseClient();

      // ✅ Save to user_profiles first
      const { data: userResult, error: userError } = await supabase
        .from('user_profiles')
        .upsert({
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || data.businessName,
          avatar_url: user.imageUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'clerk_user_id' });

      if (userError) {
        console.error('❌ User profile error:', userError);
        setError(`User profile error: ${userError.message}`);
        return false;
      }

      // ✅ Save to onboarding table
      const { data: onboardingResult, error: onboardingError } = await supabase
        .from('onboarding')
        .upsert({
          clerk_user_id: user.id,
          business_name: data.businessName,
          business_type: data.businessType,
          location_type: data.locationType || 'online',
          location: data.location,
          customer_type: data.customerType,
          goals: data.goals,
          brand_personality: data.brandPersonality,
          social_media_presence: data.socialMediaPresence,
          brand_colors: data.brandColors,
          contact_info: data.contactInfo,
          budget: data.budget,
          timeline: data.timeline,
          updated_at: new Date().toISOString()
        }, { onConflict: 'clerk_user_id' });

      if (onboardingError) {
        console.error('❌ Onboarding error:', onboardingError);
        setError(`Onboarding error: ${onboardingError.message}`);
        return false;
      }

      console.log('✅ Database save completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Database save error:', error);
      setError(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data, user, getToken]);

  const loadFromDatabase = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    const supabase = createSupabaseClient();
    try {
      const { data: loadedData, error: loadError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();
      if (loadError) {
        console.error('Database error:', loadError);
        setError('Failed to load onboarding data');
        return;
      }
      if (loadedData) {
        setData(loadedData);
        setCurrentId(loadedData.id);
        console.log('✅ Data loaded from database:', loadedData);
      }
    } catch (err) {
      console.error('Error loading from database:', err);
      setError('An unexpected error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken]);

  // Test authentication before fetching data
  const testAuth = useCallback(async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: testData, error: testError } = await supabase.rpc('test_authorization_header');
      
      console.log('🔍 Auth test results:', {
        role: testData?.role,
        userId: testData?.sub,
        error: testError
      });
      
      if (testData?.role !== 'authenticated') {
        console.error('❌ User not authenticated:', testData?.role);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error testing authentication:', error);
      return false;
    }
  }, [getToken]);

  const resetData = useCallback(() => {
    console.log('🔄 resetData called')
    setData(initialData)
    setError(null)
    setCurrentId(null)
    localStorage.removeItem('onboardingId')
  }, [])

  return {
    data,
    isLoading,
    error,
    currentId,
    updateData,
    saveStepData,
    saveCompleteData,
    loadFromDatabase,
    resetData,
    testAuth
  }
}
