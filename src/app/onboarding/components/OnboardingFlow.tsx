'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Step1BusinessBasics } from './Step1BusinessBasics';
import { Step2GoalsStyle } from './Step2GoalsStyle';
import { Step3BrandSetup } from './Step3BrandSetup';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DatabaseService } from '@/lib/database';
import { UserService } from '@/lib/user-service';
import { useSupabaseClient } from '@/lib/supabase-client';

export const OnboardingFlow: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showManualNav, setShowManualNav] = useState(false);
  const [completionTimer, setCompletionTimer] = useState(0);
  const totalSteps = 3;
  
  const {
    data,
    isLoading,
    error: hookError,
    updateData,
    saveStepData,
    saveCompleteData,
    loadFromDatabase,
    resetData
  } = useOnboarding();

  const testClerkSupabaseAuth = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      
      console.log('🔍 Clerk JWT Token:', token ? 'Present' : 'Missing');
      
      if (token) {
        // Decode the token to see its contents (for debugging)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 JWT Payload:', payload);
        console.log('🔍 Role in token:', payload.role);
      }
      
      // Test a simple query with authentication
      const { data, error } = await supabase
        .from('onboarding')
        .select('count')
        .limit(1);
        
      console.log('🔍 Auth test result:', { data, error });
    } catch (error) {
      console.error('🔍 Auth test failed:', error);
    }
  };

  const debugAuth = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      
      console.log('🔍 Debug Auth Results:');
      console.log('- User ID:', user?.id);
      console.log('- JWT Token:', token ? 'Present' : 'Missing');
      
      if (token) {
        // Decode the token to see its contents
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('- JWT Role:', payload.role);
        console.log('- JWT Payload:', payload);
      }
    } catch (error) {
      console.error('🔍 Auth debug failed:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      initializeUserProfile();
      testClerkSupabaseAuth();
      debugAuth();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const savedId = localStorage.getItem('onboardingId');
    if (savedId && !user) {
      console.log('📥 Loading existing onboarding data from localStorage...');
      loadFromDatabase(savedId);
    }
  }, [loadFromDatabase, user]);

  useEffect(() => {
    const testDatabaseConnection = async () => {
      console.log('🔍 Testing database connection on component mount...');
      try {
        const isConnected = await DatabaseService.testConnection();
        if (!isConnected) {
          console.error('❌ Database connection failed');
        } else {
          console.log('✅ Database connection successful');
        }
      } catch (err) {
        console.error('❌ Database test error:', err);
      }
    };
    testDatabaseConnection();
  }, []);

  const initializeUserProfile = async () => {
    if (!user) return;

    try {
      console.log('👤 Initializing user profile for:', user.id);
      
      await UserService.upsertUserProfile(user.id, {
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || '',
        avatar_url: user.imageUrl
      });
      
      console.log('✅ User profile initialized in Supabase');
      
      // Use authenticated client to load existing onboarding data
      const { data: existingData, error: loadError } = await supabase
        .from('onboarding')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (loadError) {
        console.log('📝 No existing onboarding data found for user (this is normal for new users)');
      } else if (existingData) {
        console.log('📥 Loading existing onboarding data for user');
        const formattedData = {
          businessType: existingData.business_type,
          businessName: existingData.business_name,
          locationType: existingData.location_type,
          location: existingData.location,
          customerType: existingData.customer_type,
          goals: existingData.goals,
          brandPersonality: existingData.brand_personality,
          socialMediaPresence: existingData.social_media_presence,
          brandColors: existingData.brand_colors,
          contactInfo: existingData.contact_info,
          budget: existingData.budget,
          timeline: existingData.timeline
        };
        updateData(formattedData);
      }
    } catch (error) {
      console.error('❌ Failed to initialize user profile:', error);
      setError('Failed to initialize user profile');
    }
  };

  const handleStep1Next = async (step1Data: any) => {
    if (!user) return;
    
    try {
      updateData(step1Data);
      
      console.log('💾 Saving Step 1 data for user:', user.id);
      console.log('📝 Step 1 data:', step1Data);
      
      // ✅ Use returning: 'minimal' to prevent automatic SELECT
      const { data, error } = await supabase
        .from('onboarding')
        .upsert({
          clerk_user_id: user.id,
          business_type: step1Data.businessType,
          business_name: step1Data.businessName,
          location_type: step1Data.locationType || 'online',
          location: step1Data.location,
          customer_type: step1Data.customerType || 'b2c',
          goals: step1Data.goals || [],
          brand_personality: step1Data.brandPersonality || [],
          social_media_presence: step1Data.socialMediaPresence || {
            facebook: 'none',
            instagram: 'none',
            linkedin: 'none'
          },
          brand_colors: step1Data.brandColors || {
            primary: '#3B82F6',
            secondary: '#EF4444'
          },
          contact_info: step1Data.contactInfo || {},
          budget: step1Data.budget || 500,
          timeline: step1Data.timeline || 'steady',
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'clerk_user_id' // ✅ Specify conflict resolution
        });

      if (error) {
        console.error('❌ Failed to save Step 1 to Supabase:', error);
        console.error('❌ Error details:', {
          message: error.message || 'Unknown error',
          code: error.code || 'NO_CODE',
          details: error.details || 'No details'
        });
        
        // Enhanced error handling for empty error objects
        if (Object.keys(error).length === 0 || !error.message) {
          setError('Authentication issue: Please try refreshing the page and logging in again.');
          return;
        }
        
        setError(`Database error: ${error.message || 'Unknown database error'}`);
        return;
      }
      
      console.log('✅ Step 1 saved to Supabase successfully');
      setCurrentStep(2);
    } catch (error) {
      console.error('❌ Error in handleStep1Next:', error);
      setError('Failed to save Step 1 data');
    }
  };

  // Add validation before saving
  const validateStep2Data = (step2Data: any) => {
    const requiredFields = ['goals', 'brandPersonality', 'socialMediaPresence'];
    
    for (const field of requiredFields) {
      if (!step2Data[field]) {
        console.warn(`⚠️ Missing required field: ${field}`);
      }
    }
    
    return {
      goals: Array.isArray(step2Data.goals) ? step2Data.goals : [],
      brandPersonality: Array.isArray(step2Data.brandPersonality) ? step2Data.brandPersonality : [],
      socialMediaPresence: step2Data.socialMediaPresence || {
        facebook: 'none',
        instagram: 'none',
        linkedin: 'none'
      }
    };
  };

  const handleStep2Next = async (step2Data: any) => {
    if (!user) return;
    
    try {
      // ✅ Validate and normalize Step 2 data
      const validatedStep2Data = validateStep2Data(step2Data);
      
      updateData(validatedStep2Data);
      
      // ✅ Debug logging
      console.log('🔍 Debug Info:');
      console.log('- User ID:', user.id);
      console.log('- Current data state:', JSON.stringify(data, null, 2));
      console.log('- Step 2 data (original):', JSON.stringify(step2Data, null, 2));
      console.log('- Step 2 data (validated):', JSON.stringify(validatedStep2Data, null, 2));
      
      // Check if we have existing data from Step 1
      if (!data.businessType || !data.businessName) {
        console.error('❌ Missing Step 1 data!');
        console.error('- businessType:', data.businessType);
        console.error('- businessName:', data.businessName);
        setError('Missing business information from Step 1. Please go back and complete Step 1.');
        return;
      }
      
      console.log('💾 Saving Step 2 data for user:', user.id);
      
      // ✅ Merge all existing data with validated step2Data
      const completeData = {
        clerk_user_id: user.id,
        // Step 1 data (preserve existing)
        business_type: data.businessType,
        business_name: data.businessName,
        location_type: data.locationType || 'online',
        location: data.location,
        customer_type: data.customerType || 'b2c',
        
        // Step 2 data (validated)
        goals: validatedStep2Data.goals,
        brand_personality: validatedStep2Data.brandPersonality,
        social_media_presence: validatedStep2Data.socialMediaPresence,
        
        // Default values for Step 3 (will be updated later)
        brand_colors: data.brandColors || {
          primary: '#3B82F6',
          secondary: '#EF4444'
        },
        contact_info: data.contactInfo || {},
        budget: data.budget || 500,
        timeline: data.timeline || 'steady',
        updated_at: new Date().toISOString()
      };

      console.log('📝 Complete data to save:', JSON.stringify(completeData, null, 2));

      // ✅ Specify the conflict target for proper upsert behavior
      const { data: result, error } = await supabase
        .from('onboarding')
        .upsert(completeData, { 
          onConflict: 'clerk_user_id' // ✅ Specify conflict resolution
        });

      if (error) {
        console.error('❌ Failed to save Step 2 to Supabase:', error);
        console.error('❌ Error details:', {
          message: error.message || 'Unknown error',
          code: error.code || 'NO_CODE',
          details: error.details || 'No details',
          hint: error.hint || 'No hint'
        });
        
        // Enhanced error handling for empty error objects
        if (Object.keys(error).length === 0 || !error.message) {
          setError('Authentication issue: Please try refreshing the page and logging in again.');
          return;
        }
        
        setError(`Database error: ${error.message || 'Unknown database error'}`);
        return;
      }
      
      console.log('✅ Step 2 saved to Supabase successfully');
      setCurrentStep(3);
    } catch (error) {
      console.error('❌ Error in handleStep2Next:', error);
      setError('Failed to save Step 2 data');
    }
  };

  const handleStep2Back = () => {
    console.log('⬅️ Going back to Step 1');
    setCurrentStep(1);
  };

  const handleStep3Submit = async (step3Data: any) => {
    if (!user) return;

    setIsCompleting(true);
    try {
      const completeData = { ...data, ...step3Data };
      updateData(step3Data);
      
      console.log('🏁 Starting final submission process...');
      console.log('👤 Current user metadata before update:', user.unsafeMetadata);
      
      // Save to Supabase first
      const { data: result, error } = await supabase
        .from('onboarding')
        .upsert({
          clerk_user_id: user.id,
          business_type: completeData.businessType,
          business_name: completeData.businessName,
          location_type: completeData.locationType || 'online',
          location: completeData.location,
          customer_type: completeData.customerType || 'b2c',
          goals: completeData.goals || [],
          brand_personality: completeData.brandPersonality || [],
          social_media_presence: completeData.socialMediaPresence || {
            facebook: 'none',
            instagram: 'none',
            linkedin: 'none'
          },
          brand_colors: step3Data.brandColors || {
            primary: '#3B82F6',
            secondary: '#EF4444'
          },
          contact_info: step3Data.contactInfo || {},
          budget: step3Data.budget || 500,
          timeline: step3Data.timeline || 'steady',
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'clerk_user_id'
        });

      if (error) {
        console.error('❌ Failed to save onboarding data:', error);
        setError('Failed to save onboarding data. Please try again.');
        return;
      }

      console.log('✅ Data saved to Supabase successfully');

      // ✅ Enhanced Clerk metadata update
      console.log('🔄 Updating Clerk user metadata...');
      
      try {
        const updatedMetadata = {
          ...user.unsafeMetadata,
          onboardingComplete: true,
          businessName: completeData.businessName,
          businessType: completeData.businessType,
          completedAt: new Date().toISOString()
        };
        
        console.log('📝 Metadata to update:', updatedMetadata);
        
        await user.update({
          unsafeMetadata: updatedMetadata
        });
        
        console.log('✅ Clerk metadata update called successfully');
        
        // ✅ Wait longer for metadata to propagate
        console.log('⏳ Waiting for metadata to propagate...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ✅ Reload the user to get fresh metadata
        await user.reload();
        
        console.log('🔍 Updated user metadata after reload:', user.unsafeMetadata);
        console.log('🔍 Onboarding complete status:', user.unsafeMetadata?.onboardingComplete);
        
        // ✅ Verify the metadata was actually updated
        if (!user.unsafeMetadata?.onboardingComplete) {
          console.error('❌ Metadata update failed - onboardingComplete still undefined');
          setError('Failed to update completion status. Please try again.');
          return;
        }
        
      } catch (metadataError) {
        console.error('❌ Failed to update Clerk metadata:', metadataError);
        setError('Failed to update user profile. Please try again.');
        return;
      }

      const brandName = completeData.businessName;
      if (brandName) {
        localStorage.setItem('brandName', brandName);
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('completionDate', new Date().toISOString());
        console.log('💾 Brand information stored for dashboard');
      }

      // ✅ Store completion in localStorage as backup
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('completionTimestamp', Date.now().toString());
      
      console.log('🔄 Starting navigation to dashboard...');
      
      // ✅ Use multiple navigation methods
      try {
        // Method 1: Router push with cache bypass
        await router.push(`/dashboard?completed=${Date.now()}`);
        console.log('✅ Router navigation initiated');
      } catch (routerError) {
        console.warn('⚠️ Router failed, using window.location');
        // Method 2: Direct window location
        window.location.href = `/dashboard?completed=${Date.now()}`;
      }
      
    } catch (error) {
      console.error('❌ Error in handleStep3Submit:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStep3Back = () => {
    console.log('⬅️ Going back to Step 2');
    setCurrentStep(2);
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  // Timer effect for manual navigation fallback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCompleting) {
      setShowManualNav(false);
      setCompletionTimer(0);
      
      interval = setInterval(() => {
        setCompletionTimer(prev => {
          const newTime = prev + 1;
          if (newTime >= 5) {
            setShowManualNav(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      setShowManualNav(false);
      setCompletionTimer(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCompleting]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BusinessBasics
            key="step-1"
            data={data}
            onNext={handleStep1Next}
          />
        );
      case 2:
        return (
          <Step2GoalsStyle
            key="step-2"
            data={data}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
          />
        );
      case 3:
        return (
          <Step3BrandSetup
            key="step-3"
            data={data}
            onSubmit={handleStep3Submit}
            onBack={handleStep3Back}
            isCompleting={isCompleting}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-600">Invalid step: {currentStep}</p>
            <button 
              onClick={() => setCurrentStep(1)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Go to Step 1
            </button>
          </div>
        );
    }
  };

  const safeRenderObject = (obj: any, fallback = 'No data available') => {
    if (!obj) return fallback;
    if (typeof obj === 'string' || typeof obj === 'number') return obj;
    if (Array.isArray(obj)) return obj.join(', ');
    if (typeof obj === 'object') {
      return Object.entries(obj).map(([key, value]) => (
        <div key={key}>
          <span className="font-medium">{key}:</span> {String(value)}
        </div>
      ));
    }
    return String(obj);
  };

  if (!isLoaded || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
          <p className="text-gray-600">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <p className="text-red-600 mb-4">Authentication required</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4" suppressHydrationWarning>
        <div className="text-center mb-8" suppressHydrationWarning>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SME Intelligence, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Let's set up your business profile to get personalized AI insights
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2" suppressHydrationWarning>
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-500">
              {user.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        </div>

        <div className="mb-8" suppressHydrationWarning>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step === 1 && 'Business Basics'}
                  {step === 2 && 'Goals & Style'}
                  {step === 3 && 'Brand Setup'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {(isLoading || isCompleting) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-600 text-sm">
                {isCompleting ? 'Completing your setup...' : 'Saving your progress...'}
              </p>
            </div>
          </div>
        )}

        {(error || hookError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" suppressHydrationWarning>
            <div className="flex items-center">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div>
                <p className="text-red-600 text-sm font-medium">Error occurred</p>
                <p className="text-red-600 text-sm">{error || hookError}</p>
              </div>
            </div>
          </div>
        )}

        {isCompleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Completing Your Setup
              </h3>
              <p className="text-gray-600 mb-4">
                We're finalizing your business profile and preparing your dashboard...
              </p>
              
              {/* Countdown timer */}
              <div className="text-sm text-gray-500 mb-4">
                {completionTimer < 5 ? (
                  <span>Please wait... ({5 - completionTimer}s)</span>
                ) : (
                  <span className="text-orange-600 font-medium">
                    Taking longer than expected
                  </span>
                )}
              </div>
              
              {/* Manual navigation button after 5 seconds */}
              {showManualNav && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    If you're still waiting, you can manually navigate to your dashboard:
                  </p>
                  <button
                    onClick={() => {
                      console.log('🚀 Manual navigation to dashboard triggered');
                      window.location.href = '/dashboard';
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Dashboard Manually
                  </button>
                  <p className="text-xs text-gray-500">
                    Your data has been saved and will be available in the dashboard
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8" suppressHydrationWarning>
          {renderCurrentStep()}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your progress is automatically saved as you go
          </p>
        </div>
      </div>
    </div>
  );
};

const renderAnalytics = (analytics: any) => {
  if (!analytics || typeof analytics !== 'object') {
    return <p>No analytics data available</p>;
  }
  return (
    <div>
      <p>Optimal Time: {analytics.optimal_time}</p>
      <p>Predicted Engagement: {analytics.predicted_engagement}</p>
      <p>Day of Week: {analytics.day_of_week}</p>
      <p>Recommendations: {analytics.recommendations}</p>
    </div>
  );
};
