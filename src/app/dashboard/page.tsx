'use client';

import { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { UserService } from '@/lib/user-service';
import ContentGenerationWidget from './components/ContentGenerationWidget';
import AnalyticsWidget from './components/AnalyticsWidget';
import TrendingInsightsWidget from './components/TrendingInsightsWidget';
import NoSSR from '@/components/NoSSR';
import ClientOnly from '@/components/ClientOnly';
import SafeRender from '@/components/SafeRender';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    } else if (isLoaded && !user) {
      // Fallback to localStorage for non-authenticated users
      loadLocalStorageData();
    }
  }, [isLoaded, user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      console.log('👤 Loading user data for:', user.id);
      
      const onboardingResult = await UserService.getUserOnboardingData(user.id);

      if (onboardingResult.data) {
        // Convert and set onboarding data
        const formattedData = {
          businessType: onboardingResult.data.business_type,
          businessName: onboardingResult.data.business_name,
          locationType: onboardingResult.data.location_type,
          location: onboardingResult.data.location,
          customerType: onboardingResult.data.customer_type,
          goals: onboardingResult.data.goals,
          brandPersonality: onboardingResult.data.brand_personality,
          socialMediaPresence: onboardingResult.data.social_media_presence,
          brandColors: onboardingResult.data.brand_colors,
          contactInfo: onboardingResult.data.contact_info,
          budget: onboardingResult.data.budget,
          timeline: onboardingResult.data.timeline,
          userBudget: onboardingResult.data.budget // For backward compatibility
        };
        
        setOnboardingData(formattedData);
        setBrandName(formattedData.businessName || '');
        console.log('✅ Onboarding data loaded:', formattedData);
      } else {
        // ✅ Handle missing onboarding data gracefully
        console.warn('⚠️ No onboarding data found, but user has completion metadata');
        
        // Check if user metadata indicates completion
        if (user.unsafeMetadata?.onboardingComplete) {
          console.log('✅ User metadata shows onboarding complete, allowing dashboard access');
          // Set default/empty data structure
          setOnboardingData({
            businessName: (user.unsafeMetadata.businessName as string) || 'My Business',
            businessType: (user.unsafeMetadata.businessType as string) || 'General'
          });
          setBrandName((user.unsafeMetadata.businessName as string) || 'My Business');
        } else {
          console.log('⚠️ No onboarding data and no completion metadata, redirecting');
          router.push('/onboarding');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      
      // ✅ Don't redirect on error if user has completion metadata
      if (user.unsafeMetadata?.onboardingComplete) {
        console.log('✅ Using fallback data from user metadata');
        setOnboardingData({
          businessName: (user.unsafeMetadata.businessName as string) || 'My Business',
          businessType: (user.unsafeMetadata.businessType as string) || 'General'
        });
        setBrandName((user.unsafeMetadata.businessName as string) || 'My Business');
      } else {
        setError('Failed to load user data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalStorageData = () => {
    try {
      console.log('📥 Loading data from localStorage (fallback)');
      const storedBrandName = localStorage.getItem('brandName');
      const storedUserData = localStorage.getItem('userCacheData');
      
      if (storedBrandName) {
        setBrandName(storedBrandName);
      }
      
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserProfile(userData);
        setOnboardingData(userData);
        console.log('👤 User profile loaded from localStorage:', userData);
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFromOnboarding = searchParams.get('onboarding') === 'completed';

  // Show loading state while Clerk is loading or data is being fetched
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <NoSSR fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <div suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          {/* Enhanced Welcome Banner */}
          {isFromOnboarding && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-6 mb-6">
              <div className="flex items-center">
                <div className="text-green-400 text-3xl mr-4">🎉</div>
                <div>
                  <h2 className="text-lg font-semibold text-green-800">
                    Welcome to your AI-powered dashboard, {brandName || user?.firstName}!
                  </h2>
                  <p className="text-sm text-green-700 mt-1">
                    Your personalized SME Intelligence is ready with content generation, analytics, and trending insights.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Dashboard Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {brandName ? `${brandName} SME Intelligence` : 'SME Intelligence Dashboard'}
                  </h1>
                  <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    AI-Powered
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* User Info Section */}
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Business Type</div>
                    <div className="text-sm font-medium text-gray-900">
                      {onboardingData?.businessType || userProfile?.businessType || 'Not specified'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Customer Focus</div>
                    <div className="text-sm font-medium text-gray-900">
                      {(onboardingData?.customerType || userProfile?.customerType)?.toUpperCase() || 'Not specified'}
                    </div>
                  </div>
                  
                  {/* User Avatar and Actions */}
                  {user ? (
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Welcome back</div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || user.emailAddresses[0]?.emailAddress}
                        </div>
                      </div>
                      <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <SignOutButton>
                        <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                          Sign Out
                        </button>
                      </SignOutButton>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {brandName ? brandName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="text-blue-500 text-2xl mr-3">🏢</div>
                  <div>
                    <div className="text-sm text-gray-500">Business</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {brandName || onboardingData?.businessName || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="text-green-500 text-2xl mr-3">💰</div>
                  <div>
                    <div className="text-sm text-gray-500">Budget</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${onboardingData?.budget || onboardingData?.userBudget || userProfile?.userBudget || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="text-purple-500 text-2xl mr-3">⏱️</div>
                  <div>
                    <div className="text-sm text-gray-500">Timeline</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {onboardingData?.timeline || userProfile?.timeline || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <div className="text-orange-500 text-2xl mr-3">🎯</div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="text-lg font-semibold text-green-600">
                      {user ? 'Authenticated' : 'Active'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Left Side (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Widget A: Content Generation */}
                <SafeRender fallback="Content generation widget unavailable">
                  <ContentGenerationWidget userProfile={onboardingData || userProfile} />
                </SafeRender>
                
                {/* Widget B: Analytics */}
                <SafeRender fallback="Analytics widget unavailable">
                  <AnalyticsWidget />
                </SafeRender>
              </div>

              {/* Sidebar - Right Side (1/3 width) */}
              <div className="space-y-6">
                {/* Widget C: Trending Insights */}
                <TrendingInsightsWidget />
                
                {/* Business Profile Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Business Profile
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Industry:</span>
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {onboardingData?.businessType || userProfile?.businessType || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Target Market:</span>
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {(onboardingData?.customerType || userProfile?.customerType)?.toUpperCase() || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Location Type:</span>
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {onboardingData?.locationType || userProfile?.locationType || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Budget:</span>
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        ${onboardingData?.budget || onboardingData?.userBudget || userProfile?.userBudget || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Timeline:</span>
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {onboardingData?.timeline || userProfile?.timeline || 'Not set'}
                      </span>
                    </div>
                    {user && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Account:</span>
                        <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          Authenticated
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                      📝 Edit Profile
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                      🎯 Generate Content Strategy
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors">
                      📊 View Detailed Analytics
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors">
                      📈 Export Trends Report
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
                      📅 Schedule Content
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      ⚙️ Settings
                    </button>
                  </div>
                </div>

                {/* Help & Support */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Need Help?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get the most out of your SME Intelligence dashboard with our guides and support.
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      📚 Guide
                    </button>
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                      💬 Support
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500">
              <p>Powered by SME Intelligence API • Last updated: {new Date().toLocaleString()}</p>
              {user && (
                <p className="mt-1">Authenticated user: {user.emailAddresses[0]?.emailAddress}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </NoSSR>
  );
}
