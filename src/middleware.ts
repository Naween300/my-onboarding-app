import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api/webhooks(.*)'
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    console.log('🔄 Redirecting to sign-in - no user ID');
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // ✅ Temporary fix - allow dashboard access for testing (uncomment if needed)
  // if (req.nextUrl.pathname === '/dashboard' && userId) {
  //   console.log('✅ Allowing dashboard access for testing');
  //   return NextResponse.next()
  // }

  // ✅ Check multiple sources for onboarding completion
  const metadata = sessionClaims?.metadata as { onboardingComplete?: boolean } | undefined;
  const unsafeMetadata = sessionClaims?.unsafeMetadata as { onboardingComplete?: boolean } | undefined;
  
  const hasCompletedOnboarding = 
    metadata?.onboardingComplete || 
    unsafeMetadata?.onboardingComplete ||
    req.nextUrl.searchParams.get('completed') || // Check URL parameter
    req.nextUrl.searchParams.get('manual'); // Check manual completion parameter

  console.log('🔍 Middleware check:', {
    path: req.nextUrl.pathname,
    userId: userId ? 'Present' : 'Missing',
    onboardingComplete: hasCompletedOnboarding,
    urlCompleted: req.nextUrl.searchParams.get('completed'),
    manualCompletion: req.nextUrl.searchParams.get('manual'),
    sessionClaims: metadata || unsafeMetadata
  });

  // ✅ Special handling for dashboard with completion parameter
  if (req.nextUrl.pathname === '/dashboard' && (req.nextUrl.searchParams.get('completed') || req.nextUrl.searchParams.get('manual'))) {
    console.log('✅ Allowing dashboard access with completion parameter');
    return NextResponse.next()
  }

  // If user hasn't completed onboarding and isn't on onboarding page
  if (!hasCompletedOnboarding && !isOnboardingRoute(req) && req.nextUrl.pathname !== '/onboarding') {
    console.log('🔄 Redirecting to onboarding - not completed');
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // If user has completed onboarding but is on onboarding page
  if (hasCompletedOnboarding && isOnboardingRoute(req)) {
    console.log('🔄 Redirecting to dashboard - onboarding already completed');
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  console.log('✅ Allowing access to:', req.nextUrl.pathname);
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
