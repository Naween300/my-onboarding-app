'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/DashboardLayout';
// At the top of your dashboard page, verify this line exists:



// ✅ Dynamic import to prevent SSR issues
const OnboardingFlow = dynamic(() => import('./components/OnboardingFlow').then(mod => ({ default: mod.OnboardingFlow })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading onboarding...</p>
      </div>
    </div>
  )
});

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('🔍 Onboarding Page Debug:', {
      userLoaded: isLoaded,
      userExists: !!user,
      userId: user?.id,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server'
    });
  }, [isLoaded, user]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return <OnboardingFlow />;
}
