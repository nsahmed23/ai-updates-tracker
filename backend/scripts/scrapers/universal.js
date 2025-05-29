import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export class UniversalScraper {
  constructor() {
    this.axios = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  async scrapeWebsite(config) {
    try {
      console.log(`Scraping ${config.name}...`);
      const response = await this.axios.get(config.url);
      const $ = cheerio.load(response.data);
      
      const articles = [];
      
      $(config.selectors.container).each((i, element) => {
        const $el = $(element);
        
        const title = $el.find(config.selectors.title).first().text().trim();
        const link = $el.find(config.selectors.link).first().attr('href');
        const date = $el.find(config.selectors.date).first().text().trim();
        
        if (title && link) {
          const fullLink = link.startsWith('http') ? link : new URL(link, config.url).href;
          
          articles.push({
            id: crypto.createHash('md5').update(`${title}${fullLink}`).digest('hex'),
            title,
            description: $el.find('p').first().text().trim() || '',
            link: fullLink,
            date: this.parseDate(date),
            company: config.name.toLowerCase().replace(/\s+/g, ''),
            source: config.name,
            type: 'blog'
          });
        }
      });
      
      return articles.slice(0, 20); // Limit to 20 most recent
    } catch (error) {
      console.error(`Error scraping ${config.name}:`, error.message);
      return [];
    }
  }

  parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
} 