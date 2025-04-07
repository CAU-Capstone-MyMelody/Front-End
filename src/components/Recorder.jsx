import React, { useState, useRef } from "react";
import styled, { keyframes } from "styled-components";

const Recorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        clearInterval(timerRef.current);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        onRecordingComplete(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      alert("🎙️ 마이크 권한이 필요합니다.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <RecorderContainer>
      {isRecording ? (
        <>
          <Waveform>
            <Bar />
            <Bar />
            <Bar />
            <Bar />
            <Bar />
          </Waveform>
          <RecordInfo>⏱ {recordTime}초 녹음 중</RecordInfo>
          <StopButton onClick={stopRecording}>
            <StopIcon />
          </StopButton>
        </>
      ) : (
        <StartButton onClick={startRecording}>
          <PlayIcon />
        </StartButton>
      )}
    </RecorderContainer>
  );
};

export default Recorder;

const RecorderContainer = styled.div`
  display: flex;
  text-align: center;
  color: #ccc;
  flex-direction: column;
  align-items: center;
`;

const RecordInfo = styled.p`
  margin: 0.5rem 0;
  color: #aaa;
`;

const StartButton = styled.button`
  background-color: #9b7ed8;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const StopButton = styled.button`
  background-color: red;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const PlayIcon = styled.div`
  width: 0;
  height: 0;
  border-left: 18px solid black;
  border-top: 12px solid transparent;
  border-bottom: 12px solid transparent;
`;

const StopIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 4px;
`;

const wave = keyframes`
  0% { height: 20%; }
  50% { height: 80%; }
  100% { height: 20%; }
`;

const Waveform = styled.div`
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 4px;
  height: 40px;
  margin-bottom: 1rem;
`;

const Bar = styled.div`
  width: 4px;
  background-color: #9b7ed8;
  border-radius: 2px;
  animation: ${wave} 1s infinite ease-in-out;
  animation-delay: calc(0.1s * var(--i));
  height: 40%;

  &:nth-child(1) {
    --i: 1;
  }
  &:nth-child(2) {
    --i: 2;
  }
  &:nth-child(3) {
    --i: 3;
  }
  &:nth-child(4) {
    --i: 4;
  }
  &:nth-child(5) {
    --i: 5;
  }
`;
