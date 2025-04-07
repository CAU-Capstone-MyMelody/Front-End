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
import TopNav from "../components/TopNav";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";

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

const HistoryDetailPage = () => {
  const location = useLocation();
  const { time, recordedPitch, originalPitch, audio, videoId } =
    location.state || {};
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
      {
        label: "🎵 원곡 음정",
        data: originalPitch,
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
        <ChartWrapper>
          <Line data={data} options={options} />
        </ChartWrapper>{" "}
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
  height: 300px;
  margin-top: 1rem;
`;
