// This script sets up a local PostgreSQL database when the cloud database is unavailable
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { eq } from 'drizzle-orm';

/**
 * Script to initialize a local PostgreSQL database for fallback functionality
 * This will be used when the cloud database is unavailable
 */
async function setupLocalDatabase() {
  try {
    // Check if DATABASE_URL environment variable is available
    const localDbUrl = process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/phishnet_local';
    
    console.log('Setting up local PostgreSQL database...');
    
    // Create a connection to the local database
    const pool = new Pool({ connectionString: localDbUrl });
    const db = drizzle(pool, { schema });
    
    // Implement the migration logic here to create tables
    // This is a simple approach - for production, you would use drizzle-kit migrations
    console.log('Creating tables in local database if they do not exist...');

    // Push the schema to the database
    console.log('Running migrations on local database...');
    try {
      // Use drizzle-orm's built-in function to create tables without formal migrations
      // This is a simplified approach for the fallback case
      await db.execute(`
        CREATE TABLE IF NOT EXISTS organizations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('Organization table created or already exists');
      
      // Create other essential tables
      // Users table with references to organizations
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          profile_picture TEXT,
          position TEXT,
          bio TEXT,
          failed_login_attempts INTEGER NOT NULL DEFAULT 0,
          last_failed_login TIMESTAMP,
          account_locked BOOLEAN NOT NULL DEFAULT FALSE,
          account_locked_until TIMESTAMP,
          is_admin BOOLEAN NOT NULL DEFAULT FALSE,
          organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          organization_name TEXT NOT NULL DEFAULT 'None',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('Users table created or already exists');

      // Create a default organization if none exists
      const orgs = await db.select().from(schema.organizations);
      if (orgs.length === 0) {
        console.log('Creating default organization...');
        await db.insert(schema.organizations).values({
          name: 'Default Organization',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Create an admin user if none exists
      const users = await db.select().from(schema.users);
      if (users.length === 0) {
        console.log('Creating default admin user...');
        
        // Get the default organization ID
        const [defaultOrg] = await db.select().from(schema.organizations).limit(1);
        
        if (defaultOrg) {
          await db.insert(schema.users).values({
            email: 'admin@example.com',
            password: '$2b$10$mLTrEbFgI.YYWEC4Uv4qd.PWMBkKykmMN2wbHeCLBjEmKjB3iDFtW', // hashed 'password123'
            firstName: 'Admin',
            lastName: 'User',
            isAdmin: true,
            organizationId: defaultOrg.id,
            organizationName: defaultOrg.name,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log('Default admin user created');
        }
      }
      
      console.log('Local database setup complete!');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
    
    await pool.end();
    return true;
  } catch (error) {
    console.error('Failed to set up local database:', error);
    return false;
  }
}

// Run the setup script if this file is executed directly from the command line
// In ES modules, we use import.meta.url to detect direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  setupLocalDatabase()
    .then(success => {
      if (success) {
        console.log('✅ Local database setup successfully completed');
        process.exit(0);
      } else {
        console.error('❌ Local database setup failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Uncaught error during local database setup:', error);
      process.exit(1);
    });
}

export { setupLocalDatabase };