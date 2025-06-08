import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
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
import { fetchChatGptRecommendation } from "../apis/chatgpt";
import resultJson from "../data/pitch_results.json"; // JSON 파일 경로에 맞게 수정
import { Formatter, Renderer, Stave, StaveNote } from "vexflow";

// 재생 위치 수직 선
const verticalLinePlugin = {
  id: "cursorLine",
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales, data, config } = chart;
    if (!ctx || !chartArea || !scales || !data || !config) return;

    const xScale = scales.x;
    const currentTime = config.options.plugins.cursorLineTime;
    if (currentTime == null) return;

    // 현재 시간과 가장 가까운 time 인덱스를 찾아서 x 위치 계산
    const timeLabels = data.labels;
    if (!timeLabels || !Array.isArray(timeLabels)) return;

    // 현재 시간과 가장 가까운 시간의 인덱스를 찾음
    let closestIndex = 0;
    let minDiff = Infinity;
    for (let i = 0; i < timeLabels.length; i++) {
      const diff = Math.abs(timeLabels[i] - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    const xPos = xScale.getPixelForValue(timeLabels[closestIndex]);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xPos, chartArea.top);
    ctx.lineTo(xPos, chartArea.bottom);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#c9a5f5"; // 연보라
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
  if (!container) {
    console.error("Container is not defined");
    return;
  }

  container.innerHTML = "";

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(200, 180); // 한 악보당 크기 조절
  const context = renderer.getContext();

  const stave = new Stave(10, 40, 160); // 작게 줄임
  stave.addClef("treble").setContext(context).draw();

  const noteName = hzToNoteName(hz).replace("#", "#");
  const [key, octave] = noteName.split("/");

  console.log("key", key);
  console.log("octave", octave);

  const note = new StaveNote({
    keys: [`${key}/${octave}`],
    duration: "q",
  });

  Formatter.FormatAndDraw(context, stave, [note]);
}

const SinglePitchAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  const { time, recordedPitch, note, audioBlob, selectedGenres, transpose } =
    location.state || {};

  const vexMinRef = useRef(null);
  const vexMaxRef = useRef(null);

  const [maxNote, setMaxNote] = useState();
  const [minNote, setMinNote] = useState();

  useEffect(() => {
    if (audioBlob) {
      // 녹음된 음성에 대한 오디오 파일의 url을 생성 (임시 url로 종료되면 사라진다)
      // 즉 브라우저 메모리 안에 있는 blob을 임시 주소로 바꾼것
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  useEffect(() => {
    if (minNote || maxNote) {
      console.log("최소 음정 (state 변경 후):", minNote);
      console.log("최대 음정 (state 변경 후):", maxNote);
    }
  }, [minNote, maxNote]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (recordedPitch && recordedPitch.length > 0) {
      console.log("recordedPitch", recordedPitch);
      const pitches = recordedPitch.filter((hz) => hz > 0);
      const minHz = Math.min(...pitches);
      const maxHz = Math.max(...pitches);
      console.log("최소 음정:", minHz);
      console.log("최대 음정:", typeof maxHz);
      renderSingleNote(vexMinRef.current, minHz);
      renderSingleNote(vexMaxRef.current, maxHz);

      const minNoteTemp = hzToNoteName2(minHz);
      const maxNoteTemp = hzToNoteName2(maxHz);
      setMinNote(minNoteTemp);
      setMaxNote(maxNoteTemp);
      console.log("최소 음정:", minNote);
      console.log("최대 음정:", maxNote);
    }
  }, [recordedPitch]);

  useEffect(() => {
    let timeoutId;
    console.log(recordedPitch, selectedGenres, note, transpose);

    // 최저음과 최고음을 계산합니다.
    const minPitch = Math.min(...recordedPitch);
    const maxPitch = Math.max(...recordedPitch);

    // Transpose 값을 반영하는 함수 (키를 내리기)
    const transposeFrequencyDown = (frequency, transposeValue) => {
      // transposeValue가 1이면 1키 내리기, 2이면 2키 내리기
      return frequency / Math.pow(1.05946, transposeValue);
    };

    // JSON의 노래마다 최대음을 Transpose를 적용해서 새로운 maxPitch 값을 계산합니다.
    const transposedSongs = resultJson.map((song) => {
      const transposedMax = transposeFrequencyDown(song.pitch.max, transpose); // song의 최대 음에 Transpose 적용
      return {
        ...song,
        pitch: {
          ...song.pitch,
          transposedMax: transposedMax,
        },
      };
    });

    console.log(transposedSongs);
    // 장르 겹치는 수 + 음역대 기준으로 필터링 후 정렬
    const filteredAndSortedSongs = transposedSongs
      .map((song) => {
        const genreMatches = song.genre.filter((g) =>
          selectedGenres.includes(g)
        );
        const matchCount = genreMatches.length;

        return {
          ...song,
          matchCount,
        };
      })
      .filter((song) => {
        const songMin = song.pitch.min;
        const songMax = song.pitch.transposedMax;

        return (
          song.matchCount > 0 && songMin >= minPitch && songMax <= maxPitch
        );
      })
      .sort((a, b) => b.matchCount - a.matchCount); // 겹치는 장르 수 내림차순 정렬

    console.log(filteredAndSortedSongs);

    if (
      recordedPitch &&
      selectedGenres &&
      !analysisResult &&
      filteredAndSortedSongs
    ) {
      timeoutId = setTimeout(() => {
        console.log(transposedSongs);
        console.log("추천된 노래: ", filteredAndSortedSongs);
        fetchChatGptRecommendation(
          recordedPitch,
          selectedGenres,
          note,
          transpose,
          filteredAndSortedSongs
        )
          .then((res) => {
            setAnalysisResult(res.analysis);
            setRecommendations(res.recommendations);

            console.log(res.analysis);
            console.log(res.recommendations);
          })
          .catch((err) => {
            console.error("ChatGPT 요청 실패: ", err);
          });
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [recordedPitch, selectedGenres, transpose, note]);

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!customTitle.trim()) {
      alert("타이틀을 입력해주세요!");
      return;
    }

    const newEntry = {
      id: Date.now(),
      title: customTitle,
      resultSummary: analysisResult,
      recommendations: recommendations,
      createdAt: new Date().toISOString(),
      recordedPitch,
      time,
      audioUrl, // 저장할 수는 없고, blob을 base64로 변환해서 저장해야 함
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      newEntry.audioBase64 = reader.result; // Base64 데이터 포함

      let prev = JSON.parse(localStorage.getItem("voiceAnalysis")) || [];

      // 새 항목 추가 후 localStorage 크기를 테스트
      prev.push(newEntry);

      try {
        localStorage.setItem("voiceAnalysis", JSON.stringify(prev));
        setIsModalOpen(false);
        setCustomTitle("");
        alert("분석 결과가 저장되었습니다!");
      } catch (e) {
        // 용량 초과 발생 시 오래된 항목 제거하며 재시도
        while (e.name === "QuotaExceededError" && prev.length > 0) {
          prev.shift(); // 가장 오래된 항목 제거
          try {
            localStorage.setItem("voiceAnalysis", JSON.stringify(prev));
            setIsModalOpen(false);
            setCustomTitle("");
            alert("이전 기록 일부를 제거하고 새 결과를 저장했습니다.");
            break;
          } catch (err) {
            e = err; // 다시 오류 발생 시 루프 유지
          }
        }

        if (prev.length === 0) {
          alert(
            "저장 공간이 부족해 저장할 수 없습니다. 다른 항목을 삭제해주세요."
          );
        }
      }
    };

    reader.readAsDataURL(audioBlob);
  };

  const data = {
    labels: time,
    datasets: [
      {
        label: "🎙️ 녹음 음정",
        data: recordedPitch,
        borderColor: "#9b7ed8",
        backgroundColor: "#9b7ed8",
        tension: 0.3,
        pointRadius: 1, // 🔽 포인트 작게
        borderWidth: 2, // 🔽 선 얇게
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
      cursorLineTime: currentTime, // 현재 시간 전달
    },
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎼 피치 분석 결과</Title>
        <AudioPlayer controls ref={audioRef} src={audioUrl} />
        <ChartWrapper>
          <Line data={data} options={options} />
        </ChartWrapper>

        {!analysisResult && recommendations.length === 0 && (
          <AnalysisWrapper>
            <LoadingContainer>
              <Spinner />
              <DotLoadingText>음성 분석 중</DotLoadingText>
              <p>
                ChatGPT가 당신의 음성을 분석하고 있어요. 잠시만 기다려 주세요!
                🎧
              </p>
            </LoadingContainer>
          </AnalysisWrapper>
        )}

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

        {analysisResult && (
          <>
            <AnalysisWrapper>
              <h3>☑️ 분석 결과</h3>
              <p>{analysisResult}</p>
            </AnalysisWrapper>
          </>
        )}

        {recommendations.length > 0 && (
          <Section>
            <SectionTitle>🎧 추천 노래</SectionTitle>
            <RecommendationList>
              {recommendations.map((song, index) => (
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
                    최고음: <strong>{hzToNoteName2(song.max)}</strong> (
                    {song.max}
                    Hz) / 최저음: <strong>{hzToNoteName2(song.min)}</strong> (
                    {song.min}Hz)
                  </div>
                </li>
              ))}
            </RecommendationList>
          </Section>
        )}
        <SaveButton onClick={handleSaveClick}>결과 저장하기</SaveButton>

        {isModalOpen && (
          <ModalOverlay>
            <ModalBox>
              <h3>저장할 제목을 입력하세요</h3>
              <input
                type="text"
                placeholder="예: 아이유 팔레트로 음정 분석"
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
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default SinglePitchAnalysisPage;

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

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  // height: 300px;
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

const AnalysisWrapper = styled.div`
  margin-top: 1.5rem;
  color: #ccc;
`;

const RecommendationsWrapper = styled.div`
  margin-top: 1.5rem;
  color: #ccc;
  ul {
    padding-left: 1rem;
  }
  li {
    margin-bottom: 0.5rem;
  }
`;

const SaveButton = styled.button`
  margin-top: 1rem;
  background-color: #9b7ed8;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
`;

// 🎨 Modal Styles
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

// 스타일드 컴포넌트 추가
const Section = styled.div`
  margin-top: 2rem;

  border-radius: 10px;
  color: #ccc;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 0.5rem;
`;

const SectionContent = styled.p`
  line-height: 1.6;
`;

const RecommendationList = styled.ul`
  padding-left: 1rem;
  list-style: none;
  li {
    margin-bottom: 0.3rem;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
`;

const dotAnimation = keyframes`
  0%   { content: "."; }
  25%  { content: ".."; }
  50%  { content: "..."; }
  100% { content: "."; }
`;

const DotLoadingText = styled.h3`
  position: relative;
  font-size: 1.25rem;
  &::after {
    content: "";
    display: inline-block;
    margin-left: 4px;
    animation: ${dotAnimation} 2s steps(3, end) infinite;
  }
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 6px solid #9b7ed8;
  border-top: 6px solid transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
