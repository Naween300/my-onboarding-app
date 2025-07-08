import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    env: {
      hasLinkedInClientId: !!process.env.LINKEDIN_CLIENT_ID,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    }
  });
} 