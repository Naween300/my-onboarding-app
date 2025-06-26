'use client';

import { useState } from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';

export default function CalendarPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const scheduledPosts = [
    { id: 1, title: 'Morning motivation post', time: '09:00', platform: 'Instagram' },
    { id: 2, title: 'Product showcase', time: '14:00', platform: 'Facebook' },
    { id: 3, title: 'Industry insights', time: '17:00', platform: 'LinkedIn' }
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
            <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600 mt-2">Schedule and manage your content publishing</p>
          </div>

          {/* Calendar Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Schedule Post
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="p-2 h-20 border border-gray-200 hover:bg-gray-50">
                  <div className="text-sm text-gray-600">{((i % 31) + 1)}</div>
                  {i === 15 && (
                    <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 mt-1">
                      3 posts
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-gray-600">{post.platform} • {post.time}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                      Published
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 