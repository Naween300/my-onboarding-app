import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UploadPostService } from '@/lib/upload-post-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platforms, text, mediaUrl } = await request.json();
    
    const uploadPostService = new UploadPostService(
      process.env.UPLOAD_POST_API_KEY!
    );

    const result = await uploadPostService.postContent({
      userId,
      platforms,
      text,
      mediaUrl
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Social posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post content' },
      { status: 500 }
    );
  }
} 