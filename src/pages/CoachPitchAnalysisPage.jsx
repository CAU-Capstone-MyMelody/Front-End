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
import { Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import { fetchPitchFeedbackFromChatGpt } from "../apis/chatgpt";

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

// pitch → 음 이름 변환 함수
function hzToNoteName(hz) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const A4 = 440;
  const semitoneOffset = Math.round(12 * Math.log2(hz / A4));
  const midi = 69 + semitoneOffset;
  const note = noteNames[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}/${octave}`;
}

const CoachPitchAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0); // 현재 슬라이드 인덱스
  const notesPerPage = 4;

  const [analysisResult, setAnalysisResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
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
  const step = 10;
  //   for (let i = 0; i < duration; i += step) {
  //     segments.push({ start: i, end: Math.min(i + step, duration) });
  //   }

  // 원소 개수로 나누는것이 아니라 진짜 20초 단위로 나누기
  if (time.length > 0) {
    const minTime = time[0]; // 예: 18.3
    const maxTime = time[time.length - 1]; // 예: 58.9

    for (let t = minTime; t < maxTime; t += step) {
      segments.push({ start: t, end: Math.min(t + step, maxTime) });
    }
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

  // 4개씩 그룹으로 나누기
  const chunkedOriginal = [];
  const chunkedRecorded = [];
  for (let i = 0; i < originalPitch.length; i += 4) {
    chunkedOriginal.push(originalPitch.slice(i, i + 4));
    chunkedRecorded.push(recordedPitch.slice(i, i + 4));
  }

  const refs = useRef([]);

  useEffect(() => {
    const index = currentIndex;
    const ref = refs.current[index];
    if (!ref) return;

    ref.innerHTML = "";
    const renderer = new Renderer(ref, Renderer.Backends.SVG);
    renderer.resize(400, 200);
    const context = renderer.getContext();
    const stave = new Stave(10, 40, 380);
    stave.addClef("treble").setContext(context).draw();

    const oSlice = chunkedOriginal[index];
    const rSlice = chunkedRecorded[index];
    if (oSlice.length < 1 || rSlice.length < 1) return;

    const padWithRest = (arr) => {
      const result = [...arr];
      while (result.length < 4) result.push(null);
      return result;
    };

    const paddedOriginal = padWithRest(oSlice);
    const paddedRecorded = padWithRest(rSlice);

    const originalNotes = paddedOriginal.map((hz) =>
      hz
        ? new StaveNote({ keys: [`${hzToNoteName(hz)}/4`], duration: "q" })
        : new StaveNote({ keys: ["b/4"], duration: "qr" })
    );

    const recordedNotes = paddedRecorded.map((hz) =>
      hz
        ? new StaveNote({ keys: [`${hzToNoteName(hz)}/4`], duration: "q" })
        : new StaveNote({ keys: ["b/5"], duration: "qr" })
    );

    recordedNotes.forEach((note) => {
      note.setStyle({ fillStyle: "#9B7ED8", strokeStyle: "#9B7ED8" });
    });

    const voice1 = new Voice({ num_beats: 4, beat_value: 4 });
    voice1.addTickables(originalNotes);
    const voice2 = new Voice({ num_beats: 4, beat_value: 4 });
    voice2.addTickables(recordedNotes);

    new Formatter().joinVoices([voice1, voice2]).format([voice1, voice2], 350);
    voice1.draw(context, stave);
    voice2.draw(context, stave);
  }, [currentIndex, chunkedOriginal, chunkedRecorded]);

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
        // 현재 재생 위치 업데이트 startTime을 더해서 시작부터 수직선이 그려지도록 함
        setCurrentTime(audioRef.current.currentTime + time[0]);
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

  useEffect(() => {
    let timeoutId;

    if (recordedPitch) {
      timeoutId = setTimeout(() => {
        fetchPitchFeedbackFromChatGpt(recordedPitch, originalPitch, time)
          .then((res) => {
            setAnalysisResult(res.analysis);
            setFeedback(res.importantFeedback);

            console.log(res.analysis);
          })
          .catch((err) => {
            console.error("ChatGPT 요청 실패: ", err);
          });
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [recordedPitch, originalPitch, time]);

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
    // labels: [18.0, 22.0, 24.0, 27.0, 28.0],
    datasets: [
      {
        label: "🎙️ 녹음 음정",
        data: filtered.recorded,
        // data: [259.2, 260.1, null, 290.0, 292.8],
        borderColor: "#9b7ed8",
        backgroundColor: "#9b7ed8",
        stepped: "before",
        tension: 0.3,
        pointRadius: 1,
        borderWidth: 2,
      },
      {
        label: "🎵 원곡 음정",
        data: filtered.original,
        // data: [261.63, 261.63, null, 293.66, 293.66],
        borderColor: "white",
        backgroundColor: "white",
        stepped: "before",
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
              {idx + 1}PART &nbsp; {seg.start}~{seg.end}s
            </SegmentButton>
          ))}
        </SegmentButtons>

        <ChartWrapper>
          <Line data={data} options={options} />
        </ChartWrapper>

        <Sheet>
          <div
            key={currentIndex}
            ref={(el) => (refs.current[currentIndex] = el)}
            style={{ marginBottom: "20px" }}
          />
        </Sheet>
        <SlideNav>
          <SlideButton
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
          >
            ◀ 이전
          </SlideButton>
          <PageIndicator>
            {currentIndex + 1} / {chunkedOriginal.length}
          </PageIndicator>
          <SlideButton
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min(prev + 1, chunkedOriginal.length - 1)
              )
            }
            disabled={currentIndex === chunkedOriginal.length - 1}
          >
            다음 ▶
          </SlideButton>
        </SlideNav>

        {analysisResult && (
          <AnalysisWrapper>
            <h3>☑️ 분석 결과</h3>

            {/* analysis 배열 출력 */}
            {analysisResult.map((item, index) => (
              <p key={index} style={{ marginBottom: "1rem" }}>
                {item}
              </p>
            ))}

            {/* 중요 피드백 출력 */}
            <div style={{ marginTop: "2rem" }}>
              <h2>🎯 중요한 피드백</h2>
              <ul>
                {feedback.map((feedback, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    {feedback}
                  </li>
                ))}
              </ul>
            </div>
          </AnalysisWrapper>
        )}

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

export default CoachPitchAnalysisPage;

// 💅 styled-components
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
  // display: flex;
  // flex-direction: column;
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

const Sheet = styled.div`
  margin-top: 1.5rem;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 10px;
  align-items: center;
`;
const SlideNav = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
`;

const SlideButton = styled.button`
  background: #222;
  border: 1px solid #555;
  color: #ccc;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.div`
  color: #aaa;
  font-size: 14px;
`;

const AnalysisWrapper = styled.div`
  margin-top: 1.5rem;
  color: #ccc;
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
