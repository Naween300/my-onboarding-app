'use client';

import { useState } from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';

export default function TrendsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');

  const trendingHashtags = [
    { tag: '#DigitalMarketing', mentions: 12500, change: '+15%' },
    { tag: '#SocialMedia', mentions: 9800, change: '+8%' },
    { tag: '#ContentStrategy', mentions: 7200, change: '+22%' },
    { tag: '#BusinessGrowth', mentions: 5600, change: '+5%' }
  ];

  const trendingTopics = [
    { topic: 'AI in Marketing', score: 95, trend: 'up' },
    { topic: 'Video Content', score: 88, trend: 'up' },
    { topic: 'Influencer Marketing', score: 76, trend: 'down' },
    { topic: 'Social Commerce', score: 82, trend: 'up' }
  ];

  return (
    <>
      <SimpleSidebar onToggle={setSidebarCollapsed} />
      <div className={`p-6 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className={`mx-auto transition-all duration-300 ${
          sidebarCollapsed ? 'max-w-7xl' : 'max-w-6xl'
        }`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Market Trends</h1>
            <p className="text-gray-600 mt-2">Stay ahead with the latest industry insights</p>
          </div>

          <div className="mb-6">
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid gap-6 mb-6 transition-all duration-300 ${
            sidebarCollapsed 
              ? 'grid-cols-1 xl:grid-cols-3' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Trending Hashtags</h2>
              <div className="space-y-3">
                {trendingHashtags.map((hashtag, index) => (
                  <div key={hashtag.tag} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-blue-600">{hashtag.tag}</p>
                        <p className="text-sm text-gray-600">{hashtag.mentions.toLocaleString()} mentions</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">{hashtag.change}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Trending Topics</h2>
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{topic.topic}</p>
                      <p className="text-sm text-gray-600">Trend Score: {topic.score}/100</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${topic.score}%` }}
                        ></div>
                      </div>
                      <span className={`text-lg ${topic.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {topic.trend === 'up' ? '↗️' : '↘️'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {sidebarCollapsed && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                    Export Trends Report
                  </button>
                  <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    Set Trend Alerts
                  </button>
                  <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                    Compare Periods
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Market Insights</h2>
            <div className={`grid gap-6 transition-all duration-300 ${
              sidebarCollapsed 
                ? 'grid-cols-1 md:grid-cols-4' 
                : 'grid-cols-1 md:grid-cols-3'
            }`}>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">+23%</div>
                <p className="text-sm text-gray-600">Video Content Engagement</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+18%</div>
                <p className="text-sm text-gray-600">Social Commerce Growth</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">+31%</div>
                <p className="text-sm text-gray-600">AI Tool Adoption</p>
              </div>
              {sidebarCollapsed && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">+27%</div>
                  <p className="text-sm text-gray-600">Mobile Engagement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 