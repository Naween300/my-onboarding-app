'use client';

import React, { useState, useEffect } from 'react';
import { smeApi } from '@/lib/sme-api';

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

  const refreshAnalytics = () => {
    setIsLoading(true);
    loadAnalytics();
  };

  // ✅ Loading state
  if (isLoading && !analytics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // ✅ No data state
  if (!isLoading && !analytics && !error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">No analytics data available</p>
          <button
            onClick={refreshAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load Analytics Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ✅ Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Analytics Overview</h3>
        <button
          onClick={refreshAnalytics}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          <span className={isLoading ? 'animate-spin' : ''}>{isLoading ? '↻' : '🔄'}</span>
          Refresh
        </button>
      </div>
      
      {/* ✅ Enhanced error handling */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Failed to load analytics</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
            <button
              onClick={refreshAnalytics}
              disabled={isLoading}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {analytics && (
        <div className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.analytics.overview.total_posts?.toLocaleString() ?? '—'}
              </div>
              <div className="text-sm text-blue-800">Total Posts Analyzed</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {analytics.analytics.overview.avg_engagement?.toFixed(1) ?? '—'}
              </div>
              <div className="text-sm text-green-800">Average Engagement</div>
            </div>
          </div>

          {/* Date Range */}
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">
              Data Range: {analytics.analytics.overview.date_range?.start ? new Date(analytics.analytics.overview.date_range.start).toLocaleDateString() : '—'} - 
              {analytics.analytics.overview.date_range?.end ? new Date(analytics.analytics.overview.date_range.end).toLocaleDateString() : '—'}
            </div>
          </div>

          {/* Generation Info */}
          <div className="text-xs text-gray-500 text-center">
            Generated: {analytics.analytics.generation_info?.generated_at ? new Date(analytics.analytics.generation_info.generated_at).toLocaleString() : '—'}
          </div>

          {/* ✅ Last Updated Time */}
          {lastUpdated && (
            <div className="text-xs text-gray-500 text-center border-t pt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsWidget;