import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/',
  '/api(.*)'
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  const url = new URL(request.url)
  
  // ✅ Bypass for immediate post-completion redirect
  if (url.searchParams.get('onboarding') === 'completed' && userId) {
    console.log('🔄 Bypassing middleware check for completed onboarding');
    return;
  }
  
  // Allow public routes
  if (isPublicRoute(request)) {
    return
  }

  // Protect all routes for authenticated users
  if (!userId) {
    return (await auth()).redirectToSignIn()
  }

  // ✅ CRITICAL: Add environment variable check before database operations
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing! Database checks will be skipped');
    // Allow access but log warning
    return;
  }

  // ✅ Enhanced database check with error handling
  const performDatabaseCheck = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: onboardingData, error } = await supabase
        .from('onboarding')
        .select('clerk_user_id')
        .eq('clerk_user_id', userId)
        .single();
      
      if (error) throw error;
      return onboardingData;
    } catch (error) {
      console.error('❌ Database check failed:', error);
      return null;
    }
  };

  // ✅ Check onboarding status from database instead of session claims
  if (userId && !isOnboardingRoute(request)) {
    const onboardingData = await performDatabaseCheck();
    
    if (!onboardingData) {
      console.log('🔄 Redirecting to onboarding - not found in database');
      return Response.redirect(new URL('/onboarding', request.url));
    }
  }
  
  // ✅ If user is on onboarding page but already completed (database check)
  if (userId && isOnboardingRoute(request)) {
    const onboardingData = await performDatabaseCheck();
    
    if (onboardingData) {
      console.log('🚀 Onboarding complete in database, redirecting to dashboard');
      return Response.redirect(new URL('/dashboard', request.url));
    }
  }

  return
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
