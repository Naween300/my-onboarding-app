'use client';

import { useState } from 'react';
import { SimpleSidebar } from './SimpleSidebar';

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export const DynamicLayout = ({ children }: DynamicLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleSidebar onToggle={setSidebarCollapsed} />
      
      {/* Main Content with Dynamic Margin */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <main className="p-6">
          {/* Content Header with Dynamic Spacing */}
          <div className={`mb-6 transition-all duration-300 ${
            sidebarCollapsed ? 'max-w-full' : 'max-w-7xl'
          }`}>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your business overview.</p>
          </div>

          {/* Dynamic Grid Layout */}
          <div className={`transition-all duration-300 ${
            sidebarCollapsed 
              ? 'grid grid-cols-1 xl:grid-cols-4 gap-6' 
              : 'grid grid-cols-1 lg:grid-cols-3 gap-6'
          }`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 