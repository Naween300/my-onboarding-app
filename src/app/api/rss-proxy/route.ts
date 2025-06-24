import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const feedUrl = searchParams.get('url');
  
  if (!feedUrl) {
    return NextResponse.json({ error: 'Feed URL is required' }, { status: 400 });
  }

  try {
    console.log('🔍 Fetching RSS feed:', feedUrl);
    
    const feed = await parser.parseURL(feedUrl);
    
    // Transform RSS data to consistent format
    const articles = feed.items.slice(0, 30).map((item, index) => ({
      id: `${Date.now()}-${index}`,
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || 'No description available',
      url: item.link || '#',
      date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'No date',
      author: item.creator || item.author || 'Unknown',
      category: item.categories?.[0] || 'General',
      image: item['media:content']?.$ || item['media:thumbnail']?.$ || null
    }));

    return NextResponse.json({
      title: feed.title,
      description: feed.description,
      articles: articles
    });

  } catch (error: any) {
    console.error('❌ RSS fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch RSS feed',
      details: error.message 
    }, { status: 500 });
  }
} 