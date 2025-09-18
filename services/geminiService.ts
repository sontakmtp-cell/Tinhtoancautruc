
import { GoogleGenAI } from "@google/genai";
import type { BeamInputs, CalculationResults } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Missing Google Gemini API Key. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const systemPrompt = `Bạn là một kỹ sư kết cấu chuyên nghiệp với nhiều năm kinh nghiệm. Một thiết kế dầm cầu trục đã không đạt các kiểm tra an toàn. Nhiệm vụ của bạn là đưa ra một khuyến nghị ngắn gọn, súc tích, và có thể hành động ngay để cải thiện thiết kế. 
Hãy tập trung vào việc đề xuất các thay đổi cụ thể, có tính toán số học cho các thông số đầu vào (ví dụ: "Tăng chiều cao h lên 95 mm" hoặc "Giảm khẩu độ dầm L xuống 750 cm").
Giải thích ngắn gọn lý do cho đề xuất của bạn trong một câu. 
Cung cấp toàn bộ phản hồi bằng tiếng Việt, định dạng bằng Markdown. Bắt đầu bằng một tiêu đề "### Đề xuất cải tiến thiết kế".`;

const formatNumber = (num: number | undefined, decimals: number) => {
  if (num === undefined) return 'N/A';
  return num.toFixed(decimals);
};

export const getDesignRecommendation = async (
  inputs: BeamInputs,
  results: CalculationResults
): Promise<string> => {
   if (!API_KEY) {
    return "Lỗi: API Key của Gemini chưa được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.";
  }
  
  const failureReasons: string[] = [];
  if (results.stress_check === 'fail') {
    failureReasons.push(`- Ứng suất vượt quá giới hạn cho phép (K_sigma = ${formatNumber(results.K_sigma, 2)} < 1).`);
  }
  if (results.deflection_check === 'fail') {
    failureReasons.push(`- Độ võng vượt quá giới hạn cho phép (n_f = ${formatNumber(results.n_f, 2)} < 1).`);
  }

  const userQuery = `Phan tich loi thiet ke dam cau truc sau day va de xuat khuyen nghi cai tien. 
    
    **Thong so dau vao:**
    - Khau do dam (L): ${inputs.L} cm
    - Chieu cao dam (h): ${inputs.h} mm
    - Be rong dam (b): ${inputs.b} mm
    - Chieu day canh tren (t1): ${inputs.t1} mm
    - Chieu day canh duoi (t2): ${inputs.t2} mm
    - Chieu day suon (t3): ${inputs.t3} mm
    - Tai trong nang (P_nang): ${inputs.P_nang} kg
    - Ung suat cho phep (sigma_allow): ${inputs.sigma_allow} kg/cm^2

    **Ket qua tinh toan:**
    - He so an toan ung suat (K_sigma): ${formatNumber(results.K_sigma, 2)}
    - He so an toan do vong (n_f): ${formatNumber(results.n_f, 2)}
    - Ung suat tinh toan (sigma_u): ${formatNumber(results.sigma_u, 2)} kg/cm^2
    - Do vong tinh toan (f): ${formatNumber(results.f, 3)} cm

    **Thiet ke khong thoa man vi:** 
    ${failureReasons.join('\n')}
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery,
        config: {
            systemInstruction: systemPrompt,
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Đã có lỗi xảy ra khi tạo gợi ý. Vui lòng kiểm tra lại và thử lại sau.";
  }
};












