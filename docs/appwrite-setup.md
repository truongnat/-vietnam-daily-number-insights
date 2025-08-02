# Appwrite Database Setup Guide

This guide will help you set up the Appwrite database and collections for the Vietnam Daily Number Insights application.

## Prerequisites

1. Appwrite account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Project created in Appwrite console
3. Environment variables configured in `.env`:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id`

## Database Setup

### Step 1: Create Database

1. Go to your Appwrite console
2. Navigate to "Databases" section
3. Click "Create Database"
4. Set Database ID: `vietnam-insights`
5. Set Database Name: `Vietnam Insights`

### Step 2: Create Collections

#### Collection 1: Analyses

1. Click "Create Collection" in the `vietnam-insights` database
2. Set Collection ID: `analyses`
3. Set Collection Name: `Analyses`

**Attributes:**
- `dateKey` (String, Required, Size: 10)
- `summary` (String, Required, Size: 5000)
- `bestNumber` (String, Required, Size: 1000)
- `luckyNumbers` (String, Required, Size: 5000)
- `topNumbers` (String, Required, Size: 5000)
- `events` (String, Required, Size: 10000)
- `groundingChunks` (String, Required, Size: 10000)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes:**
- `dateKey_unique` (Unique, Key: dateKey)
- `createdAt_desc` (Key: createdAt, Order: DESC)

#### Collection 2: Lottery Results

1. Click "Create Collection" in the `vietnam-insights` database
2. Set Collection ID: `lottery-results`
3. Set Collection Name: `Lottery Results`

**Attributes:**
- `dateKey` (String, Required, Size: 10)
- `specialPrize` (String, Required, Size: 10)
- `allPrizes` (String, Required, Size: 1000)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes:**
- `dateKey_unique` (Unique, Key: dateKey)
- `createdAt_desc` (Key: createdAt, Order: DESC)

### Step 3: Configure Permissions

For both collections, set the following permissions:

**Read Access:**
- Any (for public access to historical data)

**Write Access:**
- Any (for API endpoints to save data)

*Note: In production, you should restrict write access to authenticated users or API keys.*

## Testing the Setup

After setting up the database and collections, you can test the integration:

1. Start your development server: `pnpm dev`
2. Try accessing the historical data endpoint: `http://localhost:3000/api/storage/historical`
3. The endpoint should return an empty object `{}` initially (no errors)

## Migration from JSON

If you have existing data in the JSON file (`data/vietnam-insights.json`), you can migrate it manually:

1. Export your existing data from the JSON file
2. Use the Appwrite console to import data, or
3. Create a migration script using the API endpoints

## Troubleshooting

**Common Issues:**

1. **"Missing Appwrite configuration" error:**
   - Check your environment variables
   - Ensure the project ID is correct

2. **"Collection not found" error:**
   - Verify collection IDs match exactly: `analyses` and `lottery-results`
   - Check database ID is `vietnam-insights`

3. **Permission denied errors:**
   - Check collection permissions allow read/write access
   - Verify API key permissions if using authentication

4. **Attribute size errors:**
   - Ensure attribute sizes are sufficient for your data
   - Increase sizes if needed in the Appwrite console

## Next Steps

Once the database is set up:

1. Test the application functionality
2. Verify data is being saved correctly
3. Check the Appwrite console to see stored documents
4. Set up proper authentication and permissions for production use
