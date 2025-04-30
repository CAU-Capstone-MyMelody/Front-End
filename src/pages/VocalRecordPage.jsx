import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Recorder from "../components/Recorder";
import { fakeVocalAnalysis } from "../utils/fakeVocalAnalysis";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";
import axios from "axios";

const dummyAnalysisResult = {
  time: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
  originalPitch: [329.63, 329.63, 349.23, 349.23, 392.0, 392.0, 440.0], // E4, E4, F4, F4, G4, G4, A4
  recordedPitch: [320.0, 335.0, 360.0, 340.0, 405.0, 380.0, 450.0], // 사용자 음정(살짝 부정확)
};

const dummyAnalysisResult2 = {
  time: [
    0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0,
    7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5,
    14.0, 14.5, 15.0, 15.5, 16.0, 16.5, 17.0, 17.5, 18.0, 18.5, 19.0, 19.5,
    20.0, 20.5, 21.0, 21.5, 22.0, 22.5, 23.0, 23.5, 24.0, 24.5, 25.0, 25.5,
    26.0, 26.5, 27.0, 27.5, 28.0, 28.5, 29.0, 29.5, 30.0, 30.5, 31.0, 31.5,
    32.0, 32.5, 33.0, 33.5, 34.0, 34.5, 35.0, 35.5, 36.0, 36.5, 37.0, 37.5,
    38.0, 38.5, 39.0, 39.5, 40.0, 40.5, 41.0, 41.5, 42.0, 42.5, 43.0, 43.5,
    44.0, 44.5, 45.0, 45.5, 46.0, 46.5, 47.0, 47.5, 48.0, 48.5, 49.0, 49.5,
    50.0, 50.5, 51.0, 51.5, 52.0, 52.5, 53.0, 53.5, 54.0, 54.5, 55.0, 55.5,
    56.0, 56.5, 57.0, 57.5, 58.0, 58.5, 59.0, 59.5,
  ],
  originalPitch: [
    240, 245, 250, 248, 255, 260, 258, 265, 270, 275, 273, 278, 280, 285, 290,
    295, 300, 298, 305, 310, 312, 318, 320, 325, 330, 335, 338, 340, 342, 345,
    348, 350, 355, 358, 360, 362, 365, 368, 370, 372, 375, 378, 380, 382, 385,
    388, 390, 392, 395, 398, 400, 402, 405, 408, 410, 412, 415, 418, 420, 422,
    425, 428, 430, 432, 435, 438, 440, 442, 445, 448, 450, 452, 455, 458, 460,
    462, 465, 468, 470, 472, 475, 478, 480, 482, 485, 488, 490, 492, 495, 498,
    500, 502, 505, 508, 510, 512, 515, 518, 520, 522, 525, 528, 530, 532, 535,
    538, 540, 542, 545, 548, 550,
  ],
  recordedPitch: [
    245, 250, 255, 260, 255, 262, 267, 270, 278, 280, 288, 295, 292, 298, 300,
    305, 312, 318, 322, 325, 330, 332, 338, 340, 345, 348, 350, 355, 358, 362,
    365, 368, 370, 375, 380, 382, 385, 388, 392, 395, 398, 400, 405, 408, 412,
    415, 418, 420, 422, 425, 428, 430, 432, 438, 442, 445, 450, 452, 455, 458,
    460, 462, 465, 468, 470, 475, 478, 480, 482, 485, 490, 492, 495, 498, 500,
    502, 505, 508, 510, 512, 515, 518, 520, 522, 525, 528, 530, 532, 535, 538,
    540, 542, 545, 548, 550, 550, 548, 545, 542, 540, 538,
  ],
};

const VocalRecordPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const videoId = new URLSearchParams(search).get("videoId");
  const [audioBlob, setAudioBlob] = useState(null);

  // 나중에 백엔드와 연결할떄 쓸 코드
  const handleAnalyze = async () => {
    if (!audioBlob) {
      alert("먼저 녹음을 해주세요!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav"); // 파일 이름 설정
      formData.append("youtube_url", videoId);

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
            {audioBlob && (
              <AudioPlayer controls src={URL.createObjectURL(audioBlob)} />
            )}
          </RecordBox>

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

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
