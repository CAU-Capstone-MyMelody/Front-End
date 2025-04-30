import React, { useState, useRef } from "react";
import styled, { keyframes } from "styled-components";

const Recorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const audioDataRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      streamRef.current = stream;
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );

      audioDataRef.current = [];

      processorRef.current.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        audioDataRef.current.push(new Float32Array(channelData));
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

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

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    processorRef.current.disconnect();
    sourceRef.current.disconnect();
    streamRef.current.getTracks().forEach((track) => track.stop());
    audioContextRef.current.close();

    // 녹음된 오디오 데이터를 병합하여 리샘플링 처리
    const mergedAudioData = flattenAndEncodeWAV(audioDataRef.current, 44100);

    // WAV 파일 생성
    const audioBlob = new Blob([mergedAudioData], { type: "audio/wav" });

    onRecordingComplete(audioBlob);
    setIsRecording(false);
  };

  // Float32Array[] → WAV Blob
  function flattenAndEncodeWAV(buffers, sampleRate) {
    const merged = mergeBuffers(buffers);
    return encodeWAV(merged, sampleRate);
  }

  function mergeBuffers(buffers) {
    const length = buffers.reduce((acc, b) => acc + b.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    for (let b of buffers) {
      result.set(b, offset);
      offset += b.length;
    }
    return result;
  }

  function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, (numChannels * bitsPerSample) / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s * 0x7fff, true);
    }

    return new Uint8Array(buffer);
  }

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
