import axios from "axios";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const fetchChatGptRecommendation = async (
  pitchData,
  selectedGenres,
  note
) => {
  const prompt = `너는 보컬 트레이너이자 음악 추천 전문가야.

1. 사용자가 부른 음정 데이터와 선택한 장르, 사용자가 작성한 노트를 기반으로 음정 및 발성 분석을 해줘.
2. 그 분석을 바탕으로, 사용자의 음색과 스타일, 성향에 어울리는 노래 10곡을 추천해줘. 장르별이 아니라 전체적으로 종합해서 가장 잘 어울리는 곡들을 추천해야 해.
3. 아래 형식의 JSON 객체로 응답해줘:

{
  "analysis": "여기에 음정 및 발성 분석 결과 작성",
  "recommendations": [
    { "title": "노래 제목1", "artist": "아티스트명1" },
    ...
    { "title": "노래 제목10", "artist": "아티스트명10" }
  ]
}

선택한 장르: ${selectedGenres.join(", ")}
사용자 노트: ${note}
음정 데이터: ${pitchData.join(", ")}
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7, // 다양성 추가
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    console.log("ChatGPT 응답:", content);

    // 응답을 JSON 형태로 파싱
    const result = JSON.parse(content);

    return {
      analysis: result.analysis,
      recommendations: result.recommendations,
    };
  } catch (error) {
    console.error("ChatGPT 요청 또는 파싱 실패: ", error);
    throw new Error("ChatGPT 분석 요청 중 오류가 발생했습니다.");
  }
};
