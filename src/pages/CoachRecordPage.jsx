import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Recorder from "../components/Recorder";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";
import axios from "axios";

const dummyAnalysisResult2 = {
  time: [
    18.3, 18.8, 19.4, 20.0, 20.6, 21.1, 21.8, 22.5, 23.2, 24.0, 25.0, 25.6,
    26.1, 27.0, 27.7, 28.4, 29.2, 30.0, 30.8, 31.6, 32.3, 33.1, 34.0, 34.8,
    35.5, 36.3, 37.1, 38.0, 39.0, 40.0, 41.0, 42.0, 43.0, 44.0, 45.0, 46.2,
    47.5, 48.8, 50.0, 51.3, 52.6, 54.0, 55.5, 57.0,
  ],
  originalPitch: [
    261.63,
    261.63,
    293.66,
    293.66,
    329.63,
    349.23,
    349.23,
    null,
    null,
    392.0,
    392.0,
    440.0,
    440.0,
    392.0,
    392.0,
    349.23,
    349.23,
    null,
    null,
    329.63,
    329.63,
    293.66,
    293.66,
    261.63,
    261.63,
    null,
    null,
    246.94,
    246.94,
    261.63,
    293.66,
    329.63,
    null,
    null,
    349.23,
    392.0,
    440.0,
    440.0,
    392.0,
    392.0,
    349.23,
    329.63,
    261.63,
    null,
  ],
  recordedPitch: [
    262.1, // 정확
    260.2, // 정확
    310.0, // 살짝 높음
    278.0, // 살짝 낮음
    329.5, // 정확
    340.0, // 살짝 낮음
    380.0, // 완전히 틀림
    null,
    null,
    395.0, // 정확
    370.0, // 완전히 틀림
    460.0, // 살짝 높음
    430.0, // 살짝 낮음
    391.8, // 정확
    388.0, // 살짝 낮음
    355.0, // 살짝 높음
    345.0, // 살짝 낮음
    null,
    null,
    300.0, // 살짝 높음
    310.0, // 살짝 높음
    275.0, // 살짝 낮음
    250.0, // 완전히 틀림
    265.0, // 살짝 높음
    240.0, // 완전히 틀림
    null,
    null,
    280.0, // 완전히 틀림
    220.0, // 완전히 틀림
    250.0, // 살짝 낮음
    310.0, // 살짝 높음
    325.0, // 정확
    null,
    null,
    340.0, // 살짝 낮음
    395.0, // 살짝 높음
    470.0, // 완전히 틀림
    420.0, // 살짝 낮음
    430.0, // 살짝 낮음
    410.0, // 살짝 높음
    370.0, // 살짝 낮음
    320.0, // 살짝 낮음
    270.0, // 살짝 높음
    null,
  ],
  startTime: 18,
  endTime: 58,
};

const CoachRecordPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const videoId = new URLSearchParams(search).get("videoId");
  const [audioBlob, setAudioBlob] = useState(null);

  // 녹음 파일로 오디오 분석
  const [audioFileName, setAudioFileName] = useState("");

  const [isRecorded, setIsRecorded] = useState(false);

  const [audioUrl, setAudioUrl] = useState(null);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(true);
  const [isShow, setIsShow] = useState(false);

  const [video, setVideo] = useState(null);
  const recorderRef = useRef(null); // Recorder 컴포넌트 참조

  const [startTime, setStartTime] = useState(""); // 시작 시간 (초)
  const [endTime, setEndTime] = useState(""); // 끝 시간 (초)

  // 녹음된 오디오 길이 가져오는 함수
  const getAudioDuration = (blob) => {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration); // 초 단위
      });
    });
  };

  // startTime이 변경될 때 자동으로 endTime 계산
  useEffect(() => {
    if (!audioBlob) return;
    const updateEndTime = async () => {
      const duration = await getAudioDuration(audioBlob);
      setEndTime(Math.round(startTime + duration));
    };
    updateEndTime();
  }, [startTime, audioBlob]);

  // 비디오 제목을 YouTube API로 가져오기
  useEffect(() => {
    const fetchVideoTitle = async () => {
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY2; // API 키는 환경 변수로 관리하는 게 좋습니다.
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

      try {
        const response = await axios.get(url);
        const title =
          response.data.items[0]?.snippet?.title ||
          "제목을 가져오지 못했습니다.";
        setVideoTitle(title);
      } catch (error) {
        console.error("YouTube API 요청 실패:", error);
        setVideoTitle("제목을 가져오지 못했습니다.");
      }
    };

    fetchVideoTitle();
  }, [videoId]);

  // 페이지 로드 시 비디오 제목을 기반으로 ChatGPT에게 설명 요청
  useEffect(() => {
    if (!videoTitle) return;

    const fetchGPTDescription = async () => {
      const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        console.error("OpenAI API 키가 설정되어 있지 않습니다.");
        setVideoDescription("설명을 가져오지 못했습니다.");
        setIsDescriptionLoading(false);
        return;
      }

      const prompt = `이 유튜브 영상에 대해 설명해 주세요. 가수와 노래 제목을 포함하여 설명하며 해당 노래의 멜론이나 유튜브 뮤직, 빌보드 등의 흥행 정도에 대해서도 설명해 주세요: ${videoTitle}`;

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

        const message = response.data.choices?.[0]?.message?.content;
        if (message) {
          setVideoDescription(message.trim());
        } else {
          setVideoDescription("설명을 가져오지 못했습니다.");
        }
      } catch (error) {
        console.error("ChatGPT 요청 실패:", error);
        setVideoDescription("설명을 가져오지 못했습니다.");
      } finally {
        setIsDescriptionLoading(false);
      }
    };

    fetchGPTDescription();
  }, [videoTitle]);

  useEffect(() => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url); // ⬅ 메모리 해제
  }, [audioBlob]);

  // 파일 업로드 시
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("오디오 파일만 업로드 가능합니다.");
      return;
    }

    setAudioBlob(file);
    setAudioFileName(file.name);
    setIsRecorded(false); // 업로드한 경우는 녹음이 아님

    e.target.value = ""; // 🔥 핵심! 같은 파일 재선택 방지
  };

  // 나중에 백엔드와 연결할떄 쓸 코드
  const handleAnalyze = async () => {
    if (!audioBlob) {
      alert("먼저 녹음을 해주세요!");
      return;
    }

    setIsShow(true);

    // try {
    //   const formData = new FormData();
    //   formData.append("file", audioBlob, audioBlob.name); // 파일 이름 설정
    //   formData.append(
    //     "youtube_url",
    //     `https://www.youtube.com/watch?v=${videoId}`
    //   );
    //   formData.append("start_time", startTime); // 시작 시간 추가
    //   formData.append("end_time", endTime); // 끝 시간 추가

    //   console.log(formData.get("file"));

    //   const { time, recordedPitch, originalPitch } = dummyAnalysisResult2;

    //   console.log(dummyAnalysisResult2);

    //   navigate("/coachpitchanalysis", {
    //     state: {
    //       time,
    //       recordedPitch,
    //       originalPitch,
    //       audioBlob,
    //       videoId,
    //     },
    //   });
    // } catch (error) {
    //   console.error("분석 중 오류 발생:", error);
    //   alert("분석 중 오류가 발생했습니다.");
    // }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, audioBlob.name); // 파일 이름 설정
      formData.append(
        "youtube_url",
        `https://www.youtube.com/watch?v=${videoId}`
      );
      formData.append("start_time", startTime); // 시작 시간 추가
      formData.append("end_time", endTime); // 끝 시간 추가

      console.log(formData.get("file"));

      let analyzeUrl;
      if (videoId === "uEsT7K_X7Pw") {
        console.log("벚꽃엔딩");
        analyzeUrl = "analyze";
      } else if (videoId === "SrQzxD8UFdM") {
        console.log("헤어지자 말해요요");
        analyzeUrl = "analyze2";
      } else if (videoId === "yL6P7OR5WOM") {
        console.log("아무노래");
        analyzeUrl = "analyze3";
      }

      console.log("분석 URL:", analyzeUrl);

      const response = await axios.post(
        `http://localhost:8000/${analyzeUrl}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { time, recordedPitch, originalPitch } = response.data;

      console.log(response.data);

      navigate("/coachpitchanalysis", {
        state: {
          time,
          recordedPitch,
          originalPitch,
          audioBlob,
          videoId,
        },
      });
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      alert("분석 중 오류가 발생했습니다.");
    }
  };

  // 시작 시간 변경 핸들러
  const handleStartTimeChange = (e) => {
    const val = e.target.value;
    // 빈값이면 빈 문자열로 저장
    if (val === "") {
      setStartTime("");
      return;
    }
    // 숫자로 변환 가능하면 변환 후 저장 (소수점 입력 막음)
    const num = Number(val);
    if (!isNaN(num) && Number.isInteger(num) && num >= 0) {
      setStartTime(num);
    }
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎤 나의 보컬 녹음</Title>
        <VideoIdText>🎬 Video ID: {videoId}</VideoIdText>
        <ContentWrapper>
          <IframeWrapper>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </IframeWrapper>

          <RecordBox>
            <Recorder onRecordingComplete={setAudioBlob} />

            {/* 🔽 오디오 파일 업로드 UI */}
            <UploadLabel htmlFor="audio-upload">
              또는 오디오 파일 업로드
            </UploadLabel>
            <FileInput
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
            />
            {audioFileName && !isRecorded && (
              <FileName>📁 {audioFileName}</FileName>
            )}
            {audioUrl && <AudioPlayer key={audioUrl} controls src={audioUrl} />}
          </RecordBox>

          <TimeInputWrapper>
            <Title>원곡의 시간 파트를 입력하세요</Title>
            <TimeLabel>⏱ 녹음 시작 시간 (초):</TimeLabel>
            <TimeInput
              type="number"
              min="0"
              step="1"
              value={startTime}
              onChange={handleStartTimeChange}
            />
            <TimeLabel>⏱ 녹음 종료 시간 (초):</TimeLabel>
            <TimeInput
              type="number"
              min="0"
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
            />
          </TimeInputWrapper>

          {/* 비디오 설명을 보여주는 부분 */}
          {isShow && (
            <DescriptionWrapper>
              <h3>이 영상에 대한 설명</h3>
              {isDescriptionLoading ? (
                <p>설명이 로드 중입니다...</p>
              ) : videoDescription ? (
                <p>{videoDescription}</p>
              ) : (
                <p>설명이 없습니다.</p>
              )}
            </DescriptionWrapper>
          )}
          <ActionButton onClick={handleAnalyze}>🎧 분석하기</ActionButton>
        </ContentWrapper>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default CoachRecordPage;

const Container = styled.div`
  background-color: #090909;
  width: 100%;
  height: 100%;
`;

const ListContainer = styled.div`
  position: relative;
  top: 50px;
  background-color: #090909;
  padding: 1rem;
  overflow-y: auto;
  height: 100%;
  max-height: calc(100% - 100px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: center;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(150, 150, 150);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(150, 150, 150, 0.1);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  margin: 0.5rem 0 1rem 0;
`;

const RecordBox = styled.div`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const VideoIdText = styled.p`
  color: #ccc;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  background-color: #9b7ed8;
  color: black;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

const AudioPlayer = styled.audio`
  margin-top: 1rem;
  width: 100%;
  height: 42px;
`;

const UploadLabel = styled.label`
  display: inline-block;
  background-color: #1e1e1e;
  color: #9b7ed8;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  border: 1px solid #9b7ed8;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2a2a2a;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileName = styled.div`
  font-size: 0.85rem;
  color: #aaa;
  margin-top: 0.5rem;
  text-align: center;
`;

const DescriptionWrapper = styled.div`
  margin-top: 2rem;
  color: white;
  font-size: 1rem;
  font-weight: 400;
  padding: 1rem;
  background-color: #1e1e1e;
  border-radius: 10px;
`;

const IframeWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(155, 126, 216, 0.2);
  margin-bottom: 1.5rem;
`;

const TimeInputWrapper = styled.div`
  margin: 1rem 0;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

const TimeLabel = styled.label`
  font-size: 0.9rem;
  color: #ccc;
`;

const TimeInput = styled.input`
  background-color: #1e1e1e;
  border: 1px solid #555;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  color: white;
  width: 120px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #9b7ed8;
  }
`;
