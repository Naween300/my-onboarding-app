'use client';

import { useState, useEffect } from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';

export default function AnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your content performance and engagement</p>
          </div>
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Detailed analytics and insights coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 