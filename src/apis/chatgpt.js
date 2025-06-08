import axios from "axios";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const fetchChatGptRecommendation = async (
  pitchData,
  selectedGenres,
  note,
  transpose,
  filteredSongs
) => {
  const formattedSongs = filteredSongs
    .map(
      (song) =>
        `{"title": "${song.title}", "artist": "${song.artist}", "max": ${song.pitch.max}, "min": ${song.pitch.min}, "transposedMax": ${song.pitch.transposedMax}}`
    )
    .join(",\n");

  const prompt = `
너는 보컬 트레이너이자 음악 추천 전문가야.

아래 요구사항을 기반으로 음정 및 발성 분석과 음악 추천을 해줘:

1. **음정 및 발성 분석**:
    - 사용자의 pitchData, 선택한 장르, 작성한 노트(note)를 바탕으로 분석해줘.
    - 예: note에 "정국의 노래를 좋아해요"가 있으면 이를 최우선으로 고려해.
    - Hz로 주어진 pitch 값은 사람이 이해하기 쉬운 음역 표기 (예: A4, C3 등)로 함께 설명해줘. (예: "최고음은 530Hz로 약 C5에 해당합니다.")

2. **음정 분석**:
    - 사용자의 최고음과 최저음을 분석하고 이에 맞는 노래를 추천해줘.
    - analysis를 키 값으로 작성해주는데 최소한 한글 300자 정도의 길이로 작성해줘.
    - 예: "사용자는 최고 530Hz(C5)까지 도달했습니다. 이에 맞춰 추천 드립니다."

3. **노래 추천 조건**:
    - 최대 5곡
    - title, artist, 최고음(max), 최저음(min) 포함
    - pitch 비교는 filteredSongs 안의 'transposedMax' 기준으로 비교
    - 사용자가 선택한 장르와 note 내용이 일치하는 곡을 우선 추천

4. **주의사항**:
    - 반드시 filteredSongs 리스트 내의 곡만 추천해. 새로운 곡을 생성하거나 임의의 곡을 만들어내지 마.
    - 조건에 부합하는 곡이 5개보다 적더라도 추천 가능한 곡만 포함시켜.
    - 조건에 맞는 곡이 아예 없다면 "recommendations" 항목은 빈 배열([])로 반환해.
    - transpose 값은 이미 반영된 transposedMax로 비교

5. **응답 형식 (반드시 JSON으로만 작성)**:

{
  "analysis": "여기에 분석 결과 작성",
  "recommendations": [
    { "title": "Dynamite", "artist": "방탄소년단", "max": 1200,  "min": 330 },
    { "title": "좋은날", "artist": "아이유", "max": 1523,  "min": 220 }
  ]
}

선택한 장르: ${selectedGenres.join(", ")}
사용자 노트: ${note}
사용자 음정 데이터 (Hz): ${pitchData.join(", ")}

추천 후보 곡들 (filteredSongs):
${formattedSongs}
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;

    // JSON 형태 파싱 시 try-catch로 감싸 예외 방지
    try {
      const result = JSON.parse(content);
      return {
        analysis: result.analysis,
        recommendations: result.recommendations,
      };
    } catch (parseError) {
      console.error("응답 파싱 실패:", parseError);
      throw new Error("ChatGPT 응답이 올바른 JSON 형식이 아닙니다.");
    }
  } catch (error) {
    console.error("ChatGPT 요청 실패:", error.response?.data || error.message);
    throw new Error("ChatGPT 분석 요청 중 오류가 발생했습니다.");
  }
};

// 음정 분석 결과를 ChatGPT로부터 피드백 받기

export const fetchPitchFeedbackFromChatGpt = async (
  recordedPitch,
  originalPitch,
  time
) => {
  const prompt = `
너는 초보자를 위한 친절한 보컬 트레이너야.

아래의 사용자 음정 데이터와 원곡 데이터를 비교 분석해서,
1. 사용자의 발성, 음정 안정성, 벗어난 구간 등에 대해 구체적으로 분석해줘.
2. pitch 데이터는 Hz 단위야. 사람이 쉽게 이해할 수 있도록 대응하는 음이름(예: C4, G#4)으로 변환해서 분석해줘.
3. 초보자도 이해하기 쉽게 설명해줘.
4. 총평이 너무 길지 않게 단락을 나눠서 전달해줘.

그리고 다음과 같은 **JSON 형식으로만** 응답해줘:

{
  "analysis": [
    "문장1 또는 단락1 (Hz와 음이름 같이 보여줘)",
    "문장2 또는 단락2",
    "문장3 또는 단락3"
  ],
  "importantFeedback": [
    "가장 중요한 피드백 1줄",
    "보완이 시급한 포인트 요약 1줄"
  ]
}

다음은 비교할 데이터야:

- 시간 정보: ${JSON.stringify(time)}
- 사용자 음정 (Hz): ${JSON.stringify(recordedPitch)}
- 원곡 음정 (Hz): ${JSON.stringify(originalPitch)}
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      return {
        analysis: result.analysis,
        importantFeedback: result.importantFeedback,
      };
    } catch (parseError) {
      console.error("응답 파싱 실패:", parseError);
      throw new Error("ChatGPT 응답이 올바른 JSON 형식이 아닙니다.");
    }
  } catch (error) {
    console.error("ChatGPT 요청 실패:", error.response?.data || error.message);
    throw new Error("ChatGPT 분석 요청 중 오류가 발생했습니다.");
  }
};
