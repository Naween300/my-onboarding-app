'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Trending Insights</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Trending Insights</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <Button
              key={days}
              variant={selectedTimeframe === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeframeChange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>
      {/* Error/No Data State */}
      {error && (
        <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-6">
          <p className="text-warning text-sm">📊 {error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => fetchTrendingInsights(selectedTimeframe)}>
            Retry
          </Button>
        </div>
      )}
      {/* Trending Content */}
      {trends && (
        <div className="space-y-6">
          {/* Trending Hashtags */}
          {trends.hashtag_trends?.trending_hashtags && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <span className="text-muted-foreground mr-2">#️⃣</span>
                Trending Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(trends.hashtag_trends.trending_hashtags).map(([hashtag, score]) => (
                  <Badge key={String(hashtag)} className="bg-muted text-foreground">
                    {String(hashtag)} <span className="text-muted-foreground">({String(score)})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Popular Keywords */}
          {trends.keyword_trends?.trending_keywords && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <span className="text-muted-foreground mr-2">🔍</span>
                Trending Keywords
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(trends.keyword_trends.trending_keywords).map(([keyword, score]) => (
                  <Card key={String(keyword)} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-foreground font-medium">{String(keyword)}</span>
                    <span className="text-muted-foreground text-sm">Score: {String(score)}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {/* Content Performance */}
          {trends.content_type_performance && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <span className="text-muted-foreground mr-2">📊</span>
                Content Performance
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(trends.content_type_performance).map(([type, data]: [string, any]) => (
                  <Card key={String(type)} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <span className="font-medium text-foreground capitalize">{String(type)} Posts</span>
                      <div className="text-sm text-muted-foreground">
                        Performance boost: +{(data.with_feature_avg - data.without_feature_avg)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-foreground font-semibold">{String(data.with_feature_avg)}</div>
                      <div className="text-xs text-muted-foreground">avg score</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {/* Best Posting Times */}
          {trends.timing_trends?.best_hours && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <span className="text-muted-foreground mr-2">⏰</span>
                Best Posting Times
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Peak Hours</h4>
                  <div className="space-y-1">
                    {Object.entries(trends.timing_trends.best_hours).map(([hour, score]) => (
                      <div key={String(hour)} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{String(hour)}:00</span>
                        <span className="text-foreground font-medium">{String(score)}% effective</span>
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
      <div className="mt-6 pt-4 border-t border-border">
        <Button className="w-full" onClick={() => fetchTrendingInsights(selectedTimeframe)} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Insights'}
        </Button>
      </div>
    </Card>
  );
};

export default TrendingInsightsWidget;