import { NextRequest, NextResponse } from 'next/server';
import { LinkedInService } from '@/lib/linkedin-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ success: false, error });
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing code' });
  }

  try {
    const linkedinService = new LinkedInService();
    const tokenData = await linkedinService.getAccessToken(code);
    const profile = await linkedinService.getUserProfile(tokenData.access_token);

    // TODO: Store tokenData and profile in your database, associated with the user (using state param)

    // For now, just return the profile and token
    return NextResponse.json({ success: true, profile, tokenData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' });
  }
} 