// Appwrite logic removed. All storage is now handled by localStorage. See utils/storage.ts for implementation.
    for (const doc of lotteryResponse.documents) {
      const dateKey = doc.dateKey;
      if (result[dateKey]) {
        const lotteryData = JSON.parse(doc.lotteryData);
        result[dateKey].lotteryResult = lotteryData;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to retrieve historical data from Appwrite:', error);
    return {};
  }
}

/**
 * Retrieves analysis data for a specific date from Appwrite.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @returns The StoredAnalysis object for the date, or null if it doesn't exist.
 */
export async function getAnalysisForDate(dateKey: string): Promise<StoredAnalysis | null> {
  try {
    const databases = getAppwriteDatabases();
    const documentId = getDocumentId(dateKey);
    
    // Get analysis
    let analysisDoc;
    try {
      analysisDoc = await databases.getDocument(
        DATABASE_ID,
        ANALYSES_COLLECTION_ID,
        documentId
      );
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
    
    const analysisData = JSON.parse(analysisDoc.analysisData);
    const storedAnalysis: StoredAnalysis = {
      analysis: analysisData.analysis,
      groundingChunks: analysisData.groundingChunks
    };
    
    // Try to get lottery result
    try {
      const lotteryDoc = await databases.getDocument(
        DATABASE_ID,
        LOTTERY_RESULTS_COLLECTION_ID,
        documentId
      );
      
      const lotteryData = JSON.parse(lotteryDoc.lotteryData);
      storedAnalysis.lotteryResult = lotteryData;
    } catch (error: any) {
      // Lottery result doesn't exist, that's okay
      if (error.code !== 404) {
        console.warn('Error fetching lottery result:', error);
      }
    }
    
    return storedAnalysis;
  } catch (error) {
    console.error(`Failed to retrieve analysis for ${dateKey} from Appwrite:`, error);
    return null;
  }
}

/**
 * Saves analysis data for a specific date to Appwrite.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param data The analysis data to save.
 */
export async function saveAnalysisForDate(
  dateKey: string,
  data: Omit<StoredAnalysis, 'lotteryResult'>
): Promise<void> {
  try {
    const databases = getAppwriteDatabases();
    const documentId = getDocumentId(dateKey);

    const documentData = {
      dateKey,
      analysisData: JSON.stringify({
        analysis: data.analysis,
        groundingChunks: data.groundingChunks
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Try to update existing document
      await databases.updateDocument(
        DATABASE_ID,
        ANALYSES_COLLECTION_ID,
        documentId,
        { ...documentData, updatedAt: new Date().toISOString() }
      );
    } catch (error: any) {
      if (error.code === 404) {
        // Document doesn't exist, create new one
        await databases.createDocument(
          DATABASE_ID,
          ANALYSES_COLLECTION_ID,
          documentId,
          documentData
        );
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Failed to save analysis for ${dateKey} to Appwrite:`, error);
    throw error;
  }
}

/**
 * Deletes analysis data for a specific date from Appwrite.
 * @param dateKey The date key in YYYY-MM-DD format.
 */
export async function deleteAnalysisForDate(dateKey: string): Promise<void> {
  try {
    const databases = getAppwriteDatabases();
    const documentId = getDocumentId(dateKey);

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        ANALYSES_COLLECTION_ID,
        documentId
      );
    } catch (error: any) {
      if (error.code === 404) {
        // Document doesn't exist, that's okay
        console.log(`Analysis for ${dateKey} doesn't exist, nothing to delete`);
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Failed to delete analysis for ${dateKey} from Appwrite:`, error);
    throw error;
  }
}

/**
 * Deletes lottery result for a specific date from Appwrite.
 * @param dateKey The date key in YYYY-MM-DD format.
 */
export async function deleteLotteryResultForDate(dateKey: string): Promise<void> {
  try {
    const databases = getAppwriteDatabases();
    const documentId = getDocumentId(dateKey);

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        LOTTERY_RESULTS_COLLECTION_ID,
        documentId
      );
    } catch (error: any) {
      if (error.code === 404) {
        // Document doesn't exist, that's okay
        console.log(`Lottery result for ${dateKey} doesn't exist, nothing to delete`);
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Failed to delete lottery result for ${dateKey} from Appwrite:`, error);
    throw error;
  }
}

/**
 * Saves lottery result for a specific date to Appwrite.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param result The lottery result to save.
 */
export async function saveLotteryResultForDate(dateKey: string, result: LotteryResult): Promise<void> {
  try {
    const databases = getAppwriteDatabases();
    const documentId = getDocumentId(dateKey);

    const documentData = {
      dateKey,
      lotteryData: JSON.stringify(result),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Try to update existing document
      await databases.updateDocument(
        DATABASE_ID,
        LOTTERY_RESULTS_COLLECTION_ID,
        documentId,
        { ...documentData, updatedAt: new Date().toISOString() }
      );
    } catch (error: any) {
      if (error.code === 404) {
        // Document doesn't exist, create new one
        await databases.createDocument(
          DATABASE_ID,
          LOTTERY_RESULTS_COLLECTION_ID,
          documentId,
          documentData
        );
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey} to Appwrite:`, error);
    throw error;
  }
}

/**
 * Closes the database connection (no-op for Appwrite).
 */
export function closeDatabase(): void {
  // No-op for Appwrite - connections are managed automatically
}
