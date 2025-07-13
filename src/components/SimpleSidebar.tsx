'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
    <aside className={`fixed top-0 left-0 h-full bg-background shadow-lg border-r border-border z-50 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } p-0 flex flex-col`} role="complementary" aria-label="Sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-muted to-muted-foreground rounded-lg flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">SME</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">SME Intelligence</h2>
              <p className="text-xs text-muted-foreground">AI-Powered Insights</p>
            </div>
          </div>
        )}
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="rounded-lg"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-muted-foreground text-lg">
            {isCollapsed ? '→' : '←'}
          </span>
        </Button>
        {/* Collapsed Logo */}
        {isCollapsed && (
          <div className="absolute left-4 top-4">
            <div className="w-8 h-8 bg-gradient-to-r from-muted to-muted-foreground rounded-lg flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">SME</span>
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
                className={`no-underline group relative flex items-center rounded-lg transition-all duration-200 font-medium
    ${isCollapsed ? 'justify-center p-3' : 'p-3'}
    ${pathname === item.href
      ? isCollapsed
        ? 'bg-muted text-foreground'
        : 'bg-muted text-foreground border-l-4 border-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }
  `}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <div>{item.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  </div>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-foreground text-background text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                    {/* Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-foreground rotate-45"></div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* User Section */}
      {user && (
        <Card className="border-t border-border p-4 rounded-none shadow-none bg-card">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <Avatar>
              <AvatarImage src={user.imageUrl} alt="User" />
              <AvatarFallback>{user.fullName ? user.fullName.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{user.fullName}</div>
                <div className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <SignOutButton>
              <Button variant="ghost" className="w-full flex items-center space-x-2 text-sm">
                <span>🚪</span>
                <span>Sign Out</span>
              </Button>
            </SignOutButton>
          )}
          {/* Collapsed Sign Out */}
          {isCollapsed && (
            <SignOutButton>
              <Button variant="ghost" size="icon" title="Sign Out">
                <span className="text-lg">🚪</span>
              </Button>
            </SignOutButton>
          )}
        </Card>
      )}
    </aside>
  );
}; 