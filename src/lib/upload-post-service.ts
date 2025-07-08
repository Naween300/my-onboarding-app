export class UploadPostService {
  private apiKey: string;
  private baseUrl = 'https://api.upload-post.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Create user profile for social account management
  async createUserProfile(userId: string, email: string) {
    const response = await fetch(`${this.baseUrl}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        email: email
      })
    });
    const profileText = await response.text();
    try {
      return JSON.parse(profileText);
    } catch (e) {
      throw new Error('Upload-Post API error (createUserProfile): ' + profileText);
    }
  }

  // Generate JWT for social account linking
  async generateLinkingJWT(userId: string) {
    const response = await fetch(`${this.baseUrl}/profiles/${userId}/jwt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    const jwtText = await response.text();
    try {
      const data = JSON.parse(jwtText);
      return data.jwt;
    } catch (e) {
      throw new Error('Upload-Post API error (generateLinkingJWT): ' + jwtText);
    }
  }

  // Post content to multiple platforms
  async postContent({
    userId,
    platforms,
    text,
    mediaUrl
  }: {
    userId: string;
    platforms: string[];
    text: string;
    mediaUrl?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/uploadposts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        platforms,
        text,
        media_url: mediaUrl
      })
    });
    const postText = await response.text();
    try {
      return JSON.parse(postText);
    } catch (e) {
      throw new Error('Upload-Post API error (postContent): ' + postText);
    }
  }

  // Get user's connected platforms
  async getUserPlatforms(userId: string) {
    const response = await fetch(`${this.baseUrl}/profiles/${userId}/platforms`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    const platformsText = await response.text();
    try {
      return JSON.parse(platformsText);
    } catch (e) {
      throw new Error('Upload-Post API error (getUserPlatforms): ' + platformsText);
    }
  }
} 