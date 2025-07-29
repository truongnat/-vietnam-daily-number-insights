import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, GroundingChunk, LotteryResult } from '../../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ...existing code from original file...
