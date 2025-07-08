export class TwitterService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.TWITTER_CLIENT_ID!;
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    this.redirectUri = process.env.TWITTER_REDIRECT_URI!;
  }

  // Generate Twitter OAuth authorization URL
  generateAuthUrl(userId: string): string {
    // Use only required scopes for profile fetch
    const scope = 'tweet.read tweet.write users.read';
    const state = `${userId}_${Date.now()}`;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope,
      state,
      code_challenge: 'challenge',
      code_challenge_method: 'plain'
    });
    
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier: 'challenge'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for access token');
    }

    return await response.json();
  }

  // Get user profile information
  async getUserProfile(accessToken: string): Promise<{
    id: string;
    name: string;
    username: string;
    email?: string;
  }> {
    try {
      // Remove email from user.fields - it's not available in Twitter API v2
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Twitter profile API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Twitter profile API error:', errorText);
        throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Twitter profile API response:', data);

      // Twitter API v2 returns data in a nested structure
      if (!data.data) {
        throw new Error('Invalid response format from Twitter API');
      }

      return {
        id: data.data.id,
        name: data.data.name,
        username: data.data.username,
        email: null // Email is not available through Twitter API v2
      };
    } catch (error: any) {
      console.error('Failed to fetch Twitter user profile:', error);
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  // Upload media to Twitter and return media_id
  async uploadMedia(accessToken: string, mediaUrl: string): Promise<string> {
    // Download the image as a buffer
    const imageResponse = await fetch(mediaUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image for Twitter upload');
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Twitter v1.1 media upload endpoint (OAuth 2.0 Bearer Token is supported for app-only auth)
    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // 'Content-Type': 'multipart/form-data' // Let fetch set this automatically
      },
      body: (() => {
        const form = new FormData();
        form.append('media', new Blob([imageBuffer]), 'image.jpg');
        return form;
      })()
    });
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Twitter media upload failed: ${error}`);
    }
    const uploadData = await uploadResponse.json();
    return uploadData.media_id_string;
  }

  // Post tweet content, optionally with media
  async postTweet(accessToken: string, content: string, mediaUrl?: string): Promise<any> {
    // Ensure content fits Twitter's character limit
    const tweetContent = content.length > 280 ? content.substring(0, 277) + '...' : content;
    let media_ids = undefined;
    if (mediaUrl) {
      const mediaId = await this.uploadMedia(accessToken, mediaUrl);
      media_ids = [mediaId];
    }
    const body: any = { text: tweetContent };
    if (media_ids) {
      body.media = { media_ids };
    }
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter posting failed: ${error.detail || 'Unknown error'}`);
    }
    return await response.json();
  }
} 