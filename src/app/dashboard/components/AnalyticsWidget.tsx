'use client';

import React, { useState, useEffect } from 'react';
import { smeApi } from '@/lib/sme-api';
import { Card } from '@/components/ui/Card';

// ✅ Proper TypeScript interfaces
interface AnalyticsOverview {
  total_posts: number;
  avg_engagement: number;
  date_range: {
    start: string;
    end: string;
  };
}

interface AnalyticsResponse {
  success: boolean;
  analytics: {
    overview: AnalyticsOverview;
    generation_info: {
      generated_at: string;
    };
  };
}

export const AnalyticsWidget: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      console.log('📊 Loading analytics data...');
      setError(null);
      
      const analyticsData = await smeApi.getAnalytics();
      setAnalytics(analyticsData as unknown as AnalyticsResponse);
      setLastUpdated(new Date());
      console.log('✅ Analytics loaded successfully:', analyticsData);
    } catch (error: any) {
      console.error('❌ Failed to load analytics:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Loading state
  if (isLoading && !analytics) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  // ✅ No data state
  if (!isLoading && !analytics && !error) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground mb-4">Analytics Overview</h3>
      </div>
      {/* Enhanced error handling */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-destructive text-sm font-medium">Failed to load analytics</p>
              <p className="text-destructive text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      {analytics && (
        <div className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-muted rounded">
              <div className="text-2xl font-bold text-foreground">
                {analytics.analytics.overview.total_posts?.toLocaleString() ?? '—'}
              </div>
              <div className="text-sm text-muted-foreground">Total Posts Analyzed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded">
              <div className="text-2xl font-bold text-foreground">
                {analytics.analytics.overview.avg_engagement?.toFixed(1) ?? '—'}
              </div>
              <div className="text-sm text-muted-foreground">Average Engagement</div>
            </div>
          </div>
          {/* Date Range */}
          <div className="text-center p-3 bg-muted rounded">
            <div className="text-sm text-muted-foreground">
              Data Range: {analytics.analytics.overview.date_range?.start ? new Date(analytics.analytics.overview.date_range.start).toLocaleDateString() : '—'} - 
              {analytics.analytics.overview.date_range?.end ? new Date(analytics.analytics.overview.date_range.end).toLocaleDateString() : '—'}
            </div>
          </div>
          {/* Generation Info */}
          <div className="text-xs text-muted-foreground text-center">
            Generated: {analytics.analytics.generation_info?.generated_at ? new Date(analytics.analytics.generation_info.generated_at).toLocaleString() : '—'}
          </div>
          {/* Last Updated Time */}
          {lastUpdated && (
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default AnalyticsWidget;