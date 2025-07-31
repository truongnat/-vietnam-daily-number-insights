
export interface TopNumber {
  number: string;
  count: number;
  reason: string;
}

export interface EventSource {
  title: string;
  description: string;
}

export interface BestNumber {
    number: string;
    type: string; // "Số Đề May Mắn Nhất"
    probability: string; // "Cao"
    reasoning: string;
}

export interface LuckyNumber {
    number: string;
    type: string; // "Số Lô Tiềm Năng"
    probability: string; // "Cao"
    reasoning: string;
}

export interface AnalysisResult {
  summary: string;
  bestNumber: BestNumber;
  luckyNumbers: LuckyNumber[];
  topNumbers: TopNumber[];
  events: EventSource[];
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