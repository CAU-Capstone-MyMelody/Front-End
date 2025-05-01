import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Recorder from "../components/Recorder";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";
import axios from "axios";

// const dummyAnalysisResult2 = {
//   time: [
//     0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0,
//     7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5,
//     14.0, 14.5, 15.0, 15.5, 16.0, 16.5, 17.0, 17.5, 18.0, 18.5, 19.0, 19.5,
//     20.0, 20.5, 21.0, 21.5, 22.0, 22.5, 23.0, 23.5, 24.0, 24.5, 25.0, 25.5,
//     26.0, 26.5, 27.0, 27.5, 28.0, 28.5, 29.0, 29.5, 30.0, 30.5, 31.0, 31.5,
//     32.0, 32.5, 33.0, 33.5, 34.0, 34.5, 35.0, 35.5, 36.0, 36.5, 37.0, 37.5,
//     38.0, 38.5, 39.0, 39.5, 40.0, 40.5, 41.0, 41.5, 42.0, 42.5, 43.0, 43.5,
//     44.0, 44.5, 45.0, 45.5, 46.0, 46.5, 47.0, 47.5, 48.0, 48.5, 49.0, 49.5,
//     50.0, 50.5, 51.0, 51.5, 52.0, 52.5, 53.0, 53.5, 54.0, 54.5, 55.0, 55.5,
//     56.0, 56.5, 57.0, 57.5, 58.0, 58.5, 59.0, 59.5,
//   ],
//   originalPitch: [
//     240, 245, 250, 248, 255, 260, 258, 265, 270, 275, 273, 278, 280, 285, 290,
//     295, 300, 298, 305, 310, 312, 318, 320, 325, 330, 335, 338, 340, 342, 345,
//     348, 350, 355, 358, 360, 362, 365, 368, 370, 372, 375, 378, 380, 382, 385,
//     388, 390, 392, 395, 398, 400, 402, 405, 408, 410, 412, 415, 418, 420, 422,
//     425, 428, 430, 432, 435, 438, 440, 442, 445, 448, 450, 452, 455, 458, 460,
//     462, 465, 468, 470, 472, 475, 478, 480, 482, 485, 488, 490, 492, 495, 498,
//     500, 502, 505, 508, 510, 512, 515, 518, 520, 522, 525, 528, 530, 532, 535,
//     538, 540, 542, 545, 548, 550,
//   ],
//   recordedPitch: [
//     245, 250, 255, 260, 255, 262, 267, 270, 278, 280, 288, 295, 292, 298, 300,
//     305, 312, 318, 322, 325, 330, 332, 338, 340, 345, 348, 350, 355, 358, 362,
//     365, 368, 370, 375, 380, 382, 385, 388, 392, 395, 398, 400, 405, 408, 412,
//     415, 418, 420, 422, 425, 428, 430, 432, 438, 442, 445, 450, 452, 455, 458,
//     460, 462, 465, 468, 470, 475, 478, 480, 482, 485, 490, 492, 495, 498, 500,
//     502, 505, 508, 510, 512, 515, 518, 520, 522, 525, 528, 530, 532, 535, 538,
//     550,
//   ],
//   startTime: 10,
//   endTime: 60,
// };

const VocalRecordPage = () => {
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

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, audioBlob.name); // 파일 이름 설정
      formData.append(
        "youtube_url",
        `https://www.youtube.com/watch?v=${videoId}`
      );

      console.log(formData.get("file"));

      const response = await axios.post(
        "http://3.39.217.34:8000/analyze_dtw",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { time, recordedPitch, originalPitch } = response.data;

      console.log(response.data);

      navigate("/pitchanalysis", {
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

  // const handleAnalyze = () => {
  //   if (!audioBlob) {
  //     alert("먼저 녹음을 해주세요!");
  //     return;
  //   }

  //   // 스프레드 연산자로 구조체의 내용을 풀어서 state에 저장 navigate의 state기능으로 데이터 전달 받는 페이지에서는
  //   // useLocation을 통해 데이터를 사용한다.
  //   navigate("/pitchanalysis", {
  //     state: {
  //       ...dummyAnalysisResult2,
  //       audioBlob,
  //       videoId,
  //     },
  //   });
  // };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎤 나의 보컬 녹음</Title>
        <VideoIdText>🎬 Video ID: {videoId}</VideoIdText>
        <ContentWrapper>
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

export default VocalRecordPage;

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
  justify-content: center;

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
