import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export class ArxivTracker {
  constructor() {
    this.baseUrl = 'http://export.arxiv.org/api/query';
    this.maxResults = 10;
  }

  async searchByCompany(company, queries) {
    const papers = [];
    
    for (const query of queries) {
      try {
        const searchQuery = encodeURIComponent(query);
        const url = `${this.baseUrl}?search_query=all:${searchQuery}&start=0&max_results=${this.maxResults}&sortBy=submittedDate&sortOrder=descending`;
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        $('entry').each((i, element) => {
          const $el = $(element);
          
          const title = $el.find('title').text().trim();
          const abstract = $el.find('summary').text().trim();
          const link = $el.find('id').text().trim();
          const published = $el.find('published').text().trim();
          
          const authors = [];
          $el.find('author').each((i, author) => {
            authors.push($(author).find('name').text().trim());
          });
          
          if (title && link) {
            papers.push({
              id: crypto.createHash('md5').update(`${title}${link}`).digest('hex'),
              title,
              description: abstract.substring(0, 300) + '...',
              link,
              date: published,
              company,
              source: 'arXiv',
              type: 'research',
              details: {
                authors: authors.join(', '),
                abstract: abstract
              }
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching arXiv papers for ${query}:`, error.message);
      }
    }
    
    // Remove duplicates based on title
    const uniquePapers = papers.filter((paper, index, self) =>
      index === self.findIndex((p) => p.title === paper.title)
    );
    
    return uniquePapers.slice(0, 10); // Limit to 10 papers per company
  }
} 