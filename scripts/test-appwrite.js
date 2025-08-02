/**
 * Simple test script to verify Appwrite connection and basic operations
 * Run with: node scripts/test-appwrite.js
 */

import { Client, Databases } from 'appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = 'vietnam-insights';
const ANALYSES_COLLECTION_ID = 'analyses';
const LOTTERY_RESULTS_COLLECTION_ID = 'lottery-results';

async function testAppwriteConnection() {
  console.log('🧪 Testing Appwrite Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`APPWRITE_ENDPOINT: ${APPWRITE_ENDPOINT}`);
  console.log(`APPWRITE_PROJECT_ID: ${APPWRITE_PROJECT_ID}`);
  
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    console.error('❌ Missing required environment variables!');
    console.log('Please ensure NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID are set.');
    process.exit(1);
  }

  // Initialize client
  const client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const databases = new Databases(client);

  try {
    // Test 1: List databases
    console.log('\n🔍 Test 1: Listing databases...');
    const databasesList = await databases.list();
    console.log(`✅ Found ${databasesList.databases.length} database(s)`);
    
    const targetDb = databasesList.databases.find(db => db.$id === DATABASE_ID);
    if (targetDb) {
      console.log(`✅ Target database '${DATABASE_ID}' found`);
    } else {
      console.log(`⚠️  Target database '${DATABASE_ID}' not found`);
      console.log('Available databases:', databasesList.databases.map(db => db.$id));
      return;
    }

    // Test 2: List collections
    console.log('\n🔍 Test 2: Listing collections...');
    const collectionsList = await databases.listCollections(DATABASE_ID);
    console.log(`✅ Found ${collectionsList.collections.length} collection(s)`);
    
    const analysesCollection = collectionsList.collections.find(col => col.$id === ANALYSES_COLLECTION_ID);
    const lotteryCollection = collectionsList.collections.find(col => col.$id === LOTTERY_RESULTS_COLLECTION_ID);
    
    if (analysesCollection) {
      console.log(`✅ Analyses collection found`);
    } else {
      console.log(`⚠️  Analyses collection '${ANALYSES_COLLECTION_ID}' not found`);
    }
    
    if (lotteryCollection) {
      console.log(`✅ Lottery results collection found`);
    } else {
      console.log(`⚠️  Lottery results collection '${LOTTERY_RESULTS_COLLECTION_ID}' not found`);
    }

    // Test 3: Try to read from collections (should work even if empty)
    console.log('\n🔍 Test 3: Testing read access...');
    
    if (analysesCollection) {
      try {
        const analysesData = await databases.listDocuments(DATABASE_ID, ANALYSES_COLLECTION_ID);
        console.log(`✅ Analyses collection readable (${analysesData.documents.length} documents)`);
      } catch (error) {
        console.log(`❌ Cannot read from analyses collection: ${error.message}`);
      }
    }
    
    if (lotteryCollection) {
      try {
        const lotteryData = await databases.listDocuments(DATABASE_ID, LOTTERY_RESULTS_COLLECTION_ID);
        console.log(`✅ Lottery results collection readable (${lotteryData.documents.length} documents)`);
      } catch (error) {
        console.log(`❌ Cannot read from lottery results collection: ${error.message}`);
      }
    }

    console.log('\n🎉 Appwrite connection test completed!');
    
    if (analysesCollection && lotteryCollection) {
      console.log('✅ All required collections are available and accessible.');
      console.log('🚀 Your application should work correctly with Appwrite!');
    } else {
      console.log('⚠️  Some collections are missing. Please follow the setup guide:');
      console.log('📖 docs/appwrite-setup.md');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your environment variables');
    console.log('2. Verify your Appwrite project ID is correct');
    console.log('3. Ensure your project is accessible');
    console.log('4. Follow the setup guide: docs/appwrite-setup.md');
  }
}

// Run the test
testAppwriteConnection().catch(console.error);
