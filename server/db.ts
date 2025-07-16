import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool, QueryResult } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";
import { setupLocalDatabase } from './setup-local-db';

neonConfig.webSocketConstructor = ws;

// Define a connection type to track which database we're connected to
type DatabaseConnection = {
  pool: NeonPool | PgPool;
  db: any; // Using any here to simplify the types - ideally we would use proper types
  type: 'cloud' | 'local';
};

let connection: DatabaseConnection | null = null;

// Function to test a database connection
async function testConnection(connectionUrl: string, isCloud: boolean = true): Promise<boolean> {
  try {
    const testPool = isCloud 
      ? new NeonPool({ connectionString: connectionUrl })
      : new PgPool({ connectionString: connectionUrl });
    
    const client = await testPool.connect();
    try {
      // Simple query to test the connection
      // Cast to any type to handle differences between pg and @neondatabase/serverless
      await (client as any).query('SELECT 1 as test');
    } finally {
      client.release();
    }
    await testPool.end();
    
    console.log(`✅ Successfully connected to ${isCloud ? 'cloud' : 'local'} database`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to ${isCloud ? 'cloud' : 'local'} database:`, error);
    return false;
  }
}

// Try to connect to the cloud database first, then fall back to local if needed
async function setupDatabase(): Promise<DatabaseConnection> {
  let useCloud = false;
  
  // Check if cloud database URL exists and is accessible
  if (process.env.DATABASE_URL) {
    useCloud = await testConnection(process.env.DATABASE_URL, true);
    if (!useCloud) {
      console.warn('⚠️ Cloud database connection failed - attempting to use local database as fallback');
    }
  } else {
    console.warn('⚠️ No DATABASE_URL environment variable found - will use local database');
  }
  
  // Use cloud database if available and accessible
  if (useCloud) {
    console.log('Using cloud database (Neon)');
    const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
    const db = drizzleNeon({ client: pool, schema });
    return { pool, db, type: 'cloud' };
  } 
  // Fall back to local PostgreSQL if cloud not available
  else if (process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER) {
    const localConnectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    
    let localAvailable = await testConnection(localConnectionString, false);
    
    // If local database connection fails, attempt to set it up
    if (!localAvailable) {
      console.log('🔄 Local database not accessible, attempting to set it up...');
      const setupSuccess = await setupLocalDatabase();
      
      if (setupSuccess) {
        console.log('✅ Local database setup successful, testing connection again...');
        localAvailable = await testConnection(localConnectionString, false);
      } else {
        console.error('❌ Failed to set up local database');
      }
    }
    
    if (localAvailable) {
      console.log('Using local PostgreSQL database');
      const pool = new PgPool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD
      });
      
      const db = drizzlePg(pool, { schema });
      return { pool, db, type: 'local' };
    } else {
      throw new Error('Neither cloud nor local database are accessible');
    }
  } else {
    throw new Error(
      "No database configuration available. Please set either DATABASE_URL or local PostgreSQL environment variables.",
    );
  }
}

// Initialize database connection (but don't use top-level await)
const initializeDb = async () => {
  try {
    connection = await setupDatabase();
    return connection;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Export the initialized pool and db
export const getDbConnection = async (): Promise<DatabaseConnection> => {
  if (!connection) {
    connection = await initializeDb();
  }
  return connection;
};

// For backwards compatibility, these functions get the pool and db from the connection
export const getPool = async () => {
  const conn = await getDbConnection();
  return conn.pool;
};

export const getDb = async () => {
  const conn = await getDbConnection();
  return conn.db;
};

// Initialize the database connection when this module is imported
initializeDb().catch(err => {
  console.error('Database initialization failed:', err);
});
