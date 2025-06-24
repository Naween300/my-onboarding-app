"use client";

import dynamic from 'next/dynamic';

const SignIn = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.SignIn })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
      <div className="max-w-md w-full" suppressHydrationWarning>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to SME Intelligence
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to access your AI-powered business dashboard
          </p>
        </div>
        <SignIn redirectUrl="/dashboard" />
      </div>
    </div>
  )
}
