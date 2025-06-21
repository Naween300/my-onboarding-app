'use client';

import React, { useState, useEffect } from 'react';
import { smeApi, AnalyticsData } from '@/lib/sme-api';

export const AnalyticsWidget: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load analytics data on component mount and set up auto-refresh
  useEffect(() => {
    loadAnalytics();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      console.log('📊 Loading analytics data...');
      setError(null);
      
      const analytics = await smeApi.getAnalytics();
      setAnalyticsData(analytics);
      setLastUpdated(new Date());
      console.log('✅ Analytics loaded successfully:', analytics);
    } catch (error) {
      console.error('❌ Failed to load analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = () => {
    setIsLoading(true);
    loadAnalytics();
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h2 className="text-xl font-semibold text-gray-900">Real-time Analytics</h2>
          <p className="text-sm text-gray-600">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshAnalytics}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '↻'} Refresh
          </button>
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      {analyticsData ? (
        <div className="space-y-6">
          {/* Performance Metrics */}
          {analyticsData.performance && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.performance.likes?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Likes</div>
                  <div className="text-xs text-blue-500 mt-1">👍 Engagement</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.performance.comments?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Comments</div>
                  <div className="text-xs text-green-500 mt-1">💬 Interaction</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.performance.shares?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Shares</div>
                  <div className="text-xs text-purple-500 mt-1">🔄 Reach</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.performance.engagement_rate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-orange-600 font-medium">Engagement</div>
                  <div className="text-xs text-orange-500 mt-1">📈 Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Key Insights */}
          {analyticsData.insights && analyticsData.insights.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
              <div className="space-y-3">
                {analyticsData.insights.slice(0, 5).map((insight, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">💡 {insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analyticsData.recommendations && analyticsData.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {analyticsData.recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">🎯 {recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-500">No analytics data available</p>
          <button
            onClick={refreshAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load Analytics
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalyticsWidget;