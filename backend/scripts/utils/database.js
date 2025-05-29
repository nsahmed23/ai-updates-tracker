import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, '../../ai_updates.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      link TEXT NOT NULL,
      date TEXT NOT NULL,
      company TEXT NOT NULL,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_company ON updates(company);
    CREATE INDEX IF NOT EXISTS idx_date ON updates(date);
    CREATE INDEX IF NOT EXISTS idx_type ON updates(type);
  `);
}

export async function saveUpdates(updates) {
  let savedCount = 0;
  
  for (const update of updates) {
    try {
      await db.run(`
        INSERT OR IGNORE INTO updates (id, title, description, link, date, company, source, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        update.id,
        update.title,
        update.description || '',
        update.link,
        update.date,
        update.company,
        update.source,
        update.type
      ]);
      
      const changes = await db.get('SELECT changes() as count');
      if (changes.count > 0) savedCount++;
    } catch (error) {
      console.error('Error saving update:', error);
    }
  }
  
  return savedCount;
}

export async function getUpdates(filters = {}) {
  let query = 'SELECT * FROM updates WHERE 1=1';
  const params = [];
  
  if (filters.company && filters.company !== 'all') {
    query += ' AND company = ?';
    params.push(filters.company);
  }
  
  if (filters.dateRange) {
    const days = parseInt(filters.dateRange);
    query += ' AND date >= datetime("now", "-" || ? || " days")';
    params.push(days);
  }
  
  if (filters.search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  
  query += ' ORDER BY date DESC LIMIT 100';
  
  return await db.all(query, params);
}

export async function getStats() {
  const stats = { total: 0 };
  
  const total = await db.get('SELECT COUNT(*) as count FROM updates');
  stats.total = total.count;
  
  const companies = await db.all(`
    SELECT company, COUNT(*) as count 
    FROM updates 
    GROUP BY company
  `);
  
  companies.forEach(row => {
    stats[row.company] = row.count;
  });
  
  return stats;
} 