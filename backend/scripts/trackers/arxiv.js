import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

export class ArxivTracker {
  constructor() {
    this.baseUrl = 'http://export.arxiv.org/api/query';
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  }

  async searchByCompany(company, queries) {
    const papers = [];
    
    for (const query of queries) {
      try {
        console.log(`Searching arXiv for ${company}: ${query}`);
        
        const params = {
          search_query: `all:"${query}" AND (cat:cs.AI OR cat:cs.LG OR cat:cs.CL)`,
          start: 0,
          max_results: 10,
          sortBy: 'submittedDate',
          sortOrder: 'descending'
        };
        
        const response = await axios.get(this.baseUrl, { params });
        const parsed = this.parser.parse(response.data);
        
        const entries = this.normalizeEntries(parsed.feed?.entry);
        
        for (const entry of entries) {
          papers.push({
            id: crypto.createHash('md5').update(entry.id).digest('hex'),
            title: entry.title.replace(/\s+/g, ' ').trim(),
            description: entry.summary.replace(/\s+/g, ' ').trim(),
            link: entry.id,
            date: entry.published,
            company: company,
            source: 'arXiv',
            type: 'paper',
            authors: this.extractAuthors(entry.author)
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error fetching arXiv for ${query}:`, error.message);
      }
    }
    
    return papers;
  }

  normalizeEntries(entries) {
    if (!entries) return [];
    return Array.isArray(entries) ? entries : [entries];
  }

  extractAuthors(authors) {
    if (!authors) return [];
    const authorList = Array.isArray(authors) ? authors : [authors];
    return authorList.map(a => a.name).join(', ');
  }
} 