import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, GroundingChunk } from '../types';

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


const parseJsonResponse = (text: string): AnalysisResult | null => {
  if (!text || !text.trim()) {
    console.warn("Received empty or whitespace-only response from model.");
    return null;
  }
  try {
    // The model might wrap the JSON in markdown backticks, so we remove them.
    const cleanText = text.replace(/^```json\s*|```$/g, '').trim();
     if (!cleanText) {
        console.warn("Response became empty after cleaning markdown wrappers.");
        return null;
    }
    return JSON.parse(cleanText) as AnalysisResult;
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

    3.  **Tổng hợp và Đề xuất:** Dựa trên cả phân tích tần suất số trong tin tức VÀ kết quả xổ số của ngày hôm qua, hãy tìm ra một mối tương quan hoặc quy luật. Từ đó, đề xuất MỘT con số may mắn có hai chữ số mà bạn tin rằng có khả năng trúng cao nhất cho ngày hôm nay. Cung cấp một lý do rõ ràng cho sự lựa chọn của bạn.

    Phản hồi của bạn PHẢI là một chuỗi đối tượng JSON hợp lệ duy nhất và không có gì khác. Không bao gồm bất kỳ văn bản giới thiệu, cuộc trò chuyện hoặc định dạng markdown nào như \`\`\`json. Đối tượng JSON phải tuân thủ cấu trúc chính xác này:

    {
      "summary": "Một câu tóm tắt ngắn gọn bằng tiếng Việt về các chủ đề sự kiện chính trong ngày ở Việt Nam, không đề cập đến xổ số.",
      "luckyNumber": {
        "number": "XX",
        "reasoning": "Một lời giải thích ngắn gọn, thuyết phục bằng tiếng Việt giải thích tại sao con số này được chọn, dựa trên sự kết hợp giữa phân tích tin tức và kết quả xổ số ngày hôm qua."
      },
      "topNumbers": [
        { "number": "XX", "count": Y, "reason": "Giải thích ngắn gọn bằng tiếng Việt tại sao con số này nổi bật trong tin tức." },
        { "number": "XX", "count": Y, "reason": "Giải thích ngắn gọn bằng tiếng Việt tại sao con số này nổi bật trong tin tức." },
        { "number": "XX", "count": Y, "reason": "Giải thích ngắn gọn bằng tiếng Việt tại sao con số này nổi bật trong tin tức." },
        { "number": "XX", "count": Y, "reason": "Giải thích ngắn gọn bằng tiếng Việt tại sao con số này nổi bật trong tin tức." }
      ],
      "events": [
        { "title": "Tiêu đề sự kiện ngắn gọn bằng tiếng Việt", "description": "Mô tả ngắn bằng tiếng Việt về sự kiện nơi tìm thấy các con số." }
      ]
    }

    **Yêu cầu quan trọng:**
    - Con số trong trường "luckyNumber.number" TUYỆT ĐỐI KHÔNG được trùng với hai chữ số cuối của giải đặc biệt ngày hôm qua.
    - Liệt kê bốn con số xuất hiện thường xuyên nhất trong tin tức vào mảng "topNumbers", sắp xếp theo số lần xuất hiện giảm dần.
    - TOÀN BỘ NỘI DUNG CỦA CÁC TRƯỜNG 'summary', 'reasoning', 'reason', 'title', 'description' PHẢI LÀ TIẾNG VIỆT.
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
          temperature: 0.2,
        },
      });

      const response = await promiseWithTimeout(
        generateContentPromise,
        90000, // 90-second timeout
        new Error(`Yêu cầu tới Gemini đã hết thời gian chờ (Thử lần ${attempt}).`)
      );

      const analysis = parseJsonResponse(response.text);

      if (analysis) {
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        console.log("Successfully fetched and parsed analysis.");
        return { analysis, groundingChunks };
      } else {
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