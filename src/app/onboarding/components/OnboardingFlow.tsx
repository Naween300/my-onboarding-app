'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DropResult } from '@hello-pangea/dnd';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSupabase } from '@/contexts/SupabaseContext';
import { StrategyService } from '@/lib/strategies/strategy-service';
import { Step1BusinessBasics } from './Step1BusinessBasics';
import { Step2GoalsStyle } from './Step2GoalsStyle';
import { Step3BrandSetup } from './Step3BrandSetup';
import { Step4GoalsBrandIdentity } from './Step4GoalsBrandIdentity';
import { Step5BrandSetup } from './Step5BrandSetup';
import { Step6OptimizationSettings } from './Step6OptimizationSettings';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@supabase/supabase-js';

export const OnboardingFlow = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { data, saveCompleteData, updateData, error: hookError } = useOnboarding();
  const supabase = useSupabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    business_offering: '',
    business_category: '',
    business_name: '',
    location_type: 'online',
    location_details: '',
    // Step 2 fields
    product_types: [] as string[],
    product_sales_channels: [] as string[],
    customer_purchase_pattern: '',
    product_price_range: '',
    service_types: [] as string[],
    service_delivery_methods: [] as string[],
    service_engagement_type: '',
    service_price_range: '',
    primary_focus: '',
    products_services_connection: '',
    // Step 3 fields
    customer_type: '',
    ideal_customers: [] as string[],
    customer_biggest_challenge: '',
    audience_topics: [] as string[],
    // Step 4 fields
    top_goals: [] as string[],
    main_goal: '',
    brand_personality: [] as string[],
    differentiators: [] as string[],
    // Step 5 fields
    brandColors: { primary: '#3B82F6', secondary: '#EF4444' },
    contactInfo: { website: '', phone: '', social: '', socialHandles: '' },
    logoFile: null,
    socialMedia: { facebook: 'none', instagram: 'none', linkedin: 'none' },
    // Step 6 fields
    team_size: '',
    business_age: '',
    project_duration: '',
    budget: 500,
    results_timeline: '',
    // Progress fields (optional)
    onboarding_step: 1,
    is_completed: false,
    completion_percentage: 0,
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add debug logging to track the issue
  useEffect(() => {
    console.log('🔍 Onboarding Page Debug:', {
      userLoaded: isLoaded,
      userId: user?.id,
      userMetadata: user?.unsafeMetadata,
      onboardingComplete: user?.unsafeMetadata?.onboardingComplete,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server',
      searchParams: typeof window !== 'undefined' ? window.location.search : 'server',
      currentStep,
      isCompleting
    });
  }, [isLoaded, user, currentStep, isCompleting]);

  // Debug your form data state
  useEffect(() => {
    console.log('🔍 Current formData state:', {
      business_offering: formData.business_offering,
      business_category: formData.business_category,
      business_name: formData.business_name,
      location_type: formData.location_type,
      location_details: formData.location_details,
      top_goals: formData.top_goals,
      brand_personality: formData.brand_personality,
      allFormData: formData
    });
  }, [formData]);

  // Add debug logging to track the issue
  useEffect(() => {
    console.log('🔍 Current onboarding state:', {
      currentStep,
      userMetadata: user?.unsafeMetadata,
      onboardingComplete: user?.unsafeMetadata?.onboardingComplete,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server',
      isLoaded,
      userId: user?.id
    });
  }, [currentStep, user, isLoaded]);

  // Sync form data with hook data
  useEffect(() => {
    if (data.businessName && data.businessName !== formData.business_name) {
      setFormData(prev => ({ ...prev, business_name: data.businessName || '' }));
    }
    if (data.businessType && data.businessType !== formData.business_offering) {
      setFormData(prev => ({ ...prev, business_offering: data.businessType || '' }));
    }
  }, [data.businessName, data.businessType]);

  // Update hook data when form data changes
  const updateFormDataAndHook = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    
    // Also update the hook data
    const hookData = {
      businessName: newData.business_name || formData.business_name,
      businessType: newData.business_offering || formData.business_offering,
      locationType: (newData.location_type || formData.location_type) as 'local' | 'online',
      location: newData.location_details || formData.location_details,
      top_goals: newData.top_goals || formData.top_goals,
      brand_personality: newData.brand_personality || formData.brand_personality,
      socialMediaPresence: {
        facebook: formData.socialMedia.facebook as 'none' | 'some' | 'active',
        instagram: formData.socialMedia.instagram as 'none' | 'some' | 'active',
        linkedin: formData.socialMedia.linkedin as 'none' | 'some' | 'active'
      },
      brandColors: newData.brandColors || formData.brandColors,
      contactInfo: {
        website: newData.contactInfo?.website || formData.contactInfo.website,
        phone: newData.contactInfo?.phone || formData.contactInfo.phone,
        social: newData.contactInfo?.social || formData.contactInfo.social || '',
        socialHandles: newData.contactInfo?.socialHandles || formData.contactInfo.socialHandles || ''
      },
      budget: newData.budget || formData.budget,
      results_timeline: newData.results_timeline
    };
    
    updateData(hookData as any);
  };

  // Debug panel component
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
        <h3 className="font-bold mb-2">🔍 Debug Panel</h3>
        <div className="space-y-1">
          <div>Step: {currentStep}</div>
          <div>User ID: {user?.id || 'None'}</div>
          <div>Onboarding Complete: {user?.unsafeMetadata?.onboardingComplete ? 'Yes' : 'No'}</div>
          <div>Is Completing: {isCompleting ? 'Yes' : 'No'}</div>
          <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'server'}</div>
        </div>
        <button
          onClick={() => {
            console.log('🔍 Manual debug check:', {
              user: user,
              metadata: user?.unsafeMetadata,
              publicMetadata: user?.publicMetadata
            });
          }}
          className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Log State
        </button>
      </div>
    );
  };

  // Business type options with emojis
  const businessTypes = [
    { id: 'restaurant', emoji: '🍽️', label: 'Restaurant/Food' },
    { id: 'retail', emoji: '🛍️', label: 'Retail/Store' },
    { id: 'healthcare', emoji: '🏥', label: 'Healthcare' },
    { id: 'technology', emoji: '💻', label: 'Tech/Software' },
    { id: 'professional', emoji: '💼', label: 'Professional Services' },
    { id: 'creative', emoji: '🎨', label: 'Creative/Design' },
    { id: 'construction', emoji: '🏗️', label: 'Construction/Home' },
    { id: 'finance', emoji: '💰', label: 'Finance/Insurance' },
    { id: 'education', emoji: '📚', label: 'Education' },
    { id: 'automotive', emoji: '🚗', label: 'Automotive' },
    { id: 'manufacturing', emoji: '🏭', label: 'Manufacturing' },
    { id: 'nonprofit', emoji: '❤️', label: 'Non-profit' },
    { id: 'travel', emoji: '✈️', label: 'Travel/Tourism' },
    { id: 'beauty', emoji: '💄', label: 'Beauty/Fashion' },
    { id: 'entertainment', emoji: '🎬', label: 'Entertainment' }
  ];

  const brandPersonalities = [
    '💼 Professional', '😊 Friendly', '🎨 Creative', 
    '🚀 Innovative', '🌱 Authentic', '✨ Premium'
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(formData.top_goals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, top_goals: items });
  };

  // ✅ Create a direct database save function
  const saveToDatabase = async (data: any) => {
    try {
      // Save to user_profiles
      const { error: userError } = await supabase
        .from('user_profiles')
        .upsert({
          clerk_user_id: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          name: user?.fullName || data.business_name,
          avatar_url: user?.imageUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'clerk_user_id' });

      if (userError) throw new Error(userError.message);

      // Save to onboarding
      const { error: onboardingError } = await supabase
        .from('onboarding')
        .upsert({
          clerk_user_id: user?.id,
          business_name: data.business_name,
          business_type: data.business_offering,
          location_type: data.location_type,
          location: data.location_details,
          goals: data.goals,    
          brand_personality: data.brandPersonality,
          social_media_presence: data.socialMediaPresence,
          brand_colors: data.brandColors,
          contact_info: data.contactInfo,
          budget: data.budget,
          timeline: data.timeline,
          updated_at: new Date().toISOString()
        }, { onConflict: 'clerk_user_id' });

      if (onboardingError) throw new Error(onboardingError.message);

      return true;
    } catch (error) {
      console.error('❌ Database save error:', error);
      return false;
    }
  };

  const handleOnboardingComplete = async (finalData?: typeof formData) => {
    const dataToUse = finalData || formData;
    
    if (isCompleting) return;
    if (!user) return;
    
    setIsCompleting(true);
    setError(null);
    
    try {
      console.log('🔥 Client: Starting onboarding completion via API route');
      
      // Call your API route instead of Supabase directly
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUse)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'API request failed');
      }

      console.log('✅ Client: Onboarding completed successfully:', result);

      // Update user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingComplete: true,
          completedAt: new Date().toISOString()
        }
      });

      // Redirect to dashboard
      router.push('/dashboard?onboarding=completed');

    } catch (error: any) {
      console.error('❌ Client: Onboarding completion error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsCompleting(false);
    }
  };

  // Enhanced step navigation handler
  const handleStepNavigation = (stepNumber: number, stepData?: any) => {
    if (stepData) {
      const mergedData = { ...formData, ...stepData };
      setFormData(mergedData);
      // Save progress to localStorage
      localStorage.setItem('onboarding_progress', JSON.stringify({
        currentStep: stepNumber,
        formData: mergedData
      }));
      console.log(`Step ${currentStep} -> ${stepNumber} with data:`, stepData);
    } else {
      // Save progress to localStorage
      localStorage.setItem('onboarding_progress', JSON.stringify({
        currentStep: stepNumber,
        formData
      }));
    }
    setCurrentStep(stepNumber);
  };

  // Load saved progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      try {
        const { currentStep: savedStep, formData: savedData } = JSON.parse(savedProgress);
        setCurrentStep(savedStep);
        setFormData(savedData);
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, []);

  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
  }, [currentStep, formData]);

  // Define a type for the onboarding form state

  type OnboardingFormData = typeof formData;

  // Replace Step 1 UI with Step1BusinessBasics
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SME Intelligence
          </h1>
          <p className="text-xl text-gray-600">
            Let's set up your AI-powered business profile
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step <= currentStep
                  ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Step 1: Business Basics */}
            {currentStep === 1 && (
              <div className="p-8">
                <Step1BusinessBasics
                  data={formData as any} 
                  onNext={(step1Data) => {
                    // Merge contactInfo as before, then use handleStepNext
                    const merged = {
                      ...formData,
                      ...step1Data,
                      contactInfo: {
                        website: step1Data.contactInfo?.website ?? formData.contactInfo.website ?? '',
                        phone: step1Data.contactInfo?.phone ?? formData.contactInfo.phone ?? '',
                        social: (step1Data.contactInfo && 'social' in step1Data.contactInfo) ? String(step1Data.contactInfo.social) : String(formData.contactInfo.social ?? ''),
                        socialHandles: step1Data.contactInfo?.socialHandles ?? formData.contactInfo.socialHandles ?? ''
                      }
                    };
                    handleStepNavigation(2, merged);
                  }}
                />
              </div>
            )}
            {/* Step 2: Offering Details */}
            {currentStep === 2 && (
              <div className="p-8">
                <Step2GoalsStyle
                  data={formData}
                  onNext={(step2Data) => handleStepNavigation(3, step2Data)}
                  onBack={() => handleStepNavigation(1)}
                />
              </div>
            )}
            {/* Step 3: Market Intelligence */}
            {currentStep === 3 && (
              <div className="p-8">
                <Step3BrandSetup
                  data={formData}
                  onSubmit={(step3Data: OnboardingFormData) => handleStepNavigation(4, step3Data)}
                  onBack={() => handleStepNavigation(2)}
                  isCompleting={isCompleting}
                        />
                      </div>
            )}
            {/* Step 4: Goals & Brand Identity */}
            {currentStep === 4 && (
              <div className="p-8">
                <Step4GoalsBrandIdentity
                  data={formData}
                  onSubmit={(step4Data: any) => {
                    console.log('Step 4 completed with data:', step4Data);
                    handleStepNavigation(5, step4Data);
                  }}
                  onBack={() => handleStepNavigation(3)}
                  isCompleting={isCompleting}
                />
              </div>
            )}

            {/* Step 5: Brand Setup */}
            {currentStep === 5 && (
              <div className="p-8">
                <Step5BrandSetup
                  data={formData}
                  onSubmit={(step5Data: any) => {
                    console.log('Step 5 completed with data:', step5Data);
                    handleStepNavigation(6, step5Data);
                  }}
                  onBack={() => handleStepNavigation(4)}
                  isCompleting={isCompleting}
                />
              </div>
            )}

            {/* Step 6: Optimization Settings */}
            {currentStep === 6 && (
              <div className="p-8">
                <Step6OptimizationSettings
                  data={formData}
                  onSubmit={(step6Data: any) => {
                    console.log('Step 6 completed with data:', step6Data);
                    const finalData = { ...formData, ...step6Data };
                    setFormData(finalData);
                    handleOnboardingComplete(finalData);
                  }}
                  onBack={() => handleStepNavigation(5)}
                  isCompleting={isCompleting}
                />
              </div>
            )}
          </div>
        </div>
        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
      <DebugPanel />
    </div>
  );
};