'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

export const SimpleSidebar = ({ onToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', description: 'Overview & Analytics' },
    { href: '/content', label: 'Content', icon: '✨', description: 'AI Generation' },
    { href: '/analytics', label: 'Analytics', icon: '📊', description: 'Performance' },
    { href: '/strategy', label: 'Strategy', icon: '🎯', description: 'Content Plans' },
    { href: '/calendar', label: 'Calendar', icon: '📅', description: 'Schedule' },
    { href: '/trends', label: 'Trends', icon: '📈', description: 'Market Insights' },
  ];

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 z-50 transition-all duration-300 ${
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
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-gray-600 text-lg">
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
        
        {/* Collapsed Logo */}
        {isCollapsed && (
          <div className="absolute left-4 top-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SME</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group relative flex items-center p-3 rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-300">{item.description}</div>
                    {/* Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <img 
              src={user.imageUrl} 
              alt="User" 
              className="w-8 h-8 rounded-full flex-shrink-0" 
              title={isCollapsed ? user.fullName || 'User' : undefined}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{user.fullName}</div>
                <div className="text-xs text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</div>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <SignOutButton>
              <button className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          )}
          
          {/* Collapsed Sign Out */}
          {isCollapsed && (
            <SignOutButton>
              <button 
                className="w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <span className="text-lg">🚪</span>
              </button>
            </SignOutButton>
          )}
        </div>
      )}
    </div>
  );
}; 