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

    filterByRelevance(papers) {
        return papers.filter(paper => {
            const title = paper.title.toLowerCase();
            const description = paper.description.toLowerCase();
            
            // High-priority AI/ML keywords
            const highPriorityKeywords = [
                'large language model', 'llm', 'transformer', 'attention mechanism',
                'neural network', 'deep learning', 'machine learning', 'artificial intelligence',
                'gpt', 'bert', 'generative', 'diffusion model', 'reinforcement learning'
            ];
            
            // Medium-priority keywords
            const mediumPriorityKeywords = [
                'ai', 'ml', 'nlp', 'computer vision', 'optimization', 'algorithm',
                'model', 'training', 'inference', 'embedding', 'fine-tuning'
            ];
            
            let score = 0;
            
            // Check high-priority keywords (2 points each)
            highPriorityKeywords.forEach(keyword => {
                if (title.includes(keyword) || description.includes(keyword)) {
                    score += 2;
                }
            });
            
            // Check medium-priority keywords (1 point each)
            mediumPriorityKeywords.forEach(keyword => {
                if (title.includes(keyword) || description.includes(keyword)) {
                    score += 1;
                }
            });
            
            // Also boost papers from recent dates
            const paperDate = new Date(paper.date);
            const daysSincePublication = (Date.now() - paperDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSincePublication <= 7) score += 2;
            else if (daysSincePublication <= 30) score += 1;
            
            // Return papers with score >= 3
            paper.relevanceScore = score;
            return score >= 3;
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);
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
        
        // Apply relevance filtering
        const relevantPapers = this.filterByRelevance(papers);
        console.log(`Filtered ${papers.length} papers down to ${relevantPapers.length} relevant ones`);
        
        return relevantPapers.slice(0, maxResults);
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