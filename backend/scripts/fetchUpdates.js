import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { RSSTracker } from './trackers/rss.js';
import { UniversalScraper } from './scrapers/universal.js';
import { ArxivTracker } from './trackers/arxiv.js';
import { saveUpdates, initializeDatabase } from './utils/database.js';
import { ArxivService } from '../src/services/arxiv/arxiv.service.js';
import { MCPService } from '../src/services/mcp/mcp.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function triggerFetch() {
  console.log('Starting fetch process...');
  
  // Initialize database
  await initializeDatabase();
  
  // Load configuration
  const configPath = path.join(__dirname, '../config/sources.json');
  const config = JSON.parse(await readFile(configPath, 'utf-8'));
  
  const allUpdates = [];
  
  // 1. Fetch RSS feeds
  console.log('Fetching RSS feeds...');
  const rssTracker = new RSSTracker();
  for (const [key, feed] of Object.entries(config.rss_feeds)) {
    if (feed.active) {
      const updates = await rssTracker.fetchFeed(feed.url, feed.name);
      allUpdates.push(...updates);
    }
  }
  
  // 2. Scrape websites without RSS
  console.log('Scraping websites...');
  const scraper = new UniversalScraper();
  for (const [key, target] of Object.entries(config.scraping_targets)) {
    const updates = await scraper.scrapeWebsite(target);
    allUpdates.push(...updates);
  }
  
  // 3. Fetch arXiv papers (existing method)
  console.log('Fetching research papers...');
  const arxivTracker = new ArxivTracker();
  for (const [company, queries] of Object.entries(config.arxiv_queries.companies)) {
    const papers = await arxivTracker.searchByCompany(company, queries);
    allUpdates.push(...papers);
  }
  
  // 4. Fetch arXiv papers with new service and AI summaries
  console.log('Fetching arXiv papers with AI summaries...');
  const arxivService = new ArxivService();
  const mcpService = new MCPService();
  
  try {
    const papers = await arxivService.fetchLatestPapers({ maxResults: 20, days: 7 });
    
    // Add summaries to papers
    console.log('Generating AI summaries...');
    for (const paper of papers.slice(0, 5)) { // Limit summaries for demo
      try {
        const summary = await mcpService.summarizePaper(paper);
        paper.summary = summary;
        paper.hasSummary = true;
      } catch (error) {
        console.error(`Failed to summarize ${paper.arxivId}:`, error);
      }
    }
    
    allUpdates.push(...papers);
  } catch (error) {
    console.error('Error fetching arXiv papers with new service:', error);
  }
  
  // 5. Save all updates
  console.log(`Saving ${allUpdates.length} updates...`);
  const savedCount = await saveUpdates(allUpdates);
  
  return {
    success: true,
    total: allUpdates.length,
    saved: savedCount,
    timestamp: new Date().toISOString()
  };
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  triggerFetch()
    .then(result => console.log('Fetch complete:', result))
    .catch(error => console.error('Fetch error:', error));
} 