'use client';

import React, { useState, useEffect } from 'react';
import { smeApi, ContentGenerationRequest, GeneratedContent } from '@/lib/sme-api';

type ContentGenerationWidgetProps = {
  userProfile?: any;
};

// Helper function to safely render objects
const safeRenderObject = (obj: any, fallback = 'No data available') => {
  if (!obj) return fallback;
  if (typeof obj === 'string' || typeof obj === 'number') return obj;
  if (Array.isArray(obj)) return obj.join(', ');
  if (typeof obj === 'object') {
    return Object.entries(obj).map(([key, value]) => (
      <div key={key} className="mb-1">
        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {String(value)}
      </div>
    ));
  }
  return String(obj);
};

// Comprehensive safety check for any content
const safeRenderContent = (content: any, fieldName: string) => {
  if (!content) return null;
  
  // If it's a string or number, render directly
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }
  
  // If it's an array, join with commas
  if (Array.isArray(content)) {
    return content.map(item => String(item)).join(', ');
  }
  
  // If it's an object, log warning and return fallback
  if (typeof content === 'object') {
    console.warn(`⚠️ Attempted to render object directly for field: ${fieldName}`, content);
    return `[${fieldName} data available]`;
  }
  
  // Fallback
  return String(content);
};

// Helper function to render analytics data
const renderAnalytics = (analytics: any) => {
  if (!analytics || typeof analytics !== 'object') {
    return <p className="text-gray-500">No analytics available</p>;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mt-4">
      <h4 className="font-semibold text-gray-900 mb-3">Content Analytics</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analytics.optimal_time && (
          <div>
            <span className="text-sm font-medium text-gray-600">Best Time to Post:</span>
            <p className="text-gray-900">{analytics.optimal_time}</p>
          </div>
        )}
        {analytics.predicted_engagement && (
          <div>
            <span className="text-sm font-medium text-gray-600">Predicted Engagement:</span>
            <p className="text-gray-900">{analytics.predicted_engagement}</p>
          </div>
        )}
        {analytics.day_of_week && (
          <div>
            <span className="text-sm font-medium text-gray-600">Best Day:</span>
            <p className="text-gray-900">{analytics.day_of_week}</p>
          </div>
        )}
        {analytics.recommendations && (
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-gray-600">Recommendations:</span>
            <p className="text-gray-900">{analytics.recommendations}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ContentGenerationWidget: React.FC<ContentGenerationWidgetProps> = ({ userProfile: userProfileProp }) => {
  const [userProfile, setUserProfile] = useState<any>(userProfileProp || null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentParams, setContentParams] = useState({
    target_audience: 'general',
    brand_voice: 'professional',
    target_date: new Date().toISOString().split('T')[0]
  });

  // Load user profile from localStorage on component mount if not provided as prop
  useEffect(() => {
    if (userProfileProp) return;
    const loadUserProfile = () => {
      try {
        const userCacheData = localStorage.getItem('userCacheData');
        const brandName = localStorage.getItem('brandName');
        if (userCacheData) {
          const profile = JSON.parse(userCacheData);
          setUserProfile({ ...profile, brandName });
          console.log('👤 User profile loaded:', profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setError('Failed to load user profile');
      }
    };
    loadUserProfile();
  }, [userProfileProp]);

  // Generate personalized content based on onboarding data
  const generatePersonalizedContent = async () => {
    if (!userProfile) {
      setError('User profile not available');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null); // Reset image state

    try {
      console.log('🎯 Generating content for profile:', userProfile);

      const contentRequest: ContentGenerationRequest = {
        industry: userProfile.businessType || 'general',
        business_type: userProfile.customerType || 'b2c',
        target_audience: contentParams.target_audience,
        brand_voice: contentParams.brand_voice,
        target_date: contentParams.target_date
      };

      console.log('📝 Content request:', contentRequest);
      const content = await smeApi.generateContent(contentRequest);
      
      // ✅ Handle the response properly - extract specific properties
      if (content) {
        setGeneratedContent(content);
        
        // Handle image URL if present
        if (content.image_url) {
          setGeneratedImage(content.image_url);
        }
        
        console.log('✅ Content generated successfully:', {
          caption: content.caption,
          hashtags: content.hashtags,
          imageUrl: content.image_url,
          analytics: content.analytics ? 'Present' : 'Not present'
        });
      }
    } catch (error) {
      console.error('❌ Content generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Content Generator</h2>
          <p className="text-sm text-gray-600">
            Personalized content based on your business profile
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Powered by AI</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Your Business Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <span className="font-medium">Business:</span> {userProfile.brandName || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Type:</span> {userProfile.businessType || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Customer:</span> {userProfile.customerType || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Budget:</span> ${userProfile.userBudget || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Content Parameters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={contentParams.target_date}
              onChange={(e) => setContentParams(prev => ({
                ...prev,
                target_date: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Voice
            </label>
            <select
              value={contentParams.brand_voice}
              onChange={(e) => setContentParams(prev => ({
                ...prev,
                brand_voice: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="authoritative">Authoritative</option>
              <option value="playful">Playful</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <select
              value={contentParams.target_audience}
              onChange={(e) => setContentParams(prev => ({
                ...prev,
                target_audience: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General Audience</option>
              <option value="young_adults">Young Adults (18-35)</option>
              <option value="professionals">Professionals</option>
              <option value="local_community">Local Community</option>
              <option value="business_owners">Business Owners</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generatePersonalizedContent}
        disabled={isGenerating || !userProfile}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          isGenerating || !userProfile
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating AI Content...
          </div>
        ) : (
          '🎯 Generate AI Content for My Business'
        )}
      </button>

      {/* Enhanced Loading State */}
      {isGenerating && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <p className="text-blue-800 font-medium">Generating personalized content...</p>
              <p className="text-blue-600 text-sm">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Generated Content for {userProfile?.brandName}
          </h4>
          
          <div className="space-y-4">
            {/* Display generated image if available */}
            {generatedImage && (
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-1">Generated Image:</h5>
                <div className="bg-white p-3 rounded border">
                  <img 
                    src={generatedImage} 
                    alt="Generated content" 
                    className="max-w-full h-auto rounded-lg"
                    onError={(e) => {
                      console.error('Failed to load generated image');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            {generatedContent.caption && (
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-1">Caption:</h5>
                <p className="text-sm text-green-700 bg-white p-3 rounded border">
                  {safeRenderContent(generatedContent.caption, 'caption')}
                </p>
              </div>
            )}
            
            {generatedContent.hashtags && (
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-1">Hashtags:</h5>
                <p className="text-sm text-green-700 bg-white p-3 rounded border">
                  {safeRenderContent(generatedContent.hashtags, 'hashtags')}
                </p>
              </div>
            )}
            
            {generatedContent.posting_strategy && (
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-1">Posting Strategy:</h5>
                <p className="text-sm text-green-700 bg-white p-3 rounded border">
                  {safeRenderContent(generatedContent.posting_strategy, 'posting_strategy')}
                </p>
              </div>
            )}

            {generatedContent.trending_insights && generatedContent.trending_insights.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-green-800 mb-1">Trending Insights:</h5>
                <ul className="text-sm text-green-700 bg-white p-3 rounded border space-y-1">
                  {generatedContent.trending_insights.map((insight, index) => (
                    <li key={index}>• {safeRenderContent(insight, `insight ${index + 1}`)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analytics Data - Safely rendered using helper function */}
            {generatedContent.analytics && renderAnalytics(generatedContent.analytics)}
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
              📋 Copy Content
            </button>
            <button 
              onClick={generatePersonalizedContent}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              🔄 Regenerate
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
              📅 Schedule Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerationWidget;
