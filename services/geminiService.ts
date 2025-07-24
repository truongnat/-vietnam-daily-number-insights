
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, GroundingChunk, LotteryResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Wraps a promise with a timeout.
 * @param promise The promise to wrap.
 * @param ms The timeout in milliseconds.
 * @param timeoutError The error to reject with on timeout.
 * @returns The promise with timeout logic.
 */
const promiseWithTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Promise timed out')
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError);
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(reason => {
        clearTimeout(timer);
        reject(reason);
      });
  });
};


const parseJsonResponse = <T>(text: string): T | null => {
  if (!text || !text.trim()) {
    console.warn("Received empty or whitespace-only response from model.");
    return null;
  }
  try {
    const cleanText = text.replace(/^```json\s*|```$/g, '').trim();
     if (!cleanText) {
        console.warn("Response became empty after cleaning markdown wrappers.");
        return null;
    }
    return JSON.parse(cleanText) as T;
  } catch (error) {
    console.error("Failed to parse JSON from model response:", error);
    console.error("Raw response text:", text);
    return null;
  }
};

export const fetchDailyAnalysis = async (): Promise<{ analysis: AnalysisResult | null, groundingChunks: GroundingChunk[] }> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    Phân tích tin tức và kết quả xổ số để đưa ra dự đoán. Nhiệm vụ của bạn gồm ba phần:

    1.  **Phân tích Tin tức Việt Nam Hôm Nay:** Quét các tin tức, bài báo và sự kiện quan trọng ở Việt Nam tính đến 4:00 chiều giờ Việt Nam (GMT+7) hôm nay. Trích xuất tất cả các số có hai chữ số (00-99) và thống kê tần suất xuất hiện của chúng.

    2.  **Tìm Kết quả Xổ số Ngày Hôm Qua:** Sử dụng Google Search, tìm kết quả "Xổ số kiến thiết Miền Bắc" của ngày hôm qua. Cụ thể, xác định hai chữ số cuối của giải đặc biệt.

    3.  **Tổng hợp và Đề xuất 3 Con Số:** Dựa trên phân tích, hãy đề xuất một mảng gồm ĐÚNG BA con số may mắn. Mỗi con số phải tuân theo một chiến lược riêng biệt được mô tả bên dưới.

    Phản hồi của bạn PHẢI là một chuỗi đối tượng JSON hợp lệ duy nhất và không có gì khác. Không bao gồm bất kỳ văn bản giới thiệu, cuộc trò chuyện hoặc định dạng markdown nào như \`\`\`json. Đối tượng JSON phải tuân thủ cấu trúc chính xác này:

    {
      "summary": "Một câu tóm tắt ngắn gọn bằng tiếng Việt về các chủ đề sự kiện chính trong ngày ở Việt Nam, không đề cập đến xổ số.",
      "luckyNumbers": [
        {
          "number": "XX",
          "strategy": "Cân Bằng",
          "strategyDescription": "Kết hợp tin tức và lịch sử",
          "reasoning": "Giải thích ngắn gọn tại sao con số này là sự lựa chọn cân bằng, kết hợp giữa tần suất xuất hiện trong tin tức và việc né tránh các con số đã ra gần đây."
        },
        {
          "number": "YY",
          "strategy": "Tin Tức Nóng",
          "strategyDescription": "Dựa hoàn toàn vào sự kiện",
          "reasoning": "Giải thích tại sao con số này là 'nóng' nhất, nổi bật nhất trong các sự kiện và tin tức trong ngày, bất kể lịch sử xổ số."
        },
        {
          "number": "ZZ",
          "strategy": "Bất Ngờ",
          "strategyDescription": "Số 'lạnh' có tiềm năng",
          "reasoning": "Giải thích tại sao con số này là một lựa chọn bất ngờ. Có thể nó đã lâu không xuất hiện (số 'lạnh') nhưng một sự kiện đặc biệt hôm nay mang lại dấu hiệu tiềm năng cho nó."
        }
      ],
      "topNumbers": [
        { "number": "AA", "count": N, "reason": "Giải thích ngắn gọn về sự kiện liên quan." },
        { "number": "BB", "count": M, "reason": "Giải thích ngắn gọn về sự kiện liên quan." },
        { "number": "CC", "count": P, "reason": "Giải thích ngắn gọn về sự kiện liên quan." },
        { "number": "DD", "count": Q, "reason": "Giải thích ngắn gọn về sự kiện liên quan." }
      ],
      "events": [
        { "title": "Tiêu đề sự kiện", "description": "Mô tả ngắn về sự kiện." }
      ]
    }

    **Yêu cầu quan trọng:**
    - Số trong chiến lược "Cân Bằng" TUYỆT ĐỐI KHÔNG được trùng với hai chữ số cuối của giải đặc biệt ngày hôm qua.
    - Cung cấp chính xác BA đối tượng trong mảng "luckyNumbers", mỗi đối tượng có một chiến lược khác nhau.
    - Liệt kê bốn con số xuất hiện thường xuyên nhất trong tin tức vào mảng "topNumbers", sắp xếp theo số lần xuất hiện giảm dần.
    - TOÀN BỘ NỘI DUNG CỦA CÁC TRƯỜNG VĂN BẢN PHẢI LÀ TIẾNG VIỆT.
  `;

  const maxRetries = 3;
  const initialDelay = 2000; // 2 seconds
  let lastError: Error = new Error("Phân tích không thành công sau nhiều lần thử.");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch daily analysis...`);
      const generateContentPromise = ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        },
      });

      const response = await promiseWithTimeout(
        generateContentPromise,
        90000, // 90-second timeout
        new Error(`Yêu cầu tới Gemini đã hết thời gian chờ (Thử lần ${attempt}).`)
      );

      const analysis = parseJsonResponse<AnalysisResult>(response.text);

      if (analysis && analysis.luckyNumbers && analysis.luckyNumbers.length > 0) {
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        console.log("Successfully fetched and parsed analysis.");
        return { analysis, groundingChunks };
      } else {
        console.error("Parsed analysis is invalid or missing luckyNumbers:", analysis);
        throw new Error("Mô hình đã trả về phản hồi không hợp lệ hoặc trống.");
      }

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  
  console.error("All retry attempts failed.");
  throw new Error(`Không thể lấy dữ liệu phân tích sau ${maxRetries} lần thử. Lỗi cuối cùng: ${lastError.message}`);
};


const getVietnamDateStringForPrompt = (): string => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const day = String(vietnamTime.getDate()).padStart(2, '0');
  const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
  const year = vietnamTime.getFullYear();
  return `${day}/${month}/${year}`;
};


export const fetchCurrentDayLotteryResult = async (): Promise<LotteryResult | null> => {
  const model = 'gemini-2.5-flash';
  const todayString = getVietnamDateStringForPrompt();

  const prompt = `
    Sử dụng Google Search, tìm kết quả "Xổ số kiến thiết Miền Bắc" (KQXSMB) cho ngày ${todayString}.
    Nhiệm vụ của bạn là trích xuất hai chữ số cuối của TẤT CẢ các giải. Đặc biệt, tìm hai chữ số cuối của giải Đặc Biệt.

    Nếu bạn tìm thấy kết quả:
    - Trả về một đối tượng JSON với hai chữ số cuối của giải đặc biệt trong trường "specialPrize" và một mảng chứa hai chữ số cuối của TẤT CẢ các giải (bao gồm cả giải đặc biệt và các giải lô khác) trong trường "allPrizes".

    Nếu bạn KHÔNG thể tìm thấy kết quả cho ngày ${todayString} sau khi đã tìm kiếm kỹ lưỡng:
    - Trả về một đối tượng JSON với trường "specialPrize" có giá trị là null và "allPrizes" là một mảng rỗng.

    Phản hồi của bạn PHẢI là một chuỗi đối tượng JSON hợp lệ duy nhất. Không thêm bất kỳ văn bản, ghi chú hay markdown nào.
    Cấu trúc JSON mong muốn khi có kết quả:
    {
      "specialPrize": "XX",
      "allPrizes": ["XX", "XY", "ZA", "BC", "..."]
    }

    Cấu trúc JSON mong muốn khi KHÔNG có kết quả:
    {
      "specialPrize": null,
      "allPrizes": []
    }
  `;

  try {
    console.log(`Fetching current day's lottery results for ${todayString}...`);
    const generateContentPromise = ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.0,
      },
    });

    const response = await promiseWithTimeout(
      generateContentPromise,
      60000, // 60-second timeout
      new Error(`Yêu cầu lấy kết quả xổ số đã hết thời gian chờ.`)
    );

    const result = parseJsonResponse<{ specialPrize: string | null, allPrizes: string[] }>(response.text);
    
    // Stricter validation
    if (result && typeof result.specialPrize === 'string' && result.specialPrize.length === 2 && Array.isArray(result.allPrizes) && result.allPrizes.length > 0) {
      console.log("Successfully fetched and parsed lottery results.");
      return result as LotteryResult;
    } else {
      if (result && result.specialPrize === null) {
          console.warn(`Model indicated that lottery results for ${todayString} are not yet available.`);
          throw new Error("Kết quả xổ số hôm nay chưa có hoặc không thể tìm thấy. Vui lòng thử lại sau ít phút.");
      }
      console.error("Failed to parse lottery result from model response", response.text);
      throw new Error("Mô hình trả về dữ liệu kết quả xổ số không hợp lệ.");
    }
  } catch (error) {
    console.error("Failed to fetch lottery result:", error);
    throw error;
  }
};
