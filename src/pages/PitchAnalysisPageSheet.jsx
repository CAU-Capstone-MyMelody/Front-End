import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";
import TopNavBack from "../components/TopNavBack";
import Nav from "../components/Nav";

// Hz를 음표로 변환하는 함수
const hzToNoteName = (hz) => {
  if (!hz || hz < 20 || hz > 5000) return null;

  const A4 = 440;
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
  const semitones = 12 * Math.log2(hz / A4);
  const midiNote = Math.round(69 + semitones);
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNames[midiNote % 12];

  return `${note}/${octave}`;
};

const PitchAnalysisPageSheet = () => {
  // 더미 데이터
  const recordedPitch = [440, 466.16, 493.88, 523.25, 554.37]; // 예시로 A4, A#4, B4, C5, C#5
  const originalPitch = [440, 466.16, 493.88, 523.25, 554.37]; // 예시로 A4, A#4, B4, C5, C#5
  const time = [0, 1, 2, 3, 4]; // 각 음표의 시간 (초 단위)

  const originalRef = useRef(null);
  const recordedRef = useRef(null);

  const drawPitchLine = (containerRef, pitchArray, timeArray) => {
    if (!pitchArray || !timeArray || !containerRef.current) return;

    containerRef.current.innerHTML = ""; // 기존 내용 초기화

    // Hz를 음표로 변환
    const noteNames = pitchArray.map((hz) => hzToNoteName(hz)).filter(Boolean);
    const notes = noteNames.map((note, index) => {
      const [key, octave] = note.split("/");
      // 음표의 길이를 문자열로 설정 (예: "4"는 4분음표)
      const staveNote = new StaveNote({
        keys: [`${key}/${octave}`],
        duration: "4", // 4분음표
      });

      return staveNote;
    });

    // VexFlow 렌더러 초기화
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(800, 150);
    const context = renderer.getContext();
    const stave = new Stave(10, 40, 750);
    stave.addClef("treble").setContext(context).draw();

    // Voice 객체 생성
    const voice = new Voice({
      num_beats: notes.length, // 총 음표의 수만큼
      beat_value: 4, // 4분음표 기준
    });

    // timeArray를 사용해 음표의 시간 설정 (ticks로 변환)
    const timeToTicks = (time) => time * 100; // 예시: 1초 = 100 ticks
    notes.forEach((note, index) => {
      const time = timeToTicks(timeArray[index]); // 시간 값을 ticks로 변환
      note.setDuration("4"); // 4분음표로 설정
    });

    voice.addTickables(notes);

    // Formatter로 음표 간 간격을 조정
    new Formatter().joinVoices([voice]).format([voice], 700);
    voice.draw(context, stave);
  };

  useEffect(() => {
    drawPitchLine(originalRef, originalPitch, time);
    drawPitchLine(recordedRef, recordedPitch, time);
  }, []);

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>음정 분석 결과 (악보 형태)</Title>

        <Legend>
          <span>🟣 원본 음정</span>
          <span>🟡 녹음 음정</span>
        </Legend>

        <StaveSection>
          <Label>원본 음정</Label>
          <StaveContainer ref={originalRef} />
        </StaveSection>

        <StaveSection>
          <Label>녹음 음정</Label>
          <StaveContainer ref={recordedRef} />
        </StaveSection>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default PitchAnalysisPageSheet;

// Styled Components
const Container = styled.div`
  background-color: #090909;
  color: white;
  min-height: 100vh;
  padding-top: 50px;
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
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 1rem;
`;

const Legend = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #ccc;
`;

const StaveSection = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #9b7ed8;
`;

const StaveContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1rem;
  overflow-x: auto;
`;
