const { Client } = require('pg');

async function migrate() {
  if (!process.env.DATABASE_URI) {
    console.log('No DATABASE_URI, skipping manual migration');
    return;
  }
  
  console.log('Running manual schema migration before build...');
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    
    // Add status column to posts table if it doesn't exist
    await client.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'draft';
    `);
    
    console.log('Migration successful: status column ensured on posts table');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrate();
