import { initializeDatabase } from './utils/database.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getSystemStatus() {
  try {
    const db = await open({
      filename: path.join(__dirname, '../ai_updates.db'),
      driver: sqlite3.Database
    });

    const status = {
      timestamp: new Date().toISOString(),
      database: {},
      feeds: {},
      lastUpdate: null,
      errors: []
    };

    // Database stats
    const totalUpdates = await db.get('SELECT COUNT(*) as count FROM updates');
    const companies = await db.all('SELECT company, COUNT(*) as count FROM updates GROUP BY company ORDER BY count DESC');
    const recentUpdates = await db.get('SELECT MAX(date) as latest FROM updates');
    const dailyUpdates = await db.get(`
      SELECT COUNT(*) as count 
      FROM updates 
      WHERE date >= datetime('now', '-1 day')
    `);

    status.database = {
      totalUpdates: totalUpdates.count,
      companies: companies,
      latestUpdate: recentUpdates.latest,
      updatesLast24h: dailyUpdates.count
    };

    // Check feed sources status
    const sourcesPath = path.join(__dirname, '../config/sources.json');
    const sourcesContent = await fs.readFile(sourcesPath, 'utf8');
    const sources = JSON.parse(sourcesContent);

    status.feeds.rss = Object.entries(sources.rss_feeds).map(([key, feed]) => ({
      name: feed.name,
      url: feed.url,
      active: feed.active,
      status: feed.active ? 'enabled' : 'disabled'
    }));

    status.feeds.scrapers = Object.entries(sources.scraping_targets).map(([key, target]) => ({
      name: target.name,
      url: target.url,
      status: 'configured'
    }));

    await db.close();
    return status;

  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'error'
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  getSystemStatus().then(status => {
    console.log('=== AI UPDATES TRACKER STATUS ===\n');
    console.log(`Last checked: ${status.timestamp}\n`);
    
    if (status.error) {
      console.log('❌ System Error:', status.error);
      return;
    }

    console.log('📊 Database Status:');
    console.log(`  Total updates: ${status.database.totalUpdates}`);
    console.log(`  Updates last 24h: ${status.database.updatesLast24h}`);
    console.log(`  Latest update: ${status.database.latestUpdate}`);
    
    console.log('\n🏢 Company Distribution:');
    status.database.companies.forEach(company => {
      console.log(`  ${company.company}: ${company.count}`);
    });

    console.log('\n📡 RSS Feeds:');
    status.feeds.rss.forEach(feed => {
      const emoji = feed.active ? '✅' : '⏸️';
      console.log(`  ${emoji} ${feed.name}: ${feed.status}`);
    });

    console.log('\n🕷️ Web Scrapers:');
    status.feeds.scrapers.forEach(scraper => {
      console.log(`  🔧 ${scraper.name}: ${scraper.status}`);
    });
  });
}