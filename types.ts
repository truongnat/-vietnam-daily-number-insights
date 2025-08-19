
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
  analysis?: AnalysisResult;
  groundingChunks?: GroundingChunk[];
  lotteryResult?: LotteryResult;
}

export interface HistoricalData {
  [dateKey: string]: StoredAnalysis;
}

// XSMB API Types
export interface XSMBPrizes {
  'ĐB': string[];
  '1': string[];
  '2': string[];
  '3': string[];
  '4': string[];
  '5': string[];
  '6': string[];
  '7': string[];
}

export interface XSMBData {
  date: string;
  region: string;
  url?: string;
  prizes: XSMBPrizes;
  allNumbers: string[];
  meta: {
    title?: string;
    detectedDate: string;
    tableSource: string;
    tbodyRowCount?: number;
    totalNumbers?: number;
  };
}

export interface XSMBResult {
  date: string;
  data?: XSMBData;
  error?: string;
}

export interface XSMBResponse {
  ok: boolean;
  range: boolean;
  region: string;
  date?: string;
  start?: string;
  end?: string;
  data?: XSMBData;
  results?: XSMBResult[];
  error?: string;
}