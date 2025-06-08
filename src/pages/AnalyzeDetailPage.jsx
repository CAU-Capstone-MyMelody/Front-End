import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  Filler,
} from "chart.js";
import TopNavBack from "../components/TopNavBack";
import Nav from "../components/Nav";
import { Formatter, Renderer, Stave, StaveNote } from "vexflow";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
);

// 수직선 플러그인
const verticalLinePlugin = {
  id: "cursorLine",
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const currentTime = chart.config.options.plugins.cursorLineTime;
    if (currentTime == null) return;

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

Chart.register(verticalLinePlugin);

// Hz → note name 변환 유틸
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

function hzToNoteName2(hz) {
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
  return `${note}${octave}`;
}

// VexFlow 렌더링 함수
function renderSingleNote(container, hz) {
  if (!container) return;
  container.innerHTML = "";

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(200, 180); // 한 악보당 크기 조절
  const context = renderer.getContext();

  const stave = new Stave(10, 40, 160); // 작게 줄임
  stave.addClef("treble").setContext(context).draw();

  const noteName = hzToNoteName(hz).replace("#", "#");
  const [key, octave] = noteName.split("/");

  const note = new StaveNote({
    keys: [`${key}/${octave}`],
    duration: "q",
  });

  Formatter.FormatAndDraw(context, stave, [note]);
}

const AnalyzeDetailPage = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const [entry, setEntry] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const vexMinRef = useRef(null);
  const vexMaxRef = useRef(null);
  const [maxNote, setMaxNote] = useState();
  const [minNote, setMinNote] = useState();

  useEffect(() => {
    // id를 기반으로 하는데 이것도 나중에 백엔드 사용자 데이터에서 가져올때 생성된 데이터의 고유 id로 비교하면 될듯?
    if (id) {
      const stored = JSON.parse(localStorage.getItem("voiceAnalysis")) || [];
      const found = stored.find((item) => item.id === id);
      if (found) {
        setEntry(found);
      }

      console.log("entry", found);
    }
  }, [id]);

  // 오디오 재생 시간 추적
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (entry && entry.recordedPitch?.length) {
      const pitches = entry.recordedPitch.filter((hz) => hz > 0);
      const minHz = Math.min(...pitches);
      const maxHz = Math.max(...pitches);
      renderSingleNote(vexMinRef.current, minHz);
      renderSingleNote(vexMaxRef.current, maxHz);

      const minNoteTemp = hzToNoteName2(minHz);
      const maxNoteTemp = hzToNoteName2(maxHz);
      setMinNote(minNoteTemp);
      setMaxNote(maxNoteTemp);
      console.log("최소 음정:", minNote);
      console.log("최대 음정:", maxNote);
    }
  }, [entry]);

  useEffect(() => {
    if (minNote || maxNote) {
      console.log("최소 음정 (state 변경 후):", minNote);
      console.log("최대 음정 (state 변경 후):", maxNote);
    }
  }, [minNote, maxNote]);

  if (!entry) return null;

  // 🎯 데이터 변환: { x, y } 포맷으로
  const pitchData = entry.time.map((t, i) => ({
    x: t,
    y: entry.recordedPitch[i],
  }));

  const data = {
    datasets: [
      {
        label: "🎙️ 녹음 음정",
        data: pitchData,
        stepped: true,
        borderColor: "#9b7ed8",
        backgroundColor: "#9b7ed8",
        tension: 0.3,
        pointRadius: 2,
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
      tooltip: { enabled: true },
      cursorLineTime: currentTime,
    },
  };

  const handleTagClick = (tag) => {
    navigate(`/searchpage?query=${encodeURIComponent(tag)}`);
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎼 {entry.title}</Title>
        <AudioPlayer ref={audioRef} controls src={entry.audioBase64} />
        <ChartWrapper>
          <Line data={data} options={options} />
        </ChartWrapper>

        <ScoreWrapper>
          <div>
            <h4>🎵 최저 음정</h4>
            <VexScore ref={vexMinRef} />
            <p>{minNote}</p> {/* 여기서 최소 음정 텍스트 출력 */}
          </div>
          <div>
            <h4>🎵 최고 음정</h4>
            <VexScore ref={vexMaxRef} />
            <p>{maxNote}</p> {/* 여기서 최대 음정 텍스트 출력 */}
          </div>
        </ScoreWrapper>

        <AnalysisWrapper>
          <h3>☑️ 분석 결과</h3>
          <p>{entry.resultSummary}</p>
        </AnalysisWrapper>
        <Section>
          {/* <SectionTitle>🎧 추천 노래</SectionTitle>
          <RecommendationList>
            {entry.recommendations.map((song, index) => (
              <li key={index} onClick={() => handleTagClick(song.title)}>
                • <strong>{song.title}</strong>{" "}
                <span style={{ color: "#aaa" }}>- {song.artist}</span>
              </li>
            ))}
          </RecommendationList> */}
          <SectionTitle>🎧 추천 노래</SectionTitle>
          <RecommendationList>
            {entry.recommendations.map((song, index) => (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "1rem" }}>
                  • <strong>{song.title}</strong>{" "}
                  <span style={{ color: "#aaa" }}>- {song.artist}</span>
                </div>
                <div
                  style={{
                    color: "#dfdfdf",
                    fontSize: "0.9rem",
                    marginLeft: "1.5rem",
                  }}
                >
                  최고음: <strong>{hzToNoteName2(song.max)}</strong> ({song.max}
                  Hz) / 최저음: <strong>{hzToNoteName2(song.min)}</strong> (
                  {song.min}Hz)
                </div>
              </li>
            ))}
          </RecommendationList>
        </Section>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default AnalyzeDetailPage;

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

const ScoreWrapper = styled.div`
  margin-top: 2rem;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
  flex-wrap: wrap;

  div {
    min-width: 180px;
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    color: #9b7ed8;
  }
`;

const VexScore = styled.div`
  background-color: white;
  margin-top: 1rem;
  flex: 1 1 45%;
  min-width: 180px;
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

const AnalysisWrapper = styled.div`
  margin-top: 1.5rem;
  color: #ccc;
`;

const Section = styled.div`
  margin-top: 2rem;
  background-color: #111;
  border-radius: 10px;
  color: #ccc;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 0.5rem;
`;

const RecommendationList = styled.ul`
  color: white;
  font-size: 0.95rem;
  line-height: 1.6;
  list-style: none;
  padding-left: 0;
`;
