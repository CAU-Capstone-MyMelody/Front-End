import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Recorder from "../components/Recorder";
import { fakeVocalAnalysis } from "../utils/fakeVocalAnalysis";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";

const dummyAnalysisResult = {
  time: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
  originalPitch: [329.63, 329.63, 349.23, 349.23, 392.0, 392.0, 440.0], // E4, E4, F4, F4, G4, G4, A4
  recordedPitch: [320.0, 335.0, 360.0, 340.0, 405.0, 380.0, 450.0], // 사용자 음정(살짝 부정확)
};

const VocalRecordPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const videoId = new URLSearchParams(search).get("videoId");
  const [audioBlob, setAudioBlob] = useState(null);

  // 나중에 백엔드와 연결할떄 쓸 코드
  // const handleAnalyze = async () => {
  //   if (!audioBlob) {
  //     alert("먼저 녹음을 해주세요!");
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append("audio", audioBlob, "recording.wav"); // 파일 이름 설정
  //     formData.append("videoId", videoId);

  //     const response = await axios.post("http://localhost:5000/analyze", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     const { time, recordedPitch, originalPitch } = response.data;

  //     navigate("/pitchanalysis", {
  //       state: {
  //         time,
  //         recordedPitch,
  //         segmentPitch,
  //         audioBlob,
  //         videoId,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("분석 중 오류 발생:", error);
  //     alert("분석 중 오류가 발생했습니다.");
  //   }
  // };

  const handleAnalyze = () => {
    if (!audioBlob) {
      alert("먼저 녹음을 해주세요!");
      return;
    }

    // 스프레드 연산자로 구조체의 내용을 풀어서 state에 저장 navigate의 state기능으로 데이터 전달 받는 페이지에서는
    // useLocation을 통해 데이터를 사용한다.
    navigate("/pitchanalysis", {
      state: {
        ...dummyAnalysisResult,
        audioBlob,
        videoId,
      },
    });
  };

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
