// apis/voiceAnalysis.js
import axios from "axios";

// 내 음성 분석만 같는것
// 예시 데이터 구조
// {
//     "title": "아이유 팔레트로 음정 분석",
//     "resultSummary": "당신의 음정은 전반적으로 정확했지만 고음에서 흔들렸습니다.",
//     "recordedPitch": [231.2, 245.5, 260.3, ...],
//     "time": [0.1, 0.2, 0.3, ...],
//     "audioBase64": "data:audio/webm;base64,...",
//     "createdAt": "2025-04-07T12:34:56.789Z"
//   }
export const saveMyVoiceAnalysisResult = async (data) => {
  const response = await axios.post("/api/voice-analysis", data);
  return response.data;
};
