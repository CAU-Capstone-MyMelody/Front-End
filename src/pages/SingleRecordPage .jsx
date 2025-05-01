import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Recorder from "../components/Recorder";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";
import axios from "axios";

const SingleRecordPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [audioBlob, setAudioBlob] = useState(null);

  // 녹음 파일로 오디오 분석
  const [audioFileName, setAudioFileName] = useState("");

  const [isRecorded, setIsRecorded] = useState(false);

  // URL에서 'genres' 파라미터 가져오기
  const genresParam = new URLSearchParams(search).get("genres");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const noteParam = new URLSearchParams(search).get("note");
  const [note, setNote] = useState("");

  const transposeParam = new URLSearchParams(search).get("transpose");
  const [transpose, setTranspose] = useState(0); // 기본값 0

  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url); // ⬅ 메모리 해제
  }, [audioBlob]);

  useEffect(() => {
    if (transposeParam) {
      setTranspose(parseInt(transposeParam));
    }
  }, [transposeParam]);

  useEffect(() => {
    if (noteParam) {
      setNote(noteParam);
    }
  }, [noteParam]);

  useEffect(() => {
    if (genresParam) {
      setSelectedGenres(genresParam.split(","));
    }
  }, [genresParam]);

  // 파일 업로드 시
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("오디오 파일만 업로드 가능합니다.");
      return;
    }

    setAudioBlob(file);
    setAudioFileName(file.name);
    setIsRecorded(false); // 업로드한 경우는 녹음이 아님

    e.target.value = ""; // 🔥 핵심! 같은 파일 재선택 방지
  };

  const handleAnalyze = async () => {
    if (!audioBlob) {
      alert("먼저 녹음을 해주세요!");
      return;
    }

    if (selectedGenres.length === 0) {
      alert("장르를 선택해주세요!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, audioBlob.name);

      console.log(formData.get("file"));
      const response = await axios.post(
        "http://3.39.217.34:8000/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { time, recordedPitch } = response.data;

      navigate("/singlepitchanalysis", {
        state: {
          audioBlob,
          selectedGenres,
          time,
          note,
          transpose,
          recordedPitch,
        },
      });
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      alert("분석에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // const handleAnalyze = () => {
  //   if (!audioBlob) {
  //     alert("먼저 녹음을 해주세요!");
  //     return;
  //   }

  //   console.log(selectedGenres, note, transpose);

  //   // 장르가 선택되지 않은 경우 경고
  //   if (selectedGenres.length === 0) {
  //     alert("장르를 선택해주세요!");
  //     return;
  //   }

  //   navigate("/singlepitchanalysis", {
  //     state: {
  //       audioBlob,
  //       selectedGenres,
  //       note,
  //       transpose,
  //       max: 880,
  //       min: 190,
  //       time: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
  //       recordedPitch: [
  //         110.0, 230.0, 210.0, 190.0, 280.0, 300.0, 380.0, 450.0, 560.0, 680,
  //         950.0,
  //       ],
  //     },
  //   });
  // };

  // 여기서도 오디오 태그의 src에 blob을 url로 임시 변환시킨다

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎤 나의 음역대 녹음</Title>
        <ContentWrapper>
          <RecordBox>
            <Recorder
              onRecordingComplete={(blob) => {
                setAudioBlob(blob);
                setIsRecorded(true);
                setAudioFileName(""); // 녹음 시 기존 업로드 파일명 초기화
              }}
            />
            {/* 🔽 오디오 파일 업로드 UI */}
            <UploadLabel htmlFor="audio-upload">
              또는 오디오 파일 업로드
            </UploadLabel>
            <FileInput
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
            />
            {audioFileName && !isRecorded && (
              <FileName>📁 {audioFileName}</FileName>
            )}
            {audioUrl && <AudioPlayer key={audioUrl} controls src={audioUrl} />}
          </RecordBox>
          <ActionButton onClick={handleAnalyze}>🎧 분석하기</ActionButton>
        </ContentWrapper>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default SingleRecordPage;

// 스타일링 부분
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  margin: 0.5rem 0 1rem 0;
`;

const RecordBox = styled.div`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  background-color: #9b7ed8;
  color: black;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

const AudioPlayer = styled.audio`
  margin-top: 1rem;
  width: 100%;
  height: 42px;
`;

const UploadLabel = styled.label`
  display: inline-block;
  background-color: #1e1e1e;
  color: #9b7ed8;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  border: 1px solid #9b7ed8;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2a2a2a;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileName = styled.div`
  font-size: 0.85rem;
  color: #aaa;
  margin-top: 0.5rem;
  text-align: center;
`;
