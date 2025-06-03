#!/usr/bin/env node

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { access } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function showDatabaseStats() {
  try {
    // Open database
    const dbPath = join(__dirname, '../../ai_updates.db');
    
    // Check if database exists
    try {
      await access(dbPath);
    } catch (error) {
      console.log('📊 DATABASE STATISTICS');
      console.log('─'.repeat(40));
      console.log('No database found yet - this appears to be the first run!');
      console.log('The database will be created after the first update.');
      return;
    }
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check if updates table exists
    const tableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='updates'
    `);
    
    if (!tableExists) {
      console.log('📊 DATABASE STATISTICS');
      console.log('─'.repeat(40));
      console.log('Database exists but no updates table found.');
      console.log('The table will be created after the first update.');
      await db.close();
      return;
    }

    // Get total count
    const stats = await db.get('SELECT COUNT(*) as count FROM updates');
    
    // Get breakdown by company
    const companies = await db.all(`
      SELECT company, COUNT(*) as count 
      FROM updates 
      GROUP BY company 
      ORDER BY count DESC
    `);
    
    // Get database size
    const dbStats = await db.get(`
      SELECT page_count * page_size as size 
      FROM pragma_page_count(), pragma_page_size()
    `);
    
    // Get recent updates (last 24 hours)
    const recentStats = await db.get(`
      SELECT COUNT(*) as count 
      FROM updates 
      WHERE datetime(created_at) > datetime('now', '-1 day')
    `);

    // Display stats
    console.log('📊 DATABASE STATISTICS');
    console.log('─'.repeat(40));
    console.log(`Total updates: ${stats.count}`);
    console.log(`Database size: ${(dbStats.size / 1024).toFixed(1)} KB`);
    console.log(`Recent updates (24h): ${recentStats.count}`);
    console.log('\n📈 Breakdown by company:');
    console.log('─'.repeat(40));
    
    companies.forEach(c => {
      const percentage = ((c.count / stats.count) * 100).toFixed(1);
      console.log(`  ${c.company.padEnd(20)} ${c.count.toString().padStart(6)} (${percentage}%)`);
    });

    await db.close();
    
  } catch (error) {
    console.error('Error showing stats:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  showDatabaseStats();
}

export { showDatabaseStats };