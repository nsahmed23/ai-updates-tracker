import Parser from 'rss-parser';
import crypto from 'crypto';

export class RSSTracker {
  constructor() {
    this.parser = new Parser({
      timeout: 30000,
      headers: {
        'User-Agent': 'AI-Updates-Tracker/1.0'
      }
    });
  }

  async fetchFeed(feedUrl, sourceName) {
    try {
      console.log(`Fetching RSS feed: ${sourceName}`);
      const feed = await this.parser.parseURL(feedUrl);
      
      return feed.items.map(item => ({
        id: crypto.createHash('md5').update(`${item.title}${item.link}`).digest('hex'),
        title: item.title,
        description: item.contentSnippet || item.content || '',
        link: item.link,
        date: item.pubDate || item.isoDate || new Date().toISOString(),
        company: sourceName.toLowerCase().replace(/\s+/g, ''),
        source: sourceName,
        type: 'blog'
      }));
    } catch (error) {
      console.error(`Error fetching ${sourceName} RSS:`, error.message);
      return [];
    }
  }
} 