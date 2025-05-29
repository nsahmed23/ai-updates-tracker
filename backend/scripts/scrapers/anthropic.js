import { UniversalScraper } from './universal.js';

export class AnthropicScraper extends UniversalScraper {
  constructor() {
    super();
    this.config = {
      url: 'https://www.anthropic.com/news',
      name: 'Anthropic',
      selectors: {
        container: 'article, div[class*="card"], div[class*="post"]',
        title: 'h2, h3',
        date: 'time, span[class*="date"]',
        link: 'a[href*="/news/"]',
        description: 'p'
      }
    };
  }

  async fetch() {
    return await this.scrapeWebsite(this.config);
  }
} 