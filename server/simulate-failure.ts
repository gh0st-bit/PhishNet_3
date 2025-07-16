/**
 * This utility file contains functions to simulate cloud database failures
 * for testing the fallback mechanism to the local PostgreSQL database
 */

import fs from 'fs';
import path from 'path';

const ENV_BACKUP_PATH = path.join(process.cwd(), '.env.backup');

/**
 * Simulates a cloud database failure by temporarily removing the DATABASE_URL
 * environment variable. Backup of the original value is saved.
 */
export async function simulateCloudDatabaseFailure(): Promise<boolean> {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.log('No DATABASE_URL found - cloud database failure is already simulated');
      return true;
    }
    
    // Backup the current DATABASE_URL
    const backupContent = `DATABASE_URL=${process.env.DATABASE_URL}\n`;
    fs.writeFileSync(ENV_BACKUP_PATH, backupContent);
    
    // Set DATABASE_URL to an invalid value to simulate failure
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://invalid:invalid@nonexistent-host:5432/nonexistent-db';
    
    console.log('✅ Successfully simulated cloud database failure');
    console.log(`Original URL backed up to ${ENV_BACKUP_PATH}`);
    
    return true;
  } catch (error) {
    console.error('Failed to simulate cloud database failure:', error);
    return false;
  }
}

/**
 * Restores the cloud database connection by resetting the DATABASE_URL
 * environment variable to its original value from the backup
 */
export async function restoreCloudDatabaseConnection(): Promise<boolean> {
  try {
    // Check if backup exists
    if (!fs.existsSync(ENV_BACKUP_PATH)) {
      console.log('No backup found - cannot restore cloud database connection');
      return false;
    }
    
    // Read and parse the backup
    const backupContent = fs.readFileSync(ENV_BACKUP_PATH, 'utf-8');
    const match = backupContent.match(/DATABASE_URL=(.+)/);
    
    if (!match || !match[1]) {
      console.error('Invalid backup format');
      return false;
    }
    
    // Restore the DATABASE_URL
    process.env.DATABASE_URL = match[1];
    
    // Remove the backup file
    fs.unlinkSync(ENV_BACKUP_PATH);
    
    console.log('✅ Successfully restored cloud database connection');
    return true;
  } catch (error) {
    console.error('Failed to restore cloud database connection:', error);
    return false;
  }
}

// If this file is executed directly from the command line, run the simulation
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check if we want to simulate or restore
  const isRestore = process.argv.includes('--restore');
  
  if (isRestore) {
    restoreCloudDatabaseConnection()
      .then(success => {
        if (success) {
          console.log('Cloud database connection restored');
          process.exit(0);
        } else {
          console.error('Failed to restore cloud database connection');
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('Error restoring cloud database connection:', error);
        process.exit(1);
      });
  } else {
    simulateCloudDatabaseFailure()
      .then(success => {
        if (success) {
          console.log('Cloud database failure simulated');
          process.exit(0);
        } else {
          console.error('Failed to simulate cloud database failure');
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('Error simulating cloud database failure:', error);
        process.exit(1);
      });
  }
}