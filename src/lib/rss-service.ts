import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'SME Intelligence RSS Parser'
  },
  timeout: 5000
});

export interface RSSServiceOptions {
  maxItems?: number;
  timeout?: number;
}

export class RSSService {
  /**
   * Parse RSS feed from URL
   */
  static async parseFeed(url: string, options: RSSServiceOptions = {}): Promise<any> {
    try {
      console.log(`📡 Fetching RSS feed from: ${url}`);
      
      const feed = await parser.parseURL(url);
      
      // Limit items if specified
      if (options.maxItems && feed.items.length > options.maxItems) {
        feed.items = feed.items.slice(0, options.maxItems);
      }
      
      console.log(`✅ RSS feed parsed successfully: ${feed.items.length} items`);
      return feed;
    } catch (error) {
      console.error(`❌ Failed to parse RSS feed from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Parse RSS feed from XML string
   */
  static async parseXML(xml: string): Promise<any> {
    try {
      console.log('📡 Parsing RSS XML string');
      
      const feed = await parser.parseString(xml);
      
      console.log(`✅ RSS XML parsed successfully: ${feed.items.length} items`);
      return feed;
    } catch (error) {
      console.error('❌ Failed to parse RSS XML:', error);
      throw error;
    }
  }

  /**
   * Get trending topics from multiple RSS feeds
   */
  static async getTrendingTopics(feedUrls: string[]): Promise<any[]> {
    const allItems: any[] = [];
    
    try {
      console.log(`📡 Fetching ${feedUrls.length} RSS feeds for trending topics`);
      
      const feedPromises = feedUrls.map(url => 
        this.parseFeed(url, { maxItems: 10 }).catch(error => {
          console.warn(`⚠️ Failed to fetch ${url}:`, error);
          return null;
        })
      );
      
      const feeds = await Promise.all(feedPromises);
      
      feeds.forEach(feed => {
        if (feed && feed.items) {
          allItems.push(...feed.items);
        }
      });
      
      console.log(`✅ Collected ${allItems.length} items from RSS feeds`);
      return allItems;
    } catch (error) {
      console.error('❌ Failed to get trending topics:', error);
      throw error;
    }
  }
} 