import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Create a singleton instance
let instance: MongoDbConnection | null = null;

// Store connection state and URI
export class MongoDbConnection {
  private static _instance: MongoDbConnection;
  private _mongoMemoryServer: MongoMemoryServer | null = null;
  private _isConnected = false;
  private _mongoUri: string | null = null;
  
  private constructor() {}
  
  public static getInstance(): MongoDbConnection {
    if (!MongoDbConnection._instance) {
      MongoDbConnection._instance = new MongoDbConnection();
    }
    return MongoDbConnection._instance;
  }
  
  public get isConnected(): boolean {
    return this._isConnected;
  }
  
  public get mongoUri(): string | null {
    return this._mongoUri;
  }
  
  public async connect(): Promise<typeof mongoose> {
    // If already connected, just return the mongoose instance
    if (this._isConnected) {
      console.log('MongoDB is already connected');
      return mongoose;
    }

    // If mongoose is already connecting to something else, don't try to connect again
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      this._isConnected = true;
      console.log('MongoDB connection already in progress');
      return mongoose;
    }

    try {
      // Only create a server if we don't already have one
      if (!this._mongoMemoryServer) {
        this._mongoMemoryServer = await MongoMemoryServer.create();
        this._mongoUri = this._mongoMemoryServer.getUri();
        console.log(`Starting MongoDB in-memory server at ${this._mongoUri}`);
      }
      
      // Only connect if we're not already connected
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(this._mongoUri as string);
      }
      
      this._isConnected = true;
      console.log('✅ MongoDB in-memory server connected successfully');
      return mongoose;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }
  
  public async disconnect(): Promise<void> {
    if (!this._isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      
      if (this._mongoMemoryServer) {
        await this._mongoMemoryServer.stop();
        this._mongoMemoryServer = null;
      }
      
      this._isConnected = false;
      console.log('MongoDB in-memory server disconnected');
    } catch (error) {
      console.error('MongoDB disconnect error:', error);
      throw error;
    }
  }
}

// Get the MongoDB connection singleton
const mongoConnection = MongoDbConnection.getInstance();

// Export connection functions that use the singleton
export const connectToDatabase = async (): Promise<typeof mongoose> => {
  return mongoConnection.connect();
};

export const mongoUri = (): string | null => {
  return mongoConnection.mongoUri;
};

/**
 * Disconnect from MongoDB
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  return mongoConnection.disconnect();
};

// For testing connection status
export const getConnectionStatus = (): boolean => {
  return mongoConnection.isConnected;
};