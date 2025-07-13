"use client";

import { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { UserService } from '@/lib/user-service';
import ContentGenerationWidget from './ContentGenerationWidget';
import AnalyticsWidget from './AnalyticsWidget';
import TrendingInsightsWidget from './TrendingInsightsWidget';
import { RSSFeedWidget } from '@/components/RSSFeedWidget';
import ClientOnly from '@/components/ClientOnly';
import SafeRender from '@/components/SafeRender';
import { Button } from '@/components/ui/Button';

export default function DashboardContent() {
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
      loadLocalStorageData();
    }
  }, [isLoaded, user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const onboardingResult = await UserService.getUserOnboardingData(user.id);

      if (onboardingResult.data) {
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
          userBudget: onboardingResult.data.budget
        };
        setOnboardingData(formattedData);
        setBrandName(formattedData.businessName || '');
      } else {
        if (user.unsafeMetadata?.onboardingComplete) {
          setOnboardingData({
            businessName: (user.unsafeMetadata.businessName as string) || 'My Business',
            businessType: (user.unsafeMetadata.businessType as string) || 'General'
          });
          setBrandName((user.unsafeMetadata.businessName as string) || 'My Business');
        } else {
          router.push('/onboarding');
          return;
        }
      }
    } catch (error) {
      if (user.unsafeMetadata?.onboardingComplete) {
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
      const storedBrandName = localStorage.getItem('brandName');
      const storedUserData = localStorage.getItem('userCacheData');
      if (storedBrandName) setBrandName(storedBrandName);
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserProfile(userData);
        setOnboardingData(userData);
      }
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const isFromOnboarding = searchParams.get('onboarding') === 'completed';

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="destructive" className="px-4 py-2 rounded-md" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card shadow-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {brandName} SME Intelligence
            </h1>
            <p className="text-sm text-muted-foreground">AI-Powered Business Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Info Section */}
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Business Type</div>
              <div className="text-sm font-medium text-foreground">
                {onboardingData?.businessType || userProfile?.businessType || 'Not specified'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Customer Focus</div>
              <div className="text-sm font-medium text-foreground">
                {(onboardingData?.customerType || userProfile?.customerType)?.toUpperCase() || 'Not specified'}
              </div>
            </div>
            
            {/* User Avatar and Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Welcome back</div>
                  <div className="text-sm font-medium text-foreground">
                    {user.fullName || user.emailAddresses[0]?.emailAddress}
                  </div>
                </div>
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <SignOutButton>
                  <Button variant="outline" className="px-3 py-1 text-sm">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-foreground text-sm font-medium">
                  {brandName ? brandName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <div className="flex items-center">
              <div className="text-muted-foreground text-2xl mr-3">🏢</div>
              <div>
                <div className="text-sm text-muted-foreground">Business</div>
                <div className="text-lg font-semibold text-foreground">
                  {brandName || onboardingData?.businessName || 'Not set'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <div className="flex items-center">
              <div className="text-muted-foreground text-2xl mr-3">💰</div>
              <div>
                <div className="text-sm text-muted-foreground">Budget</div>
                <div className="text-lg font-semibold text-foreground">
                  ${onboardingData?.budget || onboardingData?.userBudget || userProfile?.userBudget || 'Not set'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <div className="flex items-center">
              <div className="text-muted-foreground text-2xl mr-3">⏱️</div>
              <div>
                <div className="text-sm text-muted-foreground">Timeline</div>
                <div className="text-lg font-semibold text-foreground">
                  {onboardingData?.timeline || userProfile?.timeline || 'Not set'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <div className="flex items-center">
              <div className="text-muted-foreground text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-lg font-semibold text-foreground">
                  {user ? 'Authenticated' : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Rearranged Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Industry News Feed (moved to top priority) */}
          <div className="lg:col-span-2">
            <RSSFeedWidget userBusinessType={onboardingData?.businessType} hideIndustrySelector={true} />
          </div>

          {/* Right Column - Trending Insights */}
          <div className="lg:col-span-1">
            <TrendingInsightsWidget />
          </div>

          {/* Second Row - AI Content Generator (moved down) */}
          <div className="lg:col-span-2">
            <ContentGenerationWidget
              key={`content-gen-${onboardingData?.businessName || 'default'}-${Date.now()}`}
              user={user}
            />
          </div>

          {/* Second Row Right - Analytics Widget */}
          <div className="lg:col-span-1">
            <AnalyticsWidget />
          </div>

          {/* Third Row - Additional Widgets */}
          <div className="lg:col-span-3">
            {/* Any additional widgets you have */}
          </div>
        </div>
      </div>
    </div>
  );
} 