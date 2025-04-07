import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Recorder from "../components/Recorder";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";

const SingleRecordPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [audioBlob, setAudioBlob] = useState(null);

  // URL에서 'genres' 파라미터 가져오기
  const genresParam = new URLSearchParams(search).get("genres");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const noteParam = new URLSearchParams(search).get("note");
  const [note, setNote] = useState("");

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

  // const handleAnalyze = async () => {
  //   if (!audioBlob) {
  //     alert("먼저 녹음을 해주세요!");
  //     return;
  //   }

  //   if (selectedGenres.length === 0) {
  //     alert("장르를 선택해주세요!");
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append("audio", audioBlob, "recording.webm");
  //     formData.append("genres", selectedGenres.join(","));

  //     const response = await axios.post("/api/analyze-recording", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     const { time, recordedPitch } = response.data;

  //     navigate("/singlepitchanalysis", {
  //       state: {
  //         audioBlob,
  //         selectedGenres,
  //         time,
  //         recordedPitch,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("분석 중 오류 발생:", error);
  //     alert("분석에 실패했습니다. 다시 시도해주세요.");
  //   }
  // };

  const handleAnalyze = () => {
    if (!audioBlob) {
      alert("먼저 녹음을 해주세요!");
      return;
    }

    // 장르가 선택되지 않은 경우 경고
    if (selectedGenres.length === 0) {
      alert("장르를 선택해주세요!");
      return;
    }

    navigate("/singlepitchanalysis", {
      state: {
        audioBlob,
        selectedGenres,
        note,
        time: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
        recordedPitch: [320.0, 335.0, 360.0, 340.0, 405.0, 380.0, 450.0], // 정국 -세븐 사용자 음정(살짝 부정확)
      },
    });
  };

  // 여기서도 오디오 태그의 src에 blob을 url로 임시 변환시킨다

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>🎤 나의 보컬 녹음</Title>
        <ContentWrapper>
          <RecordBox>
            <Recorder onRecordingComplete={setAudioBlob} />
            {audioBlob && (
              <AudioPlayer controls src={URL.createObjectURL(audioBlob)} />
            )}
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
