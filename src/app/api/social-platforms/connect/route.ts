import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UploadPostService } from '@/lib/upload-post-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform } = await request.json();
    
    const uploadPostService = new UploadPostService(
      process.env.UPLOAD_POST_API_KEY!
    );

    // Generate JWT for social account linking
    const jwt = await uploadPostService.generateLinkingJWT(userId);
    
    // Create linking URL
    const linkingUrl = `https://app.upload-post.com/link?jwt=${jwt}&platform=${platform}`;

    return NextResponse.json({ linkingUrl });
  } catch (error) {
    console.error('Social platform connection error:', error);
    return NextResponse.json(
      { error: 'Failed to generate linking URL' },
      { status: 500 }
    );
  }
} 