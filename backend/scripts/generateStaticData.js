import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { triggerFetch } from './fetchUpdates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateStaticData() {
  console.log('🔄 Generating static data...');
  
  try {
    // Fetch fresh data
    const updates = await triggerFetch();
    
    // Create data structure
    const data = {
      updates: updates || [],
      lastUpdated: new Date().toISOString(),
      stats: {
        totalUpdates: updates?.length || 0,
        companies: [...new Set(updates?.map(u => u.company) || [])].length
      }
    };
    
    // Write to frontend data directory
    const outputPath = path.join(__dirname, '../../_data/liveUpdates.json');
    await writeFile(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Generated static data: ${data.updates.length} updates`);
    console.log(`📍 Saved to: ${outputPath}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    
    // Fallback to sample data
    const fallbackData = {
      updates: [
        {
          id: "sample-1",
          title: "Sample AI Update 1",
          description: "This is sample data. Deploy the backend to get real updates.",
          link: "#",
          date: new Date().toISOString(),
          company: "sample",
          source: "Static Generation",
          type: "sample"
        }
      ],
      lastUpdated: new Date().toISOString(),
      stats: { totalUpdates: 1, companies: 1 }
    };
    
    const outputPath = path.join(__dirname, '../../_data/liveUpdates.json');
    await writeFile(outputPath, JSON.stringify(fallbackData, null, 2));
    
    return fallbackData;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticData();
}

export { generateStaticData }; 