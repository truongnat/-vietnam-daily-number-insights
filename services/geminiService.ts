import { GoogleGenAI } from "@google/genai";
import type {
  AnalysisResult,
  GroundingChunk,
  LotteryResult,
  HistoricalData,
  StoredAnalysis,
} from "@/types";
import { getAllHistoricalData } from "@/utils/storage";

function getGeminiAI() {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable not set");
  }
  console.log(
    "process.env.NEXT_PUBLIC_GEMINI_API_KEY",
    process.env.NEXT_PUBLIC_GEMINI_API_KEY
  );
  return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
}

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
  timeoutError = new Error("Promise timed out")
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError);
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
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
    const cleanText = text.replace(/^```json\s*|```$/g, "").trim();
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

export const fetchDailyAnalysis = async (): Promise<{
  analysis: AnalysisResult | null;
  groundingChunks: GroundingChunk[];
}> => {
  const model = "gemini-2.5-flash";

  // Fetch historical lottery data for statistical analysis
  const historicalData = await fetchHistoricalLotteryData();

  const prompt = `
    Phân tích tin tức và kết quả xổ số để đưa ra dự đoán số may mắn dựa trên xác suất thống kê nâng cao. Nhiệm vụ của bạn gồm năm phần:

    1.  **Phân tích Tin tức Việt Nam Hôm Nay:** Quét các tin tức, bài báo và sự kiện quan trọng ở Việt Nam tính đến 4:00 chiều giờ Việt Nam (GMT+7) hôm nay. Trích xuất tất cả các số có hai chữ số (00-99) và thống kê tần suất xuất hiện của chúng. Tập trung vào các con số nổi bật nhất trong các sự kiện quan trọng.

    2.  **Phân tích Thống kê AI Nâng cao 14 Ngày:** Sử dụng phân tích thống kê AI chuyên sâu sau đây để hiểu rõ các mẫu hình và xu hướng:
    ${historicalData}

    3.  **Tìm Kết quả Xổ số Ngày Hôm Qua:** Sử dụng Google Search, tìm kết quả "Xổ số kiến thiết Miền Bắc" của ngày hôm qua. Phân tích hai chữ số cuối của giải đặc biệt và tất cả các giải lô để tìm ra xu hướng.

    4.  **Tích hợp Phân tích Mẫu hình và Chu kỳ:** Dựa trên phân tích thống kê AI, xác định:
       - Các mẫu hình lặp lại trong 14 ngày qua
       - Số "nóng" và "lạnh" theo chu kỳ
       - Các tổ hợp số có xu hướng xuất hiện cùng nhau
       - Khoảng cách trung bình giữa các lần xuất hiện

    5.  **Dự đoán Số May Mắn Dựa Trên Xác Suất Nâng cao:** Kết hợp TẤT CẢ các yếu tố trên để đưa ra:
       - 1 SỐ MAY MẮN NHẤT có tỷ lệ cao trúng ĐỀ (giải đặc biệt) - ưu tiên dựa trên: (a) tần suất tin tức, (b) phân tích mẫu hình AI, (c) chu kỳ xuất hiện, (d) tránh số đã ra gần đây
       - 3 SỐ có tỷ lệ cao trúng LÔ (các giải khác) - dựa trên: (a) phân tích thống kê AI, (b) xu hướng "lạnh" chuyển "nóng", (c) tổ hợp số tiềm năng

    Phản hồi của bạn PHẢI là một chuỗi đối tượng JSON hợp lệ duy nhất và không có gì khác. Không bao gồm bất kỳ văn bản giới thiệu, cuộc trò chuyện hoặc định dạng markdown nào như \`\`\`json. Đối tượng JSON phải tuân thủ cấu trúc chính xác này:

    {
      "summary": "Một câu tóm tắt ngắn gọn bằng tiếng Việt về các chủ đề sự kiện chính trong ngày ở Việt Nam, không đề cập đến xổ số.",
      "bestNumber": {
        "number": "XX",
        "type": "Số Đề May Mắn Nhất",
        "probability": "Cao",
        "reasoning": "Giải thích chi tiết dựa trên: (1) Tần suất xuất hiện trong tin tức hôm nay, (2) Phân tích thống kê AI từ 14 ngày dữ liệu, (3) Mẫu hình và chu kỳ xuất hiện, (4) Xu hướng tránh số đã ra gần đây, (5) Phân tích tổ hợp số tiềm năng, (6) Mức độ nổi bật của sự kiện liên quan."
      },
      "luckyNumbers": [
        {
          "number": "AA",
          "type": "Số Lô Tiềm Năng",
          "probability": "Cao",
          "reasoning": "Phân tích xác suất dựa trên: (1) Thống kê AI 14 ngày, (2) Phân tích mẫu hình và chu kỳ, (3) Xu hướng số 'lạnh' chuyển 'nóng', (4) Tần suất trong tin tức, (5) Phân tích tổ hợp số, (6) Mức độ quan trọng của sự kiện liên quan."
        },
        {
          "number": "BB",
          "type": "Số Lô Tiềm Năng",
          "probability": "Cao",
          "reasoning": "Phân tích xác suất như trên, đảm bảo khác AA và số đề."
        },
        {
          "number": "CC",
          "type": "Số Lô Tiềm Năng",
          "probability": "Cao",
          "reasoning": "Phân tích xác suất như trên, đảm bảo khác AA, BB và số đề."
        }
      ],
      "topNumbers": [
        { "number": "EE", "count": N, "reason": "Giải thích ngắn gọn về sự kiện liên quan." },
        { "number": "FF", "count": M, "reason": "Giải thích ngắn gọn về sự kiện liên quan." },
        { "number": "GG", "count": P, "reason": "Giải thích ngắn gọn về sự kiện liên quan." },
        { "number": "HH", "count": Q, "reason": "Giải thích ngắn gọn về sự kiện liên quan." }
      ],
      "events": [
        { "title": "Tiêu đề sự kiện", "description": "Mô tả ngắn về sự kiện." }
      ]
    }

    **Yêu cầu quan trọng về phân tích xác suất thống kê:**
    - Số đề may mắn nhất TUYỆT ĐỐI KHÔNG được trùng với hai chữ số cuối của giải đặc biệt ngày hôm qua.
    - 3 số lô phải khác nhau và khác với số đề may mắn nhất.
    - SỬ DỤNG PHƯƠNG PHÁP THỐNG KÊ: Cân bằng giữa tần suất xuất hiện trong tin tức hôm nay và xác suất dựa trên dữ liệu lịch sử 7 ngày.
    - TRÁNH CÁC SỐ ĐÃ RA THƯỜNG XUYÊN: Ưu tiên số ít xuất hiện trong lịch sử gần đây nhưng có tín hiệu mạnh từ tin tức.
    - PHÂN TÍCH XU HƯỚNG: Xem xét chu kỳ và pattern từ dữ liệu lịch sử để tăng độ chính xác.
    - Liệt kê bốn con số xuất hiện thường xuyên nhất trong tin tức vào mảng "topNumbers", sắp xếp theo số lần xuất hiện giảm dần.
    - TOÀN BỘ NỘI DUNG CỦA CÁC TRƯỜNG VĂN BẢN PHẢI LÀ TIẾNG VIỆT.
  `;

  const maxRetries = 3;
  const initialDelay = 2000; // 2 seconds
  let lastError: Error = new Error(
    "Phân tích không thành công sau nhiều lần thử."
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch daily analysis...`);
      const ai = getGeminiAI();
      const generateContentPromise = ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        },
      });

      const response = (await promiseWithTimeout(
        generateContentPromise,
        90000, // 90-second timeout
        new Error(
          `Yêu cầu tới Gemini đã hết thời gian chờ (Thử lần ${attempt}).`
        )
      )) as any;

      if (!response.text) {
        throw new Error("Không nhận được phản hồi từ Gemini.");
      }

      const analysis = parseJsonResponse<AnalysisResult>(response.text);

      if (
        analysis &&
        analysis.luckyNumbers &&
        analysis.luckyNumbers.length > 0
      ) {
        const groundingChunks =
          (response.candidates?.[0]?.groundingMetadata
            ?.groundingChunks as GroundingChunk[]) || [];
        console.log("Successfully fetched and parsed analysis.");
        return { analysis, groundingChunks };
      } else {
        console.error(
          "Parsed analysis is invalid or missing luckyNumbers:",
          analysis
        );
        throw new Error("Mô hình đã trả về phản hồi không hợp lệ hoặc trống.");
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  console.error("All retry attempts failed.");
  throw new Error(
    `Không thể lấy dữ liệu phân tích sau ${maxRetries} lần thử. Lỗi cuối cùng: ${lastError.message}`
  );
};

const getVietnamDateStringForPrompt = (): string => {
  const now = new Date();
  const vietnamTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const day = String(vietnamTime.getDate()).padStart(2, "0");
  const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
  const year = vietnamTime.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Uses AI to generate enhanced statistical analysis of historical lottery data
 */
const generateAIStatisticalAnalysis = async (
  recentEntries: [string, StoredAnalysis][]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";

    // Prepare raw data for AI analysis
    let rawData = `Dữ liệu xổ số ${recentEntries.length} ngày gần nhất:\n`;
    const allNumbers: string[] = [];
    const specialNumbers: string[] = [];
    const dailyResults: { date: string; special: string; all: string[] }[] = [];

    recentEntries.forEach(([dateKey, data]) => {
      if (data.lotteryResult) {
        const { specialPrize, allPrizes } = data.lotteryResult;
        rawData += `- ${dateKey}: Đặc biệt: ${specialPrize}, Tất cả: [${allPrizes.join(
          ", "
        )}]\n`;

        specialNumbers.push(specialPrize);
        allNumbers.push(...allPrizes);
        dailyResults.push({
          date: dateKey,
          special: specialPrize,
          all: allPrizes,
        });
      }
    });

    const prompt = `
    Phân tích thống kê chuyên sâu dữ liệu xổ số sau đây để tìm ra các mẫu hình (patterns) và xu hướng:

    ${rawData}

    Hãy thực hiện phân tích toán học và thống kê chi tiết:

    1. **Phân tích tần suất**: Tính toán tần suất xuất hiện của từng số (00-99)
    2. **Phân tích chu kỳ**: Tìm các mẫu hình lặp lại theo thời gian
    3. **Phân tích khoảng cách**: Tính khoảng cách trung bình giữa các lần xuất hiện của mỗi số
    4. **Phân tích xu hướng**: Xác định số nào đang "nóng" (xuất hiện nhiều gần đây) và "lạnh" (chưa xuất hiện lâu)
    5. **Phân tích tổ hợp**: Tìm các cặp/nhóm số thường xuất hiện cùng nhau
    6. **Phân tích xác suất**: Tính xác suất xuất hiện của từng số dựa trên dữ liệu lịch sử
    7. **Dự đoán xu hướng**: Dựa trên các mẫu hình đã phát hiện, đưa ra nhận định về xu hướng tiếp theo

    Trả về phân tích dưới dạng văn bản có cấu trúc, bao gồm:
    - Thống kê tần suất chi tiết
    - Các mẫu hình đã phát hiện
    - Số "nóng" và "lạnh" hiện tại
    - Khuyến nghị về xác suất cho ngày tiếp theo
    - Phân tích rủi ro và cơ hội

    Sử dụng ngôn ngữ tiếng Việt và trình bày một cách khoa học, chính xác.
    `;

    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for more consistent analysis
      },
    });

    if (response.text) {
      return response.text;
    } else {
      // Fallback to basic analysis if AI fails
      return generateBasicStatisticalAnalysis(recentEntries);
    }
  } catch (error) {
    console.error("Error generating AI statistical analysis:", error);
    // Fallback to basic analysis
    return generateBasicStatisticalAnalysis(recentEntries);
  }
};

/**
 * Fallback basic statistical analysis
 */
const generateBasicStatisticalAnalysis = (
  recentEntries: [string, StoredAnalysis][]
): string => {
  let historicalSummary = `Dữ liệu xổ số ${recentEntries.length} ngày gần nhất:\n`;

  const allNumbers: string[] = [];
  const specialNumbers: string[] = [];

  recentEntries.forEach(([dateKey, data]) => {
    if (data.lotteryResult) {
      const { specialPrize, allPrizes } = data.lotteryResult;
      historicalSummary += `- ${dateKey}: Đặc biệt: ${specialPrize}, Tất cả: [${allPrizes.join(
        ", "
      )}]\n`;

      specialNumbers.push(specialPrize);
      allNumbers.push(...allPrizes);
    }
  });

  // Calculate frequency statistics
  const numberFrequency: { [key: string]: number } = {};
  allNumbers.forEach((num) => {
    numberFrequency[num] = (numberFrequency[num] || 0) + 1;
  });

  const sortedByFrequency = Object.entries(numberFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  historicalSummary += `\nThống kê tần suất xuất hiện (top 15):\n`;
  sortedByFrequency.forEach(([num, count]) => {
    const percentage = ((count / allNumbers.length) * 100).toFixed(1);
    historicalSummary += `- Số ${num}: ${count} lần (${percentage}%)\n`;
  });

  // Find cold numbers (haven't appeared recently)
  const recentNumbers = new Set(allNumbers.slice(-20)); // Last 20 numbers
  const coldNumbers = [];
  for (let i = 0; i <= 99; i++) {
    const num = i.toString().padStart(2, "0");
    if (!recentNumbers.has(num)) {
      coldNumbers.push(num);
    }
  }

  historicalSummary += `\nSố "lạnh" (chưa xuất hiện trong 20 số gần nhất): ${coldNumbers
    .slice(0, 10)
    .join(", ")}\n`;

  return historicalSummary;
};


/**
 * Fetches and analyzes historical lottery data for the past 14 days using AI for enhanced statistical analysis
 */
const fetchHistoricalLotteryData = async (): Promise<string> => {
  try {
    let historicalData: HistoricalData = {};
    if (typeof window === "undefined") {
      try {
        const { getAllHistoricalData: getServerData } = await import("@/utils/server-file-storage");
        historicalData = await getServerData();
      } catch (error) {
        console.error("Failed to load server-file-storage:", error);
        historicalData = {};
      }
    } else {
      historicalData = await getAllHistoricalData();
    }
    const entries = Object.entries(historicalData);

    // Get the last 14 days of data that have lottery results
    let recentEntries = entries.filter(([_, data]) => data.lotteryResult).slice(0, 14);

    // If we don't have enough data, try to search for missing results
    if (recentEntries.length < 10) {
      console.log(`Only ${recentEntries.length} days of data available, searching for missing results...`);
      try {
        // Lấy 14 ngày gần nhất
        const today = new Date();
        const targetDates: string[] = [];
        for (let i = 1; i <= 14; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          targetDates.push(dateKey);
        }
        // Dùng fetchXSMBRangeDirectly để lấy dữ liệu XSMB chuẩn
        let xsmbResults: any[] = [];
        if (typeof window === 'undefined') {
          try {
            const { fetchXSMBRangeDirectly } = await import('@/utils/xsmb-server');
            const xsmbResponse = await fetchXSMBRangeDirectly(targetDates[targetDates.length - 1], targetDates[0]);
            if (xsmbResponse && xsmbResponse.data && Array.isArray(xsmbResponse.data)) {
              xsmbResults = xsmbResponse.data;
            }
          } catch (error) {
            console.error('Failed to fetch XSMB range:', error);
          }
        }
        // Chuyển đổi dữ liệu XSMB sang dạng recentEntries cho AI
        const xsmbRecentEntries: [string, StoredAnalysis][] = xsmbResults.map((item: any) => {
          const dateKey = item.date;
          const allPrizeNumbers = Object.values(item.prizes).flat().filter((num): num is string => typeof num === 'string').map((num: string) => num.slice(-2));
          const lotteryResult = {
            specialPrize: item.prizes['ĐB'] ? item.prizes['ĐB'][0].slice(-2) : '',
            allPrizes: allPrizeNumbers
          };
          return [dateKey, {
            analysis: {
              summary: "Dữ liệu XSMB trực tiếp",
              bestNumber: { number: "00", type: "", probability: "", reasoning: "" },
              luckyNumbers: [],
              topNumbers: [],
              events: []
            },
            groundingChunks: [],
            lotteryResult
          }];
        });
        if (xsmbRecentEntries.length === 0) {
          return "Không có kết quả xổ số lịch sử để phân tích.";
        }
        console.log(`Analyzing ${xsmbRecentEntries.length} days of lottery data...`);
        // Generate AI-enhanced statistical analysis
        const aiAnalysis = await generateAIStatisticalAnalysis(xsmbRecentEntries);
        return aiAnalysis ?? "Không có phân tích AI.";
      } catch (error) {
        console.error('Error fetching historical data:', error);
        return "Lỗi khi lấy dữ liệu lịch sử.";
      }
    }

    // If we have enough recentEntries, generate AI analysis
    if (recentEntries.length > 0) {
      const aiAnalysis = await generateAIStatisticalAnalysis(recentEntries);
      return aiAnalysis ?? "Không có phân tích AI.";
    }

    // If no historical data, try to fetch current day's lottery result
    const todayString = getVietnamDateStringForPrompt();
    console.log(`Fetching current day's lottery results for ${todayString}...`);
    // Convert DD/MM/YYYY to YYYY-MM-DD format for API
    const [day, month, year] = todayString.split("/");
    const apiDateFormat = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    // First try to fetch from XSMB API directly (server-side only)
    if (typeof window === "undefined") {
      try {
        const { fetchLotteryResultForDate } = await import("@/utils/xsmb-server");
        const result = await fetchLotteryResultForDate(apiDateFormat);
        if (result) {
          console.log("Successfully fetched lottery results from XSMB API (direct):", result);
          return JSON.stringify(result);
        }
      } catch (xsmbError) {
        console.warn("Direct XSMB API failed, falling back to Gemini search:", xsmbError);
      }
    }
    // Fallback to Gemini Google Search if XSMB API fails
    const model = "gemini-2.5-flash";
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
    console.log("Falling back to Gemini Google Search...");
    const ai = getGeminiAI();
    const generateContentPromise = ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.0,
      },
    });
    const response = (await promiseWithTimeout(
      generateContentPromise,
      60000, // 60-second timeout
      new Error(`Yêu cầu lấy kết quả xổ số đã hết thời gian chờ.`)
    )) as any;
    if (!response.text) {
      throw new Error("Không nhận được phản hồi từ Gemini khi lấy kết quả xổ số.");
    }
    const result = parseJsonResponse<{ specialPrize: string | null; allPrizes: string[] }>(response.text);
    // Strict null checks and validation
    if (result && typeof result.specialPrize === "string" && result.specialPrize !== null && result.specialPrize.length === 2 && Array.isArray(result.allPrizes) && result.allPrizes.length > 0) {
      console.log("Successfully fetched and parsed lottery results from Gemini.");
      return JSON.stringify(result);
    } else if (result && result.specialPrize === null) {
      console.warn(`Model indicated that lottery results for ${todayString} are not yet available.`);
      throw new Error("Kết quả xổ số hôm nay chưa có hoặc không thể tìm thấy. Vui lòng thử lại sau ít phút.");
    } else {
      console.error("Failed to parse lottery result from model response", response.text);
      throw new Error("Mô hình trả về dữ liệu kết quả xổ số không hợp lệ.");
    }
  } catch (error) {
    console.error("Failed to fetch lottery result:", error);
    throw error;
  }
};
