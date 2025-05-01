import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNavBack from "../components/TopNavBack";
import Nav from "../components/Nav";
import styled from "styled-components";
import { getVideoDetail } from "../apis/youtubeapi";
import RecorderKaraoke from "../components/RecorderKaraoke";

const MergeKaraokePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const videoId = searchParams.get("videoId");

  const [audioBlob, setAudioBlob] = useState(null);
  const [video, setVideo] = useState(null);
  const recorderRef = useRef(null); // Recorder 컴포넌트 참조
  const playerRef = useRef(null); // 유튜브 플레이어 참조

  // 유튜브 영상 데이터 가져오기
  useEffect(() => {
    const fetchVideo = async () => {
      const data = await getVideoDetail(videoId);
      setVideo(data);
    };
    fetchVideo();
  }, [videoId]);

  // 레코드 클릭 시 유튜브 영상 재생 및 녹음 시작
  const handleRecordStart = () => {
    // 유튜브 영상 재생
    if (playerRef.current) {
      playerRef.current.playVideo(); // 유튜브 영상 재생
    }

    // 녹음 시작
    if (recorderRef.current) {
      recorderRef.current.startRecording(); // 녹음 시작
    }
  };

  // 녹음 후 제출 처리
  const handleSubmit = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append("videoId", videoId);
    formData.append("audio", audioBlob, "recorded.wav");

    const res = await fetch("http://localhost:8000/merge", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged_song.wav";
    a.click();
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        {video && (
          <IframeWrapper>
            <iframe
              ref={playerRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </IframeWrapper>
        )}

        <RecordBox>
          <RecorderKaraoke
            ref={recorderRef}
            onStart={handleRecordStart}
            onRecordingComplete={setAudioBlob}
          />
          {audioBlob && (
            <AudioPlayer controls src={URL.createObjectURL(audioBlob)} />
          )}

          {audioBlob && <Button onClick={handleSubmit}>🎵 합성하기</Button>}
        </RecordBox>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default MergeKaraokePage;

const Container = styled.div`
  background-color: #090909;
  width: 100%;
  height: 100%;
`;

const ListContainer = styled.div`
  position: relative;
  top: 50px;
  background-color: #090909;
  padding: 0.5rem;
  overflow-y: auto;
  height: 100%;
  max-height: calc(100% - 100px);
  box-sizing: border-box;

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

const IframeWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(155, 126, 216, 0.2);
  margin-bottom: 1.5rem;
`;

const RecordBox = styled.div`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const AudioPlayer = styled.audio`
  margin-top: 1rem;
  width: 100%;
  height: 42px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: #9b7ed8;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  box-shadow: 0 0 10px rgba(155, 126, 216, 0.3);

  &:hover {
    background: #b29ae4;
  }

  &:active {
    transform: scale(0.97);
  }
`;
