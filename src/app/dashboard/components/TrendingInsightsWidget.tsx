'use client';

import React, { useState, useEffect } from 'react';
import { smeApi, TrendsData } from '@/lib/sme-api';

export const TrendingInsightsWidget: React.FC = () => {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Load user profile for industry-specific trends
    const userCacheData = localStorage.getItem('userCacheData');
    if (userCacheData) {
      setUserProfile(JSON.parse(userCacheData));
    }
    
    loadTrends();
  }, [selectedPeriod]);

  const loadTrends = async () => {
    try {
      console.log(`📈 Loading trends for ${selectedPeriod} days...`);
      setError(null);
      setIsLoading(true);

      // Load trends, hashtags, and keywords in parallel
      const [trends, hashtagsData, keywordsData] = await Promise.all([
        smeApi.getTrends(selectedPeriod),
        smeApi.getTrendingHashtags(10),
        smeApi.getTrendingKeywords(20)
      ]);

      setTrendsData(trends);
      setHashtags(hashtagsData);
      setKeywords(keywordsData);
      
      console.log('✅ Trends loaded successfully:', { trends, hashtagsData, keywordsData });
    } catch (error) {
      console.error('❌ Failed to load trends:', error);
      setError(error instanceof Error ? error.message : 'Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrends = () => {
    loadTrends();
  };

  if (isLoading && !trendsData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Trending Insights</h2>
          <p className="text-sm text-gray-600">
            {userProfile?.businessType && `Relevant to ${userProfile.businessType} industry`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <button
            onClick={refreshTrends}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '↻'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Trending Topics */}
        {trendsData?.trending_topics && trendsData.trending_topics.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔥</span>
              Trending Topics
            </h3>
            <div className="space-y-2">
              {trendsData.trending_topics.slice(0, 5).map((topic, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">#{index + 1} {topic}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Hashtags */}
        {hashtags && hashtags.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">#️⃣</span>
              Trending Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.slice(0, 8).map((hashtag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer"
                >
                  #{typeof hashtag === 'string' ? hashtag : hashtag.tag || hashtag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trending Keywords */}
        {keywords && keywords.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔍</span>
              Trending Keywords
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {keywords.slice(0, 10).map((keyword, index) => (
                <div key={index} className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-700">
                    {typeof keyword === 'string' ? keyword : keyword.keyword || keyword.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Insights */}
        {trendsData?.industry_insights && trendsData.industry_insights.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💼</span>
              Industry Insights
            </h3>
            <div className="space-y-2">
              {trendsData.industry_insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">💡 {insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              📋 Copy Hashtags
            </button>
            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
              💡 Get Content Ideas
            </button>
            <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
              📊 Detailed Report
            </button>
          </div>
        </div>
      </div>

      {!trendsData && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📈</div>
          <p className="text-gray-500">No trending data available</p>
          <button
            onClick={refreshTrends}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Load Trends
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendingInsightsWidget;