'use client';

import { useState, useEffect } from 'react';

export const PerformanceWidget = () => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analytics/performance');
      const data = await response.json();
      
      if (data.success && data.metrics) {
        setPerformance(data);
      }
    } catch (error) {
      console.error('Performance fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      
      {performance && (
        <div className="space-y-4">
          {/* Engagement Stats */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Engagement Statistics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">
                  {performance.metrics.engagement_stats.avg_likes.toFixed(1)}
                </div>
                <div className="text-xs text-purple-800">Avg Likes</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {performance.metrics.engagement_stats.avg_comments.toFixed(1)}
                </div>
                <div className="text-xs text-blue-800">Avg Comments</div>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Content Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Posts with Images:</span>
                <span className="font-medium">{performance.metrics.content_stats.posts_with_images.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Posts with Videos:</span>
                <span className="font-medium">{performance.metrics.content_stats.posts_with_videos.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Text Length:</span>
                <span className="font-medium">{performance.metrics.content_stats.avg_text_length.toFixed(0)} chars</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 