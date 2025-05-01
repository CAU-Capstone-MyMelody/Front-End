import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Nav from "../components/Nav";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import TopNavBack from "../components/TopNavBack";

// 🔽 재생 위치 수직선 플러그인
const verticalLinePlugin = {
  id: "cursorLine",
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const currentTime = chart.config.options.plugins.cursorLineTime;
    if (!ctx || !chartArea || !scales || currentTime == null) return;

    const xScale = scales.x;
    const xPos = xScale.getPixelForValue(currentTime);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xPos, chartArea.top);
    ctx.lineTo(xPos, chartArea.bottom);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#c9a5f5";
    ctx.stroke();
    ctx.restore();
  },
};

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  verticalLinePlugin
);

const PitchAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(null);

  const {
    time = [],
    recordedPitch = [],
    originalPitch = [],
    audioBlob,
    videoId,
  } = location.state || {};

  const duration = time.length ? time[time.length - 1] : 0;

  // 🔢 구간 나누기
  const segments = [];
  const step = 30;
  for (let i = 0; i < duration; i += step) {
    segments.push({ start: i, end: Math.min(i + step, duration) });
  }

  // 🎵 구간 필터링
  const getFilteredData = () => {
    if (!selectedSegment) {
      return { labels: time, recorded: recordedPitch, original: originalPitch };
    }

    const { start, end } = selectedSegment;
    const filtered = time.reduce(
      (acc, t, idx) => {
        if (t >= start && t <= end) {
          acc.labels.push(t);
          acc.recorded.push(recordedPitch[idx]);
          acc.original.push(originalPitch[idx]);
        }
        return acc;
      },
      { labels: [], recorded: [], original: [] }
    );

    return filtered;
  };

  const filtered = getFilteredData();

  // 오디오 Blob → URL 생성
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // 🔄 오디오 재생 시간 추적
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    const saved = JSON.parse(localStorage.getItem("coachingHistory")) || [];

    const base64Audio = await blobToBase64(audioBlob);

    const newEntry = {
      id: Date.now(),
      title: customTitle || "무제",
      time,
      recordedPitch,
      originalPitch,
      videoId,
      createdAt: new Date().toISOString(),
      audio: base64Audio,
    };

    saved.push(newEntry);
    localStorage.setItem("coachingHistory", JSON.stringify(saved));
    setIsModalOpen(false);
    alert("🎉 결과가 저장되었습니다!");
  };

  const data = {
    labels: filtered.labels,
    datasets: [
      {
        label: "🎙️ 녹음 음정",
        data: filtered.recorded,
        borderColor: "#9b7ed8",
        backgroundColor: "#9b7ed8",
        tension: 0.3,
        pointRadius: 1,
        borderWidth: 2,
      },
      {
        label: "🎵 원곡 음정",
        data: filtered.original,
        borderColor: "#888",
        backgroundColor: "#888",
        tension: 0.3,
        pointRadius: 1,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Time (s)", color: "#ccc" },
        ticks: { color: "#aaa" },
      },
      y: {
        title: { display: true, text: "Pitch (Hz)", color: "#ccc" },
        ticks: { color: "#aaa" },
      },
    },
    plugins: {
      legend: { labels: { color: "#ccc" } },
      cursorLineTime: currentTime, // 🔍 실시간 위치 전달
    },
  };

  const handleRetry = () => {
    navigate(-1);
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎼 피치 분석 결과</Title>
        <AudioPlayer controls ref={audioRef} src={audioUrl} />

        <SegmentButtons>
          <SegmentButton
            onClick={() => setSelectedSegment(null)}
            $active={selectedSegment === null}
          >
            전체
          </SegmentButton>
          {segments.map((seg, idx) => (
            <SegmentButton
              key={idx}
              onClick={() => setSelectedSegment(seg)}
              $active={selectedSegment?.start === seg.start}
            >
              {seg.start}~{seg.end}s
            </SegmentButton>
          ))}
        </SegmentButtons>

        <ChartWrapper>
          <Line data={data} options={options} />
        </ChartWrapper>

        <ButtonGroup>
          <ActionButton onClick={handleRetry}>🔁 다시 시도</ActionButton>
          <ActionButton onClick={handleSaveClick}>💾 결과 저장</ActionButton>
        </ButtonGroup>
      </ListContainer>
      <Nav />

      {isModalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h3>저장할 제목을 입력하세요</h3>
            <input
              type="text"
              placeholder="예: 사랑은 늘 도망가 (연습 1)"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
            <ModalButtonGroup>
              <ModalButton onClick={() => setIsModalOpen(false)}>
                취소
              </ModalButton>
              <ModalButton onClick={handleConfirmSave}>저장</ModalButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default PitchAnalysisPage;

// 💅 styled-components
const Container = styled.div`
  background-color: #090909;
  width: 100%;
  height: 100%;
`;

const ListContainer = styled.div`
  position: relative;
  top: 50px;
  padding: 1rem;
  background-color: #090909;
  overflow-y: auto;
  max-height: calc(100% - 100px);
`;

const Title = styled.h2`
  color: white;
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-bottom: 1rem;
  height: 42px;
`;

const SegmentButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SegmentButton = styled.button`
  background-color: ${(props) => (props.$active ? "#9b7ed8" : "#333")};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
`;

const ButtonGroup = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  background-color: #9b7ed8;
  color: white;
  font-weight: bold;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  flex: 1;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalBox = styled.div`
  background-color: #181818;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  color: white;

  input {
    width: 100%;
    padding: 0.6rem;
    border-radius: 6px;
    border: none;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    background-color: #333;
    color: white;
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ModalButton = styled.button`
  background-color: #9b7ed8;
  color: white;
  font-weight: bold;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;
