// src/app/dashboard/components/RSSFeedWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  ArrowPathIcon as RefreshIcon,
  BookmarkIcon,
  CalendarDaysIcon as CalendarIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/contexts/SupabaseContext';

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  author?: string;
  category?: string;
  image?: string | null;
}

interface IndustryMapping {
  [key: string]: string;
}

interface MockArticles {
  [key: string]: Article[];
}

interface RSSFeedWidgetProps {
  userBusinessType?: string;
  hideIndustrySelector?: boolean;
}

interface RSSFeedUrls {
  [key: string]: string[];
}

export const RSSFeedWidget = ({ userBusinessType, hideIndustrySelector = false }: RSSFeedWidgetProps) => {
  const { user } = useUser();
  const supabase = useSupabase();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination configuration (2 rows × 3 columns = 6 articles per page)
  const ARTICLES_PER_PAGE = 6;
  const ARTICLES_PER_ROW = 3;

  // Calculate pagination data
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = allArticles.slice(startIndex, endIndex);

  // ✅ Updated RSS feed URLs with working endpoints (verified from search results)
  const rssFeedUrls: RSSFeedUrls = {
    'technology': [
      'https://techcrunch.com/feed/', // ✅ Working
      'https://feeds.feedburner.com/TechCrunch/', // ✅ Alternative from search result [15]
      'https://www.wired.com/feed/rss', // ✅ Working from search result [15]
      'https://www.theverge.com/rss/index.xml' // ✅ Working from search result [15]
    ],
    'marketing': [
      'https://marketingland.com/feed',
      'https://feeds.feedburner.com/socialmediaexaminer',
      'https://blog.hubspot.com/marketing/rss.xml',
      'https://contentmarketinginstitute.com/feed/'
    ],
    'business': [
      'https://feeds.feedburner.com/entrepreneur/latest',
      'https://www.inc.com/rss/homepage.xml',
      'https://feeds.harvard.edu/news/rss/business.xml',
      'https://feeds.feedburner.com/fastcompany/headlines'
    ],
    'finance': [
      'https://feeds.feedburner.com/reuters/businessNews',
      'https://www.marketwatch.com/rss/topstories',
      'https://feeds.feedburner.com/TheMotleyFool',
      'https://www.pymnts.com/feed/' // ✅ Already working from your logs
    ],
    'healthcare': [
      'https://www.healthcarefinancenews.com/rss.xml',
      'https://feeds.feedburner.com/modernhealthcare',
      'https://www.fiercehealthcare.com/rss.xml',
      'https://www.healthleadersmedia.com/rss.xml'
    ],
    'retail': [
      // ✅ Fixed retail feeds based on search results [1], [7], [22], [23]
      'https://www.retaildive.com/feeds/news/', // ✅ Correct URL from search result [7]
      'https://chainstoreage.com/rss.xml', // ✅ Already working from your logs
      'https://www.indiaretailing.com/feed/', // ✅ From search result [7]
      'https://www.retailgazette.co.uk/feed/' // ✅ From search result [7]
    ]
  };

  // Industry mapping from onboarding business types
  const industryMapping: { [key: string]: string } = {
    'restaurant': 'business',
    'retail': 'retail', 
    'technology': 'technology',
    'healthcare': 'healthcare',
    'finance': 'finance',
    'education': 'business',
    'construction': 'business',
    'automotive': 'business',
    'manufacturing': 'business',
    'nonprofit': 'business',
    'travel': 'business',
    'beauty': 'retail',
    'entertainment': 'business',
    'professional': 'business',
    'creative': 'marketing'
  };

  // Auto-select industry based on onboarding data
  useEffect(() => {
    const autoSelectIndustry = async () => {
      if (!user?.id) return;

      try {
        console.log('🔍 Auto-selecting industry based on onboarding data...');
        
        const { data: onboardingData, error } = await supabase
          .from('onboarding')
          .select('business_type')
          .eq('clerk_user_id', user.id)
          .single();

        let selectedIndustryTab: string = 'business';

        if (error) {
          console.warn('⚠️ Could not fetch onboarding data:', error);
          if (userBusinessType) {
            selectedIndustryTab = industryMapping[userBusinessType] || 'business';
          }
        } else if (onboardingData?.business_type) {
          selectedIndustryTab = industryMapping[onboardingData.business_type] || 'business';
          console.log('✅ Auto-selected industry:', selectedIndustryTab, 'for business type:', onboardingData.business_type);
        }

        setSelectedIndustry(selectedIndustryTab);

      } catch (error) {
        console.error('❌ Error auto-selecting industry:', error);
        setSelectedIndustry('business');
      }
    };

    autoSelectIndustry();
  }, [user?.id, userBusinessType, supabase]);

  // Fetch real RSS feed data
  const fetchArticlesForIndustry = async (industry: string) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page when changing industry
    
    try {
      console.log('📰 Fetching real RSS feeds for industry:', industry);
      
      const feedUrls = rssFeedUrls[industry] || rssFeedUrls['business'];
      const allFetchedArticles: Article[] = [];

      // Fetch from multiple RSS feeds
      for (const feedUrl of feedUrls) {
        try {
          const response = await fetch(`/api/rss-proxy?url=${encodeURIComponent(feedUrl)}`);
          
          if (!response.ok) {
            console.warn(`⚠️ Failed to fetch from ${feedUrl}:`, response.statusText);
            continue;
          }
          
          const data = await response.json();
          
          if (data.articles) {
            allFetchedArticles.push(...data.articles);
          }
        } catch (feedError) {
          console.warn(`⚠️ Error fetching from ${feedUrl}:`, feedError);
        }
      }

      if (allFetchedArticles.length === 0) {
        throw new Error('No articles could be fetched from any RSS feed');
      }

      // Sort by date and remove duplicates
      const uniqueArticles = allFetchedArticles
        .filter((article, index, self) => 
          index === self.findIndex(a => a.title === article.title)
        )
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });

      console.log(`✅ Fetched ${uniqueArticles.length} real articles for ${industry}`);
      setAllArticles(uniqueArticles);

    } catch (error) {
      console.error('❌ Error fetching RSS feeds:', error);
      setError(`Failed to load ${industry} news. Please try again later.`);
      setAllArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch articles when industry is selected
  useEffect(() => {
    if (selectedIndustry) {
      fetchArticlesForIndustry(selectedIndustry);
    }
  }, [selectedIndustry]);

  // Pagination handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Smooth scroll to top of feed
    document.getElementById('rss-feed-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const industries = [
    { id: 'business', label: 'Business', icon: '🏢' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'marketing', label: 'Marketing', icon: '📈' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'retail', label: 'Retail', icon: '🛍️' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥' }
  ];

  const handleTabClick = (industryId: string) => {
    setSelectedIndustry(industryId);
  };

  if (!selectedIndustry) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-full w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" id="rss-feed-top">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Industry News Feed</h2>
        <div className="text-sm text-gray-500">
          {/* Show selected industry when tabs are hidden */}
          {hideIndustrySelector && selectedIndustry && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full mr-2">
              {industries.find(i => i.id === selectedIndustry)?.icon} {industries.find(i => i.id === selectedIndustry)?.label}
            </span>
          )}
          Real-time • {allArticles.length} articles • Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Completely hide tabs using conditional rendering */}
      {!hideIndustrySelector && (
        <div className="flex flex-wrap gap-2 mb-6">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => handleTabClick(industry.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedIndustry === industry.id
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span>{industry.icon}</span>
              <span>{industry.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => selectedIndustry && fetchArticlesForIndustry(selectedIndustry)}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Articles Grid - 2 Rows × 3 Columns */}
      {loading ? (
        <div className="space-y-4">
          {/* Loading skeleton for 2 rows */}
          {[1, 2].map((row) => (
            <div key={row} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((col) => (
                <div key={col} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Articles Grid - Exactly 2 rows */}
          <div className="space-y-4 mb-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentArticles.slice(0, ARTICLES_PER_ROW).map((article) => (
                <a 
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow block"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-4 flex items-center justify-center">
                    <div className="text-blue-600 text-2xl">📰</div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.date}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Row 2 */}
            {currentArticles.length > ARTICLES_PER_ROW && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentArticles.slice(ARTICLES_PER_ROW, ARTICLES_PER_PAGE).map((article) => (
                  <a 
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow block"
                  >
                    <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded mb-4 flex items-center justify-center">
                      <div className="text-green-600 text-2xl">📰</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.date}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {article.category}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, allArticles.length)} of {allArticles.length} articles
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`
                        w-10 h-10 rounded-md text-sm font-medium transition-colors
                        ${pageNumber === currentPage
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
