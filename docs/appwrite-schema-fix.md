# Appwrite Schema Fix - Simplified Attributes

## Problem
The original schema had too many attributes per collection, causing Appwrite to show the error:
> "The maximum number or size of attributes for this collection has been reached."

## Solution
We've simplified the schema to use fewer, larger attributes that store JSON data.

## Updated Schema

### Collection: analyses
**Only 4 attributes needed:**
- `dateKey` (String, Required, Size: 10)
- `analysisData` (String, Required, Size: 1000000) - Stores entire analysis as JSON
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

### Collection: lottery-results
**Only 4 attributes needed:**
- `dateKey` (String, Required, Size: 10)
- `lotteryData` (String, Required, Size: 10000) - Stores entire lottery result as JSON
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

## Migration Steps

### If you already created collections with the old schema:

1. **Delete existing collections** (if they have too many attributes):
   - Go to Appwrite console
   - Delete `analyses` collection
   - Delete `lottery-results` collection

2. **Create new collections** with the simplified schema above

3. **Set permissions** for both collections:
   - Read: Any
   - Write: Any (or restrict as needed)

### If you haven't created collections yet:

1. Follow the updated setup guide in `docs/appwrite-setup.md`
2. Use the simplified schema above

## Benefits of Simplified Schema

1. **Fewer attributes** - Avoids Appwrite's attribute count limits
2. **Larger storage** - Can store more complex data structures
3. **Easier management** - Fewer fields to configure
4. **Better performance** - Single JSON field is faster than multiple small fields
5. **Future-proof** - Easy to add new data without schema changes

## Data Structure

The `analysisData` field stores this JSON structure:
```json
{
  "analysis": {
    "summary": "Analysis summary text",
    "bestNumber": { "number": "12", "type": "Số Đề May Mắn Nhất", "probability": "Cao", "reasoning": "..." },
    "luckyNumbers": [{ "number": "34", "type": "Số Lô Tiềm Năng", "probability": "Cao", "reasoning": "..." }],
    "topNumbers": [{ "number": "56", "count": 3, "reason": "Appeared in news events" }],
    "events": [{ "title": "Event title", "description": "Event description" }]
  },
  "groundingChunks": [{ "web": { "uri": "https://...", "title": "News title" } }]
}
```

The `lotteryData` field stores this JSON structure:
```json
{
  "specialPrize": "12345",
  "allPrizes": ["12345", "67890", "11111", ...]
}
```

## Testing

After updating your schema, test with:
```bash
pnpm run test:appwrite
```

This will verify your collections are properly configured and accessible.

## Code Changes

The application code has been updated to work with this simplified schema:
- `utils/appwrite-database.ts` - Updated to use single JSON fields
- All API routes continue to work the same way
- No changes needed to frontend components

Your application will work exactly the same, but now with a more efficient database schema!
