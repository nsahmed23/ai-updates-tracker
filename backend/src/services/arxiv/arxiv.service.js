import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

export class ArxivService {
    constructor() {
        this.baseUrl = 'http://export.arxiv.org/api/query';
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });
        this.categories = ['cs.AI', 'cs.LG', 'cs.CL', 'stat.ML'];
    }

    async fetchLatestPapers(options = {}) {
        const { maxResults = 50, days = 7 } = options;
        const papers = [];
        
        for (const category of this.categories) {
            try {
                const params = {
                    search_query: `cat:${category}`,
                    start: 0,
                    max_results: maxResults,
                    sortBy: 'submittedDate',
                    sortOrder: 'descending'
                };

                const response = await axios.get(this.baseUrl, { params });
                const parsed = this.parser.parse(response.data);
                const entries = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry].filter(Boolean);
                
                for (const entry of entries) {
                    const paper = this.parsePaper(entry, category);
                    papers.push(paper);
                }
                
                await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limiting
            } catch (error) {
                console.error(`Error fetching ${category}:`, error.message);
            }
        }
        
        return papers;
    }

    parsePaper(entry, category) {
        const authors = Array.isArray(entry.author) ? entry.author : [entry.author];
        
        return {
            id: crypto.createHash('md5').update(entry.id).digest('hex'),
            arxivId: entry.id.split('/').pop(),
            title: entry.title.replace(/\s+/g, ' ').trim(),
            description: entry.summary.replace(/\s+/g, ' ').trim(),
            link: entry.id,
            pdfUrl: entry.id.replace('abs', 'pdf'),
            date: entry.published,
            company: 'arxiv',
            source: `arXiv (${category})`,
            type: 'paper',
            authors: authors.map(a => a.name).join(', '),
            category: category,
            needsSummary: true
        };
    }
}