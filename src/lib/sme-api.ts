// src/lib/sme-api.ts
const API_BASE_URL = 'http://localhost:8000';

export interface ContentGenerationRequest {
  industry: string;
  business_type: string;
  target_audience: string;
  brand_voice: string;
  target_date: string;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string;
  image_url?: string;
  posting_strategy: string;
  trending_insights: string[];
  analytics: any;
}

export interface AnalyticsData {
  performance: {
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface TrendsData {
  trending_topics: string[];
  hashtags: string[];
  keywords: string[];
  industry_insights: string[];
}

class SMEApiService {
  private async fetchAPI(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      console.log(`🔗 Calling API: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Content Generation
  async generateContent(data: ContentGenerationRequest): Promise<GeneratedContent> {
    return this.fetchAPI('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return this.fetchAPI('/api/analytics/');
  }

  async getPerformanceMetrics() {
    return this.fetchAPI('/api/analytics/performance');
  }

  // Trends
  async getTrends(days: number = 30): Promise<TrendsData> {
    return this.fetchAPI(`/api/trends/?days=${days}`);
  }

  async getTrendingHashtags(limit: number = 10) {
    return this.fetchAPI(`/api/trends/hashtags?limit=${limit}`);
  }

  async getTrendingKeywords(limit: number = 20) {
    return this.fetchAPI(`/api/trends/keywords?limit=${limit}`);
  }

  // Health check
  async testConnection() {
    return this.fetchAPI('/api/health/');
  }
}

export const smeApi = new SMEApiService();
