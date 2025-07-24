
export interface TopNumber {
  number: string;
  count: number;
  reason: string;
}

export interface EventSource {
  title: string;
  description: string;
}

export interface LuckyNumber {
    number: string;
    reasoning: string;
}

export interface AnalysisResult {
  summary: string;
  topNumbers: TopNumber[];
  events: EventSource[];
  luckyNumber: LuckyNumber;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface StoredAnalysis {
  analysis: AnalysisResult;
  groundingChunks: GroundingChunk[];
}

export interface HistoricalData {
  [dateKey: string]: StoredAnalysis;
}
