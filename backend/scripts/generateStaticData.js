import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { triggerFetch } from './fetchUpdates.js';
import { initializeDatabase, getUpdates, getStats } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateStaticData() {
  console.log('🔄 Generating static data...');
  
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Fetch fresh data
    await triggerFetch();
    
    // Get all updates from database
    const updates = await getUpdates();
    const stats = await getStats();
    
    // Create data structure
    const data = {
      updates: updates || [],
      stats: stats || { total: 0 },
      lastUpdated: new Date().toISOString()
    };
    
    // Ensure frontend directory exists
    const dataDir = path.join(__dirname, '../../frontend');
    await mkdir(dataDir, { recursive: true });
    
    // Write to frontend directory
    const outputPath = path.join(dataDir, 'data.json');
    await writeFile(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Generated static data: ${data.updates.length} updates`);
    console.log(`📍 Saved to: ${outputPath}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    
    // Fallback to empty data
    const fallbackData = {
      updates: [],
      stats: { total: 0 },
      lastUpdated: new Date().toISOString()
    };
    
    const dataDir = path.join(__dirname, '../../frontend');
    await mkdir(dataDir, { recursive: true });
    const outputPath = path.join(dataDir, 'data.json');
    await writeFile(outputPath, JSON.stringify(fallbackData, null, 2));
    
    return fallbackData;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { generateStaticData }; 