import { Client, Databases, ID } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Database and collection IDs
export const DATABASE_ID = 'vietnam-insights';
export const ANALYSES_COLLECTION_ID = 'analyses';
export const LOTTERY_RESULTS_COLLECTION_ID = 'lottery-results';

// Initialize Appwrite client
function createAppwriteClient(): Client {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    throw new Error('Missing Appwrite configuration. Please check your environment variables.');
  }

  const client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  return client;
}

// Create singleton instances
let client: Client | null = null;
let databases: Databases | null = null;

export function getAppwriteClient(): Client {
  if (!client) {
    client = createAppwriteClient();
  }
  return client;
}

export function getAppwriteDatabases(): Databases {
  if (!databases) {
    databases = new Databases(getAppwriteClient());
  }
  return databases;
}

// Utility function to generate document ID from date
export function getDocumentId(dateKey: string): string {
  return dateKey.replace(/-/g, '');
}

// Utility function to convert date back from document ID
export function getDateKeyFromDocumentId(documentId: string): string {
  // Convert YYYYMMDD back to YYYY-MM-DD
  return `${documentId.slice(0, 4)}-${documentId.slice(4, 6)}-${documentId.slice(6, 8)}`;
}
