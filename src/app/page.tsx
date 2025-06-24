'use client';

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';
import NoSSR from '@/components/NoSSR';

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if user has completed onboarding
      if (user.publicMetadata?.onboardingComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NoSSR fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <div suppressHydrationWarning>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-center min-h-screen py-12">
              {/* Hero Section */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  SME Intelligence
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  AI-powered business insights and content generation for small and medium enterprises
                </p>
                
                {/* Authentication Buttons for Non-Signed In Users */}
                {!isSignedIn && (
                  <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <SignUpButton mode="modal">
                      <button className="w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 md:py-4 md:text-lg md:px-10">
                        Get Started Free
                      </button>
                    </SignUpButton>
                    
                    <SignInButton mode="modal">
                      <button className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 md:py-4 md:text-lg md:px-10">
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                )}

                {/* Alternative Link for Non-Authenticated Users */}
                {!isSignedIn && (
                  <div className="mt-6">
                    <Link
                      href="/onboarding"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Continue without account (limited features)
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Features Section */}
              <div className="mt-16">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="pt-6">
                    <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="-mt-6">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <span className="text-white text-2xl">🎯</span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                          AI Content Generation
                        </h3>
                        <p className="mt-5 text-base text-gray-500">
                          Generate personalized social media content based on your business profile and industry trends.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="-mt-6">
                        <div className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                          <span className="text-white text-2xl">📊</span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                          Real-time Analytics
                        </h3>
                        <p className="mt-5 text-base text-gray-500">
                          Track your social media performance with comprehensive analytics and insights.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="-mt-6">
                        <div className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                          <span className="text-white text-2xl">📈</span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                          Trending Insights
                        </h3>
                        <p className="mt-5 text-base text-gray-500">
                          Stay ahead with trending topics, hashtags, and keywords relevant to your industry.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="mt-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Why Choose SME Intelligence?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <span className="text-xl">⚡</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-900">Quick Setup</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Get started in just 3 simple steps. No complex configurations required.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                        <span className="text-xl">🤖</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-900">AI-Powered</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Leverage advanced AI to create content and analyze trends automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                        <span className="text-xl">🎨</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-900">Personalized</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Tailored recommendations based on your specific business needs and industry.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                        <span className="text-xl">📱</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-900">Multi-Platform</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Manage all your social media platforms from one unified dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action Section */}
              {!isSignedIn && (
                <div className="mt-16 text-center">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to Transform Your Business?
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Join thousands of SMEs already using AI-powered insights to grow their business.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                      <SignUpButton mode="modal">
                        <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200">
                          Start Free Trial
                        </button>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <button className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors duration-200">
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
    </NoSSR>
  );
}
