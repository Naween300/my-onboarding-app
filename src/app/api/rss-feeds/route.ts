// src/app/api/rss-feeds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    feed: ['language', 'copyright'],
    item: ['author', 'category', 'enclosure']
  }
});

export async function GET(request: NextRequest) {
  console.log('🔄 RSS API route called successfully');
  
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'business';
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // ✅ Use reliable RSS feeds that work with server-side parsing
    const FEED_URLS: Record<string, string> = {
      business: 'https://feeds.feedburner.com/entrepreneur/latest',
      technology: 'https://feeds.feedburner.com/techcrunch',
      marketing: 'https://blog.hubspot.com/marketing/rss.xml',
      finance: 'https://fortune.com/feed/',
      retail: 'https://feeds.feedburner.com/SmallBusinessTrends',
      healthcare: 'https://www.healthcaredive.com/feeds/news/'
    };

    const feedUrl = FEED_URLS[category] || FEED_URLS.business;
    console.log(`📡 Fetching RSS from: ${feedUrl}`);

    // ✅ Parse RSS feed directly on server
    const feed = await parser.parseURL(feedUrl);
    
    const articles = feed.items.slice(0, limit).map((item: any) => ({
      title: item.title || 'No title',
      link: item.link || '#',
      description: item.contentSnippet || item.content || 'No description',
      pubDate: item.pubDate || new Date().toISOString(),
      author: item.author || item.creator || feed.title || 'Unknown',
      source: feed.title || 'RSS Feed',
      category: category,
      image: item.enclosure?.url || null
    }));

    console.log(`✅ RSS API returning ${articles.length} real articles from ${feed.title}`);

    return NextResponse.json({
      success: true,
      articles: articles,
      category: category,
      count: articles.length,
      source: feed.title
    });

  } catch (error) {
    console.error('❌ RSS API Error:', error);
    
    // ✅ Fallback to mock data if RSS parsing fails
    const mockArticles = [
      {
        title: "10 Business Trends to Watch in 2025",
        link: "https://example.com/business-trends-2025",
        description: "Discover the latest business trends that will shape the industry this year.",
        pubDate: new Date().toISOString(),
        author: "Business Weekly",
        source: "Business News",
        category: category
      },
      {
        title: "Small Business Growth Strategies",
        link: "https://example.com/growth-strategies",
        description: "Learn proven strategies for scaling your small business.",
        pubDate: new Date(Date.now() - 3600000).toISOString(),
        author: "Entrepreneur Magazine",
        source: "Business Insights",
        category: category
      }
    ];

    return NextResponse.json({
      success: true,
      articles: mockArticles,
      category: category,
      count: mockArticles.length,
      fallback: true,
      error: 'Using fallback content due to RSS service issues'
    });
  }
}

// ✅ Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
