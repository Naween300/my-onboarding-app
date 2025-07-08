"use client";

import { useState, useEffect } from 'react';
import { SimpleSidebar } from '@/components/SimpleSidebar';
import { useUser } from '@clerk/nextjs';

interface DailyContent {
  id: string;
  post_date: string;
  content_type: string;
  platform: string;
  optimal_time: string;
  caption: string;
  hashtags: string;
  cta: string;
  image_description: string;
  status: string;
}

interface ContentCalendar {
  id: string;
  month: number;
  year: number;
  daily_content: DailyContent[];
}

export default function CalendarPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [selectedContent, setSelectedContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Set the date only on the client side to avoid hydration mismatch
    setCurrentDate(new Date());
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('🔐 Auth state:', { user: !!user, isLoaded, userId: user?.id });
    console.log('📅 Current month/year:', { currentMonth: currentDate?.getMonth() ?? -1, currentYear: currentDate?.getFullYear() ?? -1 });
    
    if (isLoaded && user && currentDate) {
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      loadCalendar(currentMonth, currentYear);
    }
  }, [user, isLoaded, currentDate]);

  const loadCalendar = async (month: number, year: number) => {
    console.log('🔍 Loading calendar for:', { month, year, userId: user?.id });
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/calender/${month}/${year}`);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      const data = await response.json();
      console.log('📊 Raw calendar data:', data);
      console.log('📝 Daily content array:', data?.daily_content);
      console.log('📝 Content count:', data?.daily_content?.length);
      
      if (data?.daily_content?.length > 0) {
        console.log('📅 Sample content item:', data.daily_content[0]);
        console.log('📅 All post dates:', data.daily_content.map((c: DailyContent) => c.post_date));
      }
      
      setCalendar(data);
    } catch (error: any) {
      console.error('💥 Load calendar error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = async (month: number, year: number) => {
    console.log('🚀 Generating calendar for:', { month, year });
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calender/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      });
      
      console.log('📡 Generate response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Generate error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Calendar generated:', data);
      
      if (data.success) {
        setCalendar(data.calendar);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Failed to generate calendar:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const contentTypeColors = {
    community: '#4CAF50',
    educational: '#2196F3',
    behind_scenes: '#FF9800',
    promotional: '#F44336',
    local_community: '#4CAF50',
    educational_tips: '#2196F3',
    educational_insights: '#2196F3'
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendarGrid = () => {
    if (!currentDate) return null;
    
    console.log('🎨 Rendering calendar grid');
    console.log('📊 Calendar data:', calendar);
    console.log('📊 Daily content for rendering:', calendar?.daily_content);
    
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 h-20 border border-gray-200 bg-gray-100">
          <span className="text-xs text-gray-400">Empty</span>
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayContent = calendar?.daily_content?.find(content => {
        console.log(`🔍 Comparing ${content.post_date} with ${dateStr}`);
        return content.post_date === dateStr;
      });

      console.log(`📅 Day ${day} (${dateStr}):`, dayContent ? 'Has content' : 'No content');

      days.push(
        <div
          key={day}
          className={`p-2 h-20 border border-gray-200 hover:bg-gray-50 cursor-pointer ${
            dayContent ? 'bg-blue-50 border-blue-200' : 'bg-white'
          }`}
          onClick={() => dayContent && setSelectedContent(dayContent)}
        >
          <div className="text-sm text-gray-600 font-medium">{day}</div>
          {dayContent ? (
            <div className="mt-1">
              <div className="text-xs bg-blue-600 text-white rounded px-1 py-0.5 mb-1 truncate">
                {dayContent.content_type}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {dayContent.platform} • {dayContent.optimal_time}
              </div>
            </div>
          ) : (
            <div className="text-xs text-red-400">No content</div>
          )}
        </div>
      );
    }

    return days;
  };

  // Show loading state until client-side hydration is complete
  if (!isClient || !currentDate) {
    return (
      <>
        <SimpleSidebar onToggle={setSidebarCollapsed} />
        <div className="p-6 ml-64">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </>
    );
  }

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Loading state
  if (loading) {
    return (
      <>
        <SimpleSidebar onToggle={setSidebarCollapsed} />
        <div className={`p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading calendar...</span>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <SimpleSidebar onToggle={setSidebarCollapsed} />
        <div className={`p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-center p-8">
            <h3 className="text-lg font-medium text-red-600 mb-4">Error Loading Calendar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => loadCalendar(currentMonth, currentYear)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Retry
            </button>
            <button 
              onClick={() => generateCalendar(currentMonth, currentYear)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Generate New Calendar
            </button>
          </div>
        </div>
      </>
    );
  }

  // No calendar state
  if (!calendar) {
    return (
      <>
        <SimpleSidebar onToggle={setSidebarCollapsed} />
        <div className={`p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-center p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">No Calendar Found</h3>
            <p className="text-gray-600 mb-4">Let's generate your AI-powered content calendar.</p>
            <button 
              onClick={() => generateCalendar(currentMonth, currentYear)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate Calendar
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SimpleSidebar onToggle={setSidebarCollapsed} />
      <div 
        className={`p-6 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
        suppressHydrationWarning={true}
      >
        <div className={`mx-auto transition-all duration-300 ${
          sidebarCollapsed ? 'max-w-7xl' : 'max-w-6xl'
        }`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Content Calendar</h1>
            <p className="text-gray-600 mt-2">Your personalized content strategy in action</p>
          </div>

          {/* Calendar Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  ←
                </button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  →
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateCalendar(currentMonth, currentYear)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Regenerate Calendar
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
              {renderCalendarGrid()}
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User ID:</strong> {user?.id || 'Not loaded'}
              </div>
              <div>
                <strong>Calendar ID:</strong> {calendar?.id || 'None'}
              </div>
              <div>
                <strong>Month/Year:</strong> {currentMonth}/{currentYear}
              </div>
                  <div>
                <strong>Daily Content Count:</strong> {calendar?.daily_content?.length || 0}
              </div>
            </div>
            {calendar?.daily_content && calendar.daily_content.length > 0 && (
              <div className="mt-4">
                <strong>Sample Content:</strong>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(calendar.daily_content[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
          {/* Fallback Content Display for Debugging */}
          {calendar?.daily_content && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Debug: Calendar Content ({calendar.daily_content.length} items)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {calendar.daily_content.map((content, index) => (
                  <div key={content.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                    <div className="text-sm font-medium">
                      {content.post_date} - {content.content_type} ({content.platform})
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {content.caption.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedContent.content_type.replace('_', ' ')} Post - {new Date(selectedContent.post_date).toLocaleDateString()}
              </h3>
              <button onClick={() => setSelectedContent(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">📸 Image Description</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedContent.image_description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">✍️ Caption</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedContent.caption}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">🏷️ Hashtags</h4>
                <p className="text-blue-600 bg-gray-50 p-3 rounded">{selectedContent.hashtags}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">🎯 Call to Action</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedContent.cta}</p>
                  </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Platform: {selectedContent.platform} • Time: {selectedContent.optimal_time}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 