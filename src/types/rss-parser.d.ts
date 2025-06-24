declare module 'rss-parser' {
  export interface RSSItem {
    title?: string;
    link?: string;
    pubDate?: string;
    creator?: string;
    content?: string;
    contentSnippet?: string;
    categories?: string[];
    isoDate?: string;
    [key: string]: any;
  }

  export interface RSSFeed {
    title?: string;
    description?: string;
    link?: string;
    image?: {
      url?: string;
      title?: string;
    };
    items: RSSItem[];
    [key: string]: any;
  }

  export interface ParserOptions {
    headers?: Record<string, string>;
    timeout?: number;
    [key: string]: any;
  }

  export default class Parser {
    constructor(options?: ParserOptions);
    
    parseURL(url: string): Promise<RSSFeed>;
    parseString(xml: string): Promise<RSSFeed>;
    parseFile(filePath: string): Promise<RSSFeed>;
  }
} 