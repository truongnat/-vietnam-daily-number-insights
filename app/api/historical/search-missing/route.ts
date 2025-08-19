import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { saveLotteryResultForDate } from '@/utils/storage';
import type { LotteryResult } from '@/types';

function getGeminiAI() {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
}

function parseJsonResponse<T>(text: string): T | null {
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    return null;
  }
}

/**
 * Searches for missing historical lottery results using AI and saves them to database
 */
export async function POST() {
  try {
    console.log('Starting search for missing historical lottery results...');

    // Generate list of dates for the past 14 days
    const today = new Date();
    const targetDates: string[] = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      targetDates.push(dateKey);
    }

    const foundResults: { [date: string]: LotteryResult } = {};
    const errors: string[] = [];

    // Search for each missing date
    for (const dateKey of targetDates) {
      try {
        const vietnamDate = new Date(dateKey + 'T12:00:00+07:00');
        const dateString = vietnamDate.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Ho_Chi_Minh'
        });

        const prompt = `
        Sử dụng Google Search, tìm kết quả "Xổ số kiến thiết Miền Bắc" (KQXSMB) cho ngày ${dateString} (${dateKey}).
        
        Nhiệm vụ: Trích xuất hai chữ số cuối của TẤT CẢ các giải xổ số.
        
        Nếu tìm thấy kết quả, trả về JSON với format:
        {
          "specialPrize": "XX",
          "allPrizes": ["XX", "YY", "ZZ", ...]
        }
        
        Nếu không tìm thấy, trả về:
        {
          "specialPrize": null,
          "allPrizes": []
        }
        `;

        const ai = getGeminiAI();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.0,
          },
        });

        if (response.text) {
          const result = parseJsonResponse<{
            specialPrize: string | null;
            allPrizes: string[];
          }>(response.text);

          if (result && result.specialPrize && result.allPrizes.length > 0) {
            const lotteryResult: LotteryResult = {
              specialPrize: result.specialPrize,
              allPrizes: result.allPrizes
            };

            // Save to database
            await saveLotteryResultForDate(dateKey, lotteryResult);
            foundResults[dateKey] = lotteryResult;
            
            console.log(`Found and saved lottery result for ${dateKey}: ${result.specialPrize}`);
          } else {
            console.log(`No lottery result found for ${dateKey}`);
          }
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        const errorMsg = `Error searching lottery result for ${dateKey}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Search completed. Found ${Object.keys(foundResults).length} lottery results.`,
      foundResults,
      errors: errors.length > 0 ? errors : undefined,
      searchedDates: targetDates
    });

  } catch (error) {
    console.error('Error in historical search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to search for missing historical lottery results',
    description: 'This endpoint searches for missing lottery results from the past 14 days and saves them to the database'
  });
}
