'use client';

import { useState } from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';

export default function StrategyPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('local_market_dominator');

  const strategies = [
    {
      id: 'local_market_dominator',
      name: 'Local Market Dominator',
      description: 'Focus on local community engagement and foot traffic',
      contentMix: { community: 45, educational: 30, behind_scenes: 15, promotional: 10 },
      frequency: '5-6 posts/week'
    },
    {
      id: 'b2b_authority_builder',
      name: 'B2B Authority Builder',
      description: 'Establish thought leadership in your industry',
      contentMix: { educational: 60, expertise: 25, industry_news: 10, promotional: 5 },
      frequency: '3-4 posts/week'
    },
    {
      id: 'creative_storyteller',
      name: 'Creative Storyteller',
      description: 'Build emotional connections through visual narratives',
      contentMix: { visual_storytelling: 50, behind_scenes: 25, user_generated: 15, promotional: 10 },
      frequency: '6-7 posts/week'
    }
  ];

  const currentStrategy = strategies.find(s => s.id === selectedStrategy);

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
            <h1 className="text-3xl font-bold text-gray-900">Content Strategy</h1>
            <p className="text-gray-600 mt-2">Manage and optimize your content strategy</p>
          </div>

          <div className={`grid gap-6 transition-all duration-300 ${
            sidebarCollapsed 
              ? 'grid-cols-1 xl:grid-cols-4' 
              : 'grid-cols-1 lg:grid-cols-3'
          }`}>
            {/* Strategy List */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${
              sidebarCollapsed ? 'xl:col-span-1' : 'lg:col-span-1'
            }`}>
              <h2 className="text-xl font-semibold mb-4">Available Strategies</h2>
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedStrategy === strategy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium">{strategy.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Details */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${
              sidebarCollapsed ? 'xl:col-span-3' : 'lg:col-span-2'
            }`}>
              <h2 className="text-xl font-semibold mb-4">{currentStrategy?.name}</h2>
              <p className="text-gray-600 mb-6">{currentStrategy?.description}</p>

              {/* Content Mix */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Content Mix</h3>
                <div className="space-y-2">
                  {Object.entries(currentStrategy?.contentMix || {}).map(([type, percentage]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize text-gray-700">{type.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Posting Frequency */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Posting Frequency</h3>
                <p className="text-gray-600">{currentStrategy?.frequency}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Apply Strategy
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 