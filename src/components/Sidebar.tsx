'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: '🏠',
      description: 'Overview & Analytics'
    },
    {
      id: 'content',
      label: 'Content',
      href: '/content',
      icon: '✨',
      description: 'AI Content Generation'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: '📊',
      description: 'Performance Insights'
    },
    {
      id: 'strategy',
      label: 'Strategy',
      href: '/strategy',
      icon: '🎯',
      description: 'Content Strategy'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      href: '/calendar',
      icon: '📅',
      description: 'Content Calendar'
    },
    {
      id: 'trends',
      label: 'Trends',
      href: '/trends',
      icon: '📈',
      description: 'Market Insights'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SME</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SME Intelligence</h2>
              <p className="text-xs text-gray-500">AI-Powered Insights</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-600">
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile & Sign Out */}
      <div className="border-t border-gray-200 p-4">
        {user && (
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user.fullName || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isCollapsed && (
          <div className="mt-3">
            <SignOutButton>
              <button className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </div>
  );
}; 