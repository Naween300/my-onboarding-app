'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/contexts/SupabaseContext';

export const TrendingInsightsWidget = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(30);

  // ✅ Fetch trending insights using your exact API response structure
  const fetchTrendingInsights = async (days = 30) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📈 Fetching trends for ${days} days...`);
      
      const response = await fetch(`http://localhost:8000/api/trends/?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      // ✅ Handle your exact response structure
      if (data.success && data.trends) {
        if (data.trends.message) {
          // Handle "No data from last X days" case
          setError(data.trends.message);
          setTrends(null);
        } else {
          // Handle actual trends data
          setTrends(data.trends);
        }
      } else {
        throw new Error('Invalid response structure');
      }

    } catch (error: any) {
      console.error('❌ Backend error:', error);
      setError(`Backend unavailable: ${error.message}`);
      setTrends(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingInsights(selectedTimeframe);
  }, [selectedTimeframe]);

  const handleTimeframeChange = (days: number) => {
    setSelectedTimeframe(days);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Trending Insights</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Trending Insights</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => handleTimeframeChange(days)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTimeframe === days
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Error/No Data State */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700 text-sm">📊 {error}</p>
          <button 
            onClick={() => fetchTrendingInsights(selectedTimeframe)}
            className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ✅ Trending Content - Based on your exact API structure */}
      {trends && (
        <div className="space-y-6">
          {/* Trending Hashtags */}
          {trends.hashtag_trends?.trending_hashtags && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-purple-500 mr-2">#️⃣</span>
                Trending Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(trends.hashtag_trends.trending_hashtags).map(([hashtag, score]) => (
                  <span
                    key={String(hashtag)}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {String(hashtag)} <span className="text-purple-600">({String(score)})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popular Keywords */}
          {trends.keyword_trends?.trending_keywords && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-blue-500 mr-2">🔍</span>
                Trending Keywords
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(trends.keyword_trends.trending_keywords).map(([keyword, score]) => (
                  <div key={String(keyword)} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-blue-800 font-medium">{String(keyword)}</span>
                    <span className="text-blue-600 text-sm">Score: {String(score)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Performance */}
          {trends.content_type_performance && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-green-500 mr-2">📊</span>
                Content Performance
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(trends.content_type_performance).map(([type, data]: [string, any]) => (
                  <div key={String(type)} className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div>
                      <span className="font-medium text-green-800 capitalize">{String(type)} Posts</span>
                      <div className="text-sm text-green-600">
                        Performance boost: +{(data.with_feature_avg - data.without_feature_avg)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-800 font-semibold">{String(data.with_feature_avg)}</div>
                      <div className="text-xs text-green-600">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Posting Times */}
          {trends.timing_trends?.best_hours && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-orange-500 mr-2">⏰</span>
                Best Posting Times
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Peak Hours</h4>
                  <div className="space-y-1">
                    {Object.entries(trends.timing_trends.best_hours).map(([hour, score]) => (
                      <div key={String(hour)} className="flex justify-between text-sm">
                        <span className="text-gray-700">{String(hour)}:00</span>
                        <span className="text-orange-600 font-medium">{String(score)}% effective</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refresh button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => fetchTrendingInsights(selectedTimeframe)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>
    </div>
  );
};

export default TrendingInsightsWidget;