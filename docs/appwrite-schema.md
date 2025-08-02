# Appwrite Database Schema

## Database: vietnam-insights

### Collection: analyses
Stores daily analysis data including AI-generated insights and lucky numbers.

**Attributes:**
- `dateKey` (string, required) - Date in YYYY-MM-DD format (used as document ID)
- `summary` (string, required) - Analysis summary
- `bestNumber` (string, required) - JSON string of BestNumber object
- `luckyNumbers` (string, required) - JSON string array of LuckyNumber objects
- `topNumbers` (string, required) - JSON string array of TopNumber objects
- `events` (string, required) - JSON string array of EventSource objects
- `groundingChunks` (string, required) - JSON string array of GroundingChunk objects
- `createdAt` (datetime, required) - Timestamp when analysis was created
- `updatedAt` (datetime, required) - Timestamp when analysis was last updated

**Indexes:**
- `dateKey` (unique) - For fast date-based queries
- `createdAt` (descending) - For chronological ordering

### Collection: lottery-results
Stores daily lottery results for comparison with predictions.

**Attributes:**
- `dateKey` (string, required) - Date in YYYY-MM-DD format (used as document ID)
- `specialPrize` (string, required) - The special prize number
- `allPrizes` (string, required) - JSON string array of all prize numbers
- `createdAt` (datetime, required) - Timestamp when result was recorded
- `updatedAt` (datetime, required) - Timestamp when result was last updated

**Indexes:**
- `dateKey` (unique) - For fast date-based queries
- `createdAt` (descending) - For chronological ordering

## Data Transformation

### From JSON to Appwrite
- Complex objects (bestNumber, luckyNumbers, etc.) are serialized to JSON strings
- Date keys are used as document IDs for efficient querying
- Timestamps are added for audit trail

### From Appwrite to Application
- JSON strings are parsed back to objects
- Document IDs are converted back to date keys
- Data is combined for historical views

## Migration Strategy
1. Create database and collections in Appwrite console
2. Set up proper permissions (read/write for authenticated users)
3. Implement new database operations alongside existing JSON operations
4. Test thoroughly before switching over
5. Migrate existing JSON data to Appwrite (optional)
