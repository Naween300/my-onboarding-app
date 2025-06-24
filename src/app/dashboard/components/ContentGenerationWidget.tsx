'use client';

import React, { useState, useEffect } from 'react';
import { smeApi, ContentGenerationRequest, GeneratedContent } from '@/lib/sme-api';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useUser } from '@clerk/nextjs';

interface UserProfile {
  name: string;
  onboarding?: {
    business_name: string;
    business_type: string;
    budget: number;
    timeline: string;
    brand_colors: any;
    goals: string[];
    brand_personality: string[];
  };
}

interface ContentGenerationWidgetProps {
  user: any;
}

export default function ContentGenerationWidget({ user }: ContentGenerationWidgetProps) {
  const supabase = useSupabase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        console.log('🔍 Fetching user profile for:', user.id);
        
        // ✅ Test authentication first (from search result [2])
        const { data: testData, error: testError } = await supabase.rpc('test_authorization_header');
        console.log('🔍 Auth test:', { role: testData?.role, userId: testData?.sub, error: testError });
        
        if (!testData || testData.role !== 'authenticated') {
          console.error('❌ User not authenticated for database access');
          setError('Authentication failed');
          return;
        }

        // ✅ Fetch user profile with proper error handling
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            *,
            onboarding (
              business_name,
              business_type,
              budget,
              timeline,
              brand_colors,
              goals,
              brand_personality
            )
          `)
          .eq('clerk_user_id', user.id)
          .single();

        if (profileError) {
          // ✅ Enhanced error handling for empty objects (from search result [4])
          if (Object.keys(profileError).length === 0 || !profileError.message) {
            console.error('❌ RLS Policy Violation: Access denied to user_profiles table');
            setError('Database access denied - RLS policy issue');
          } else {
            console.error('❌ Profile fetch error:', profileError);
            setError(profileError.message);
          }
          return;
        }

        if (!profile) {
          console.error('❌ No profile found for user:', user.id);
          setError('Profile not found');
          return;
        }

        console.log('✅ User profile fetched successfully:', profile);
        setUserProfile(profile);

      } catch (error) {
        console.error('❌ Error fetching profile:', error);
        setError('Failed to fetch profile');
      }
    };

    fetchUserProfile();
  }, [user?.id, supabase]);

  // ✅ Handle error states gracefully
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Profile Error</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ✅ Show loading state
  if (!userProfile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="animate-pulse">Loading user profile...</div>
      </div>
    );
  }

  // ✅ Content generation function
  const generateContent = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const contentRequest: ContentGenerationRequest = {
        industry: userProfile.onboarding?.business_type || 'general',
        business_type: 'b2c',
        target_audience: 'general',
        brand_voice: 'professional',
        target_date: new Date().toISOString().split('T')[0]
      };

      const content = await smeApi.generateContent(contentRequest);
      setGeneratedContent(content);
      
    } catch (error) {
      console.error('❌ Content generation failed:', error);
      setError('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ Render content generation widget with profile data
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Content Generation</h2>
      <p>Welcome, {userProfile.name}!</p>
      <p>Business: {userProfile.onboarding?.business_name}</p>
      
      {/* Generate Button */}
      <button
        onClick={generateContent}
        disabled={isGenerating}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isGenerating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Generating Content...
          </div>
        ) : (
          '🤖 Generate AI Content for My Business'
        )}
      </button>

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-semibold text-green-900 mb-2">Generated Content</h4>
          {generatedContent.caption && (
            <div className="mb-2">
              <span className="font-medium">Caption:</span> {generatedContent.caption}
            </div>
          )}
          {generatedContent.hashtags && (
            <div className="mb-2">
              <span className="font-medium">Hashtags:</span> {Array.isArray(generatedContent.hashtags) ? generatedContent.hashtags.join(', ') : generatedContent.hashtags}
            </div>
          )}
          {generatedContent.posting_strategy && (
            <div className="mb-2">
              <span className="font-medium">Posting Strategy:</span> {generatedContent.posting_strategy}
            </div>
          )}
          {generatedContent.trending_insights && Array.isArray(generatedContent.trending_insights) && generatedContent.trending_insights.length > 0 && (
            <div className="mb-2">
              <span className="font-medium">Trending Insights:</span>
              <ul className="list-disc list-inside ml-4">
                {generatedContent.trending_insights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
          {generatedContent.analytics && (
            <div className="mt-4">
              <span className="font-medium">Analytics:</span>
              <pre className="bg-white p-2 rounded border mt-1 text-xs overflow-x-auto">{JSON.stringify(generatedContent.analytics, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
