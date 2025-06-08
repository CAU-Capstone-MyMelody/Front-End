import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

const verticalLinePlugin = {
  id: "cursorLine",
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const currentTime = chart.config.options.plugins.cursorLineTime;
    if (currentTime == null) return;
    const xPos = scales.x.getPixelForValue(currentTime);
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

Chart.register(verticalLinePlugin);

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

const HistoryDetailPage = () => {
  const location = useLocation();
  const { time, recordedPitch, originalPitch, audio, videoId } =
    location.state || {};
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0); // 현재 슬라이드 인덱스
  const notesPerPage = 4;

  const [selectedSegment, setSelectedSegment] = useState(null);

  // 4개씩 그룹으로 나누기 -> 8개씩 수정
  const chunkedOriginal = [];
  const chunkedRecorded = [];

  // for (let i = 0; i < originalPitch.length; i += 4) {
  //   chunkedOriginal.push(originalPitch.slice(i, i + 4));
  //   chunkedRecorded.push(recordedPitch.slice(i, i + 4));
  // }

  for (let i = 0; i < originalPitch.length; i += 8) {
    chunkedOriginal.push(originalPitch.slice(i, i + 8));
    chunkedRecorded.push(recordedPitch.slice(i, i + 8));
  }

  const refs = useRef([]);

  useEffect(() => {
    const index = currentIndex;
    const ref = refs.current[index];
    if (!ref) return;

    ref.innerHTML = "";
    const renderer = new Renderer(ref, Renderer.Backends.SVG);
    renderer.resize(400, 350); // 높이 증가
    const context = renderer.getContext();

    const drawLine = (startY, oSlice, rSlice) => {
      const stave = new Stave(10, startY, 380);
      stave.addClef("treble").setContext(context).draw();

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

      new Formatter()
        .joinVoices([voice1, voice2])
        .format([voice1, voice2], 350);
      voice1.draw(context, stave);
      voice2.draw(context, stave);
    };

    const oSlice = chunkedOriginal[index];
    const rSlice = chunkedRecorded[index];
    if (!oSlice.length || !rSlice.length) return;

    const firstHalfO = oSlice.slice(0, 4);
    const secondHalfO = oSlice.slice(4, 8);
    const firstHalfR = rSlice.slice(0, 4);
    const secondHalfR = rSlice.slice(4, 8);

    drawLine(40, firstHalfO, firstHalfR); // 첫 번째 줄
    drawLine(180, secondHalfO, secondHalfR); // 두 번째 줄 (Y 위치 조정)
  }, [currentIndex, chunkedOriginal, chunkedRecorded]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime + time[0]);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const duration = time.length ? time[time.length - 1] : 0;

  // 🔢 구간 나누기
  const segments = [];
  const step = 10;

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

  console.log("Filtered Data:", filtered);
  const data = {
    labels: filtered.labels,
    datasets: [
      {
        label: "🎙️ 녹음 음정",
        data: filtered.recorded,
        stepped: true,
        borderColor: "#9b7ed8",
        backgroundColor: "#9b7ed8",
        tension: 0.3,
      },
      {
        label: "🎵 원곡 음정",
        data: filtered.original,
        stepped: true,
        borderColor: "#888",
        backgroundColor: "#888",
        tension: 0.3,
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
      cursorLineTime: currentTime,
    },
  };

  return (
    <Container>
      <TopNavBack></TopNavBack>
      <ListContainer>
        <Title>🎼 코칭 상세 결과</Title>
        {videoId && (
          <YouTubeWrapper>
            <YouTubeFrame
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allowFullScreen
            />
          </YouTubeWrapper>
        )}
        <AudioPlayer ref={audioRef} controls src={audio} />
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
        {/* <Sheet>
          {chunkedOriginal.map((_, idx) => (
            <div
              key={idx}
              ref={(el) => (refs.current[idx] = el)}
              style={{ marginBottom: "20px" }}
            />
          ))}
        </Sheet> */}
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
      </ListContainer>
      <Nav></Nav>
    </Container>
  );
};

export default HistoryDetailPage;

const Container = styled.div`
  background-color: #090909;
  width: 100%;
  height: 100%;
  // position: relative;
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

const Title = styled.h2`
  color: white;
`;

const YouTubeWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 비율 (9/16 * 100) */
  height: 0;
  margin-bottom: 1rem;
`;

const YouTubeFrame = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-bottom: 1rem;
  height: 42px;
`;

const ChartWrapper = styled.div`
  width: 100%;
  // height: 300px;
  margin-top: 1rem;
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
