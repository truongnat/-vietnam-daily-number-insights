
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
    strategy: string; // ví dụ: "Cân Bằng", "Tin Tức Nóng", "Bất Ngờ"
    strategyDescription: string;
}

export interface AnalysisResult {
  summary: string;
  topNumbers: TopNumber[];
  events: EventSource[];
  luckyNumbers: LuckyNumber[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface LotteryResult {
    specialPrize: string;
    allPrizes: string[];
}

export interface StoredAnalysis {
  analysis: AnalysisResult;
  groundingChunks: GroundingChunk[];
  lotteryResult?: LotteryResult;
}

export interface HistoricalData {
  [dateKey: string]: StoredAnalysis;
}