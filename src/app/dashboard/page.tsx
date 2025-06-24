'use client';

import { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { UserService } from '@/lib/user-service';
import ContentGenerationWidget from './components/ContentGenerationWidget';
import AnalyticsWidget from './components/AnalyticsWidget';
import TrendingInsightsWidget from './components/TrendingInsightsWidget';
import { RSSFeedWidget } from '@/components/RSSFeedWidget';
import NoSSR from '@/components/NoSSR';
import ClientOnly from '@/components/ClientOnly';
import SafeRender from '@/components/SafeRender';
import dynamic from 'next/dynamic';
import { AuthTest } from '@/components/AuthTest';
import { PerformanceWidget } from './components/PerformanceWidget';

const DashboardContent = dynamic(() => import('./components/DashboardContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
});

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      if (onboardingResult.error) {
        console.warn('⚠️ Profile fetch failed, but allowing dashboard access');
        // Set default/fallback data instead of redirecting
        setOnboardingData({
          businessName: (user.unsafeMetadata?.businessName as string) || 'My Business',
          businessType: (user.unsafeMetadata?.businessType as string) || 'General'
        });
        setBrandName((user.unsafeMetadata?.businessName as string) || 'My Business');
        return;
      }

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
      // ✅ Don't redirect - show error state instead
      setError('Failed to load profile data');
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

  // ✅ Client-only rendering check
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
    <div className="p-6" suppressHydrationWarning>
      {/* Temporary test */}
      <AuthTest />
      {/* Your existing content */}
      <ClientOnly fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
          <div className="text-center" suppressHydrationWarning>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      }>
        <div className="flex flex-col gap-6 w-full px-2 md:px-6">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1">
              <RSSFeedWidget />
            </div>
            <div className="flex-1">
              <TrendingInsightsWidget />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1">
              <AnalyticsWidget />
            </div>
            <div className="flex-1">
              <PerformanceWidget />
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  );
}
