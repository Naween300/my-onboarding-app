'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DropResult } from '@hello-pangea/dnd';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSupabaseClient } from '@/lib/supabase-client';

export const OnboardingFlow = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { data, saveCompleteData, updateData, error: hookError } = useOnboarding();
  const supabase = useSupabaseClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessType: '',
    businessName: '',
    locationType: '',
    location: '',
    customerType: '',
    goals: ['📈 Brand awareness', '🎯 Generate leads', '💰 Direct sales', '🤝 Build relationships', '🧠 Thought leadership', '🛠️ Customer support'],
    rankedGoals: [] as string[],
    brandPersonality: [] as string[],
    socialMedia: {
      facebook: 'none',
      instagram: 'none',
      linkedin: 'none'
    },
    logo: null,
    brandColors: { primary: '#3B82F6', secondary: '#EF4444' },
    contactInfo: { website: '', phone: '', social: '' },
    budget: 500,
    timeline: 'steady'
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
      businessType: formData.businessType,
      businessName: formData.businessName,
      rankedGoals: formData.rankedGoals,
      brandPersonality: formData.brandPersonality,
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
    if (data.businessName && data.businessName !== formData.businessName) {
      setFormData(prev => ({ ...prev, businessName: data.businessName || '' }));
    }
    if (data.businessType && data.businessType !== formData.businessType) {
      setFormData(prev => ({ ...prev, businessType: data.businessType || '' }));
    }
  }, [data.businessName, data.businessType]);

  // Update hook data when form data changes
  const updateFormDataAndHook = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    
    // Also update the hook data
    const hookData = {
      businessName: newData.businessName || formData.businessName,
      businessType: newData.businessType || formData.businessType,
      locationType: (newData.locationType || formData.locationType) as 'local' | 'online',
      location: newData.location || formData.location,
      customerType: (newData.customerType || formData.customerType) as 'b2b' | 'b2c' | 'both',
      goals: newData.rankedGoals || formData.rankedGoals,
      brandPersonality: newData.brandPersonality || formData.brandPersonality,
      socialMediaPresence: {
        facebook: formData.socialMedia.facebook as 'none' | 'some' | 'active',
        instagram: formData.socialMedia.instagram as 'none' | 'some' | 'active',
        linkedin: formData.socialMedia.linkedin as 'none' | 'some' | 'active'
      },
      brandColors: newData.brandColors || formData.brandColors,
      contactInfo: {
        website: newData.contactInfo?.website || formData.contactInfo.website,
        phone: newData.contactInfo?.phone || formData.contactInfo.phone,
        socialHandles: newData.contactInfo?.social || formData.contactInfo.social
      },
      budget: newData.budget || formData.budget,
      timeline: (newData.timeline || formData.timeline) as 'quick' | 'steady' | 'long-term'
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
    const items = Array.from(formData.rankedGoals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, rankedGoals: items });
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
          name: user?.fullName || data.businessName,
          avatar_url: user?.imageUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'clerk_user_id' });

      if (userError) throw new Error(userError.message);

      // Save to onboarding
      const { error: onboardingError } = await supabase
        .from('onboarding')
        .upsert({
          clerk_user_id: user?.id,
          business_name: data.businessName,
          business_type: data.businessType,
          location_type: data.locationType,
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

      if (onboardingError) throw new Error(onboardingError.message);

      return true;
    } catch (error) {
      console.error('❌ Database save error:', error);
      return false;
    }
  };

  const handleOnboardingComplete = async () => {
    if (isCompleting) return;
    if (!user) return;
    
    setIsCompleting(true);
    setError(null);
    
    try {
      console.log('🎉 Starting onboarding completion...');
      
      // ✅ Prepare complete data from form state
      const completeData = {
        businessType: formData.businessType,
        businessName: formData.businessName,
        locationType: formData.locationType || 'online',
        location: formData.location || '',
        customerType: formData.customerType,
        goals: formData.rankedGoals || [],
        brandPersonality: formData.brandPersonality || [],
        socialMediaPresence: formData.socialMedia || {},
        brandColors: formData.brandColors || { primary: '#3B82F6', secondary: '#EF4444' },
        contactInfo: formData.contactInfo || { website: '', phone: '', social: '' },
        budget: formData.budget || 500,
        timeline: formData.timeline || 'steady'
      };

      console.log('🔍 Complete data prepared:', completeData);

      // ✅ CRITICAL: Validate the prepared data directly (not state)
      const missingFields = [];
      if (!completeData.businessType) missingFields.push('businessType');
      if (!completeData.businessName) missingFields.push('businessName');
      if (!completeData.goals || completeData.goals.length === 0) missingFields.push('goals');
      if (!completeData.brandPersonality || completeData.brandPersonality.length === 0) missingFields.push('brandPersonality');

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        console.error('❌ Current formData:', formData);
        setError(`Please complete: ${missingFields.join(', ')}`);
        return;
      }

      console.log('✅ All required fields present');

      // ✅ Save directly to database with validated data
      const success = await saveToDatabase(completeData);
      
      if (!success) {
        setError('Failed to save onboarding data to database');
        return;
      }

      console.log('✅ Database save successful');

      // ✅ DON'T update Clerk metadata - causes cookie size issues
      // await user.update({ unsafeMetadata: { onboardingComplete: true } });

      // ✅ Direct redirect to dashboard with bypass parameter
      window.location.href = '/dashboard?onboarding=completed';

    } catch (error: any) {
      console.error('❌ Completion error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsCompleting(false);
    }
  };

  const requiredFields = ['businessType', 'businessName', 'goals', 'brandPersonality'];
  const missingFields = requiredFields.filter(field => {
    const value = (data as any)[field];
    return !value || (Array.isArray(value) && value.length === 0);
  });

  const onboardingComplete = user?.unsafeMetadata?.onboardingComplete;

  useEffect(() => {
    // ✅ If debug panel shows completion, force redirect
    if (user?.unsafeMetadata?.onboardingComplete) {
      console.log('🚀 Client-side: Onboarding complete, redirecting...');
      window.location.replace('/dashboard?onboarding=completed');
    }
  }, [user]);

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
          {[1, 2, 3].map((step) => (
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
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Step 1: Business Basics
                  </h2>
                  <p className="text-gray-600 text-lg">What's your business?</p>
                </div>
                {/* Business Type Grid - 5x3 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Choose your business type:</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {businessTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, businessType: type.id })}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          formData.businessType === type.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.emoji}</div>
                        <div className="text-xs font-medium text-center">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Business Name */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Business Name:
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Enter your business name"
                  />
                </div>
                {/* Location */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Location:</h3>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setFormData({ ...formData, locationType: 'local' })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.locationType === 'local'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">📍</div>
                      <div className="font-medium">Local business in:</div>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, locationType: 'online' })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.locationType === 'online'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🌐</div>
                      <div className="font-medium">Online/Remote</div>
                    </button>
                  </div>
                  {formData.locationType === 'local' && (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your city/location"
                    />
                  )}
                </div>
                {/* Customer Type */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">You serve:</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'b2b', emoji: '🏢', label: 'Businesses (B2B)' },
                      { id: 'b2c', emoji: '👥', label: 'Consumers (B2C)' },
                      { id: 'both', emoji: '🔄', label: 'Both' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, customerType: type.id })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.customerType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.emoji}</div>
                        <div className="font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.businessType || !formData.businessName || !formData.locationType || !formData.customerType || isCompleting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  Continue to Goals & Style →
                </button>
              </div>
            )}
            {/* Step 2: Goals & Style */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Step 2: Goals & Style
                  </h2>
                  <p className="text-gray-600 text-lg">Define your objectives and personality</p>
                </div>
                {/* Top 3 Goals - Drag to Rank */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Top 3 goals: (Drag to rank)</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {formData.goals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => {
                          if (formData.rankedGoals.includes(goal)) {
                            setFormData({
                              ...formData,
                              rankedGoals: formData.rankedGoals.filter(g => g !== goal)
                            });
                          } else if (formData.rankedGoals.length < 3) {
                            setFormData({
                              ...formData,
                              rankedGoals: [...formData.rankedGoals, goal]
                            });
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          formData.rankedGoals.includes(goal)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {goal}
                        {formData.rankedGoals.includes(goal) && (
                          <span className="ml-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                            #{formData.rankedGoals.indexOf(goal) + 1}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Brand Personality */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Brand personality: (Multi-select)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {brandPersonalities.map((personality) => (
                      <button
                        key={personality}
                        onClick={() => {
                          if (formData.brandPersonality.includes(personality)) {
                            setFormData({
                              ...formData,
                              brandPersonality: formData.brandPersonality.filter(p => p !== personality)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              brandPersonality: [...formData.brandPersonality, personality]
                            });
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.brandPersonality.includes(personality)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {personality}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Social Media Status */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Current social media:</h3>
                  <div className="space-y-4">
                    {Object.entries(formData.socialMedia).map(([platform, status]) => (
                      <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium capitalize">{platform}:</span>
                        <div className="flex gap-2">
                          {['none', 'some', 'active'].map((level) => (
                            <button
                              key={level}
                              onClick={() => setFormData({
                                ...formData,
                                socialMedia: { ...formData.socialMedia, [platform]: level }
                              })}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                status === level
                                  ? level === 'none' ? 'bg-gray-400 border-gray-400'
                                    : level === 'some' ? 'bg-yellow-400 border-yellow-400'
                                    : 'bg-green-400 border-green-400'
                                  : 'border-gray-300'
                              }`}
                            >
                              {status === level && (
                                level === 'none' ? '⚪' : level === 'some' ? '🟡' : '🟢'
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={isCompleting}
                    className="flex-1 bg-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={formData.rankedGoals.length < 3 || formData.brandPersonality.length === 0 || isCompleting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue to Brand Setup →
                  </button>
                </div>
              </div>
            )}
            {/* Step 3: Brand Setup */}
            {currentStep === 3 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Step 3: Brand Setup
                  </h2>
                  <p className="text-gray-600 text-lg">Final touches for your brand</p>
                </div>
                {/* Logo Upload */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Upload logo:</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-gray-600">Drag & drop your logo here, or click to browse</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
                {/* Brand Colors */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Brand colors:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.brandColors.primary}
                          onChange={(e) => setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, primary: e.target.value }
                          })}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.brandColors.primary}
                          onChange={(e) => setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, primary: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.brandColors.secondary}
                          onChange={(e) => setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, secondary: e.target.value }
                          })}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.brandColors.secondary}
                          onChange={(e) => setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, secondary: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Contact Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Contact info:</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Website:</label>
                      <input
                        type="url"
                        value={formData.contactInfo.website}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: { ...formData.contactInfo, website: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone:</label>
                      <input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: { ...formData.contactInfo, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Social handles:</label>
                      <input
                        type="text"
                        value={formData.contactInfo.social}
                        onChange={(e) => setFormData({
                          ...formData,
                          contactInfo: { ...formData.contactInfo, social: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="@yourbusiness"
                      />
                    </div>
                  </div>
                </div>
                {/* Budget & Timeline */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Budget & timeline:</h3>
                  {/* Budget Slider */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Monthly budget: ${formData.budget}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$0</span>
                      <span>$100</span>
                      <span>$500</span>
                      <span>$1000+</span>
                    </div>
                  </div>
                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Results timeline:</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'quick', emoji: '🏃', label: 'Quick (1-3mo)' },
                        { id: 'steady', emoji: '📈', label: 'Steady (3-6mo)' },
                        { id: 'longterm', emoji: '🏗️', label: 'Long-term (6+mo)' }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setFormData({ ...formData, timeline: option.id })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.timeline === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.emoji}</div>
                          <div className="font-medium text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {(error || hookError) && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="text-red-400">⚠️</div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Onboarding Error
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            {error || hookError}
                          </div>
                          <button 
                            onClick={() => setError(null)}
                            className="text-red-600 underline text-sm mt-2"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isCompleting}
                      className="flex-1 bg-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-all disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleOnboardingComplete}
                      disabled={isCompleting}
                      className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                        isCompleting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
                      }`}
                    >
                      {isCompleting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Completing Setup...
                        </div>
                      ) : (
                        '🚀 Complete Setup & Launch!'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DebugPanel />
    </div>
  );
};