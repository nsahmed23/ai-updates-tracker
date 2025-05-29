import { UniversalScraper } from './universal.js';

export class OpenAIScraper extends UniversalScraper {
  constructor() {
    super();
    this.config = {
      url: 'https://openai.com/blog',
      name: 'OpenAI',
      selectors: {
        container: 'article, div[class*="post"]',
        title: 'h2, h3',
        date: 'time',
        link: 'a[href*="/blog/"]',
        description: 'p'
      }
    };
  }

  async fetch() {
    return await this.scrapeWebsite(this.config);
  }
} 