
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = (text: string): AnalysisResult | null => {
  try {
    // The model might wrap the JSON in markdown backticks, so we remove them.
    const cleanText = text.replace(/^```json\s*|```$/g, '').trim();
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
    Phân tích các tin tức, bài báo và sự kiện quan trọng nhất đã xảy ra tại Việt Nam hôm nay, cho đến 4:00 chiều giờ Việt Nam (GMT+7).

    Từ nội dung của các sự kiện này, hãy trích xuất mọi số có hai chữ số mà bạn tìm thấy (từ "00" đến "99"). Thống kê số lần xuất hiện của mỗi số duy nhất.

    Phản hồi của bạn PHẢI là một chuỗi đối tượng JSON hợp lệ duy nhất và không có gì khác. Không bao gồm bất kỳ văn bản giới thiệu, cuộc trò chuyện hoặc định dạng markdown nào như \`\`\`json. Đối tượng JSON phải tuân thủ cấu trúc chính xác này:

    {
      "summary": "Một câu tóm tắt ngắn gọn bằng tiếng Việt về các chủ đề sự kiện chính trong ngày ở Việt Nam.",
      "topNumbers": [
        { "number": "XX", "count": Y, "reason": "Một câu giải thích ngắn gọn, súc tích bằng tiếng Việt tại sao con số này nổi bật, tham chiếu đến sự kiện cụ thể." },
        { "number": "XX", "count": Y, "reason": "Một câu giải thích ngắn gọn, súc tích bằng tiếng Việt tại sao con số này nổi bật, tham chiếu đến sự kiện cụ thể." },
        { "number": "XX", "count": Y, "reason": "Một câu giải thích ngắn gọn, súc tích bằng tiếng Việt tại sao con số này nổi bật, tham chiếu đến sự kiện cụ thể." },
        { "number": "XX", "count": Y, "reason": "Một câu giải thích ngắn gọn, súc tích bằng tiếng Việt tại sao con số này nổi bật, tham chiếu đến sự kiện cụ thể." }
      ],
      "events": [
        { "title": "Tiêu đề sự kiện ngắn gọn bằng tiếng Việt", "description": "Mô tả ngắn bằng tiếng Việt về sự kiện nơi tìm thấy các con số, phù hợp để hiển thị công khai." }
      ]
    }

    Xác định bốn con số xuất hiện thường xuyên nhất và liệt kê chúng trong mảng "topNumbers", được sắp xếp theo thứ tự giảm dần của số lần xuất hiện. Đối với mỗi số, hãy cung cấp một 'lý do' giải thích ý nghĩa của nó trong bối cảnh các sự kiện trong ngày. Nếu có sự trùng lặp về số lần đếm, thứ tự không quan trọng. Cung cấp danh sách các sự kiện chính bạn đã phân tích trong mảng "events". Đảm bảo các sự kiện ngắn gọn và đầy đủ thông tin. TOÀN BỘ NỘI DUNG CỦA CÁC TRƯỜNG 'summary', 'reason', 'title', 'description' PHẢI LÀ TIẾNG VIỆT.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const analysis = parseJsonResponse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return { analysis, groundingChunks };

  } catch (error) {
    console.error("Error fetching daily analysis:", error);
    throw new Error("Không thể giao tiếp với Gemini API. Vui lòng kiểm tra kết nối và khóa API của bạn.");
  }
};
