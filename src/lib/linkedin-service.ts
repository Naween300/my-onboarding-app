export class LinkedInService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID!;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI!;
  }

  // Generate LinkedIn OAuth authorization URL
  generateAuthUrl(userId: string): string {
    const scope = 'openid profile email w_member_social';
    const state = `user_${userId}_${Date.now()}`;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope
    });
    
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  }> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for access token');
    }

    return await response.json();
  }

  // Get user profile information
  async getUserProfile(accessToken: string): Promise<{
    sub: string;
    name: string;
    email: string;
    picture?: string;
  }> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  }

  // Post text content to LinkedIn
  async postTextContent(accessToken: string, content: string): Promise<any> {
    const userProfile = await this.getUserProfile(accessToken);
    const authorUrn = `urn:li:person:${userProfile.sub}`;

    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn posting failed: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  }
} 