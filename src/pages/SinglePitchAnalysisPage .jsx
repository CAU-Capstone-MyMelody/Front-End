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
import { fetchChatGptRecommendation } from "../apis/chatgpt";

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

  const { time, recordedPitch, note, audioBlob, selectedGenres } =
    location.state || {};

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
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeoutId;
    if (recordedPitch && selectedGenres && !analysisResult) {
      timeoutId = setTimeout(() => {
        fetchChatGptRecommendation(recordedPitch, selectedGenres, note)
          .then((res) => {
            setAnalysisResult(res.analysis);
            setRecommendations(res.recommendations);
          })
          .catch((err) => {
            console.error("ChatGPT 요청 실패: ", err);
          });
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [recordedPitch, selectedGenres]);

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  // 백엔드가 있다면 연결될 함수
  // const handleConfirmSave = () => {
  //   if (!customTitle.trim()) {
  //     alert("타이틀을 입력해주세요!");
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onloadend = async () => {
  //     const audioBase64 = reader.result;

  //     const myVoiceData = {
  //       title: customTitle,
  //       resultSummary: analysisResult,
  //       recordedPitch,
  //       time,
  //       audioBase64,
  //       createdAt: new Date().toISOString(),
  //     };

  //     try {
  //       await saveMyVoiceAnalysisResult(myVoiceData);
  //       setIsModalOpen(false);
  //       setCustomTitle("");
  //       alert("분석 결과가 저장되었습니다!");
  //     } catch (error) {
  //       console.error("저장 실패: ", error);
  //       alert("저장 중 오류가 발생했습니다.");
  //     }
  //   };

  //   reader.readAsDataURL(audioBlob);
  // };

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

    // Blob을 Base64로 변환해서 저장
    // url로 하는것은 임시이고 Base64로 해당 오디오를 영구 저장할수 있게 한다.
    // 로컬스토리지에 있던 기존의 데이터를 가져와서 그것(prev)에 이어서 다시 setItem한다
    const reader = new FileReader();
    reader.onloadend = () => {
      newEntry.audioBase64 = reader.result; // Base64 데이터 추가
      const prev = JSON.parse(localStorage.getItem("voiceAnalysis")) || [];
      localStorage.setItem(
        "voiceAnalysis",
        JSON.stringify([...prev, newEntry])
      );
      setIsModalOpen(false);
      setCustomTitle("");
      alert("분석 결과가 저장되었습니다!");
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
                <li key={index}>
                  • <strong>{song.title}</strong>{" "}
                  <span style={{ color: "#aaa" }}>- {song.artist}</span>
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
  height: 300px;
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
  background-color: #111;
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
