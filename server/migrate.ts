import { db, pool } from './db';
import { users } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This migration script adds new columns to the users table for improved security and profile features
 */
async function runMigration() {
  console.log('Starting migration...');
  
  try {
    // Check if columns already exist
    const checkResult = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the new columns if they don't exist
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_picture TEXT,
        ADD COLUMN IF NOT EXISTS position TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS account_locked BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ
      `);
      
      console.log('Migration completed successfully - added new columns to users table.');
    } else {
      console.log('Migration not needed - columns already exist.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();