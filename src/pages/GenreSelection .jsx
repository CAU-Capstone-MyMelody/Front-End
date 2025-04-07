import React, { useState } from "react";
import Nav from "../components/Nav";
import styled from "styled-components";
import TopNavBack from "../components/TopNavBack";

const GenreSelection = () => {
  const genres = [
    "발라드",
    "힙합",
    "록",
    "재즈",
    "클래식",
    "EDM",
    "R&B",
    "트로트",
    "인디",
    "재즈 블루스",
    "댄스",
    "국악",
    "EDM 트랩",
    "K-pop",
    "Pop-Song",
    "J-pop",
  ];

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [userNote, setUserNote] = useState("");

  const handleGenreSelect = (genre) => {
    setSelectedGenres((prevSelectedGenres) =>
      prevSelectedGenres.includes(genre)
        ? prevSelectedGenres.filter((selected) => selected !== genre)
        : [...prevSelectedGenres, genre]
    );
  };

  const handleSubmit = () => {
    if (selectedGenres.length > 0) {
      const params = new URLSearchParams();
      params.set("genres", selectedGenres.join(","));
      if (userNote) params.set("note", userNote);
      window.location.href = `/singlerecord?${params.toString()}`;
    } else {
      alert("하나 이상의 장르를 선택하세요.");
    }
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <ExplanationText>
          <h2>음성 분석을 위한 장르 선택</h2>
          <p>
            아래에서 원하는 장르를 선택하세요. 선택된 장르에 맞춰 피치 분석을
            진행하고, 그에 적합한 음악을 추천해드립니다.
          </p>
        </ExplanationText>

        <GenreButtons>
          {genres.map((genre, index) => (
            <GenreButton
              key={index}
              onClick={() => handleGenreSelect(genre)}
              selected={selectedGenres.includes(genre)}
            >
              {genre}
            </GenreButton>
          ))}
        </GenreButtons>

        <NoteInput
          placeholder="예: 정국 세븐을 불렀어요. 정국, 지코 노래를 좋아해요."
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
        />

        <CoachBtn onClick={handleSubmit}>
          <StartRecordingButton>분석 시작</StartRecordingButton>
        </CoachBtn>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default GenreSelection;

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

const ExplanationText = styled.div`
  color: #dfe2ea;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
  }
`;

const GenreButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const GenreButton = styled.button`
  background-color: ${(props) => (props.selected ? "#9B7ED8" : "#333")};
  color: #fff;
  border: 2px solid ${(props) => (props.selected ? "#9B7ED8" : "#555")};
  border-radius: 30px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:hover {
    background-color: #9b7ed8;
    border-color: #9b7ed8;
  }

  &:focus {
    outline: none;
  }
`;

const NoteInput = styled.textarea`
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.8rem;
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 12px;
  font-size: 1rem;
  resize: none;
  min-height: 100px;
  box-sizing: border-box;

  &::placeholder {
    color: #aaa;
    font-weight: 600;
  }

  &:focus {
    outline: none;
    border-color: #9b7ed8;
  }
`;

const CoachBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
`;

const StartRecordingButton = styled.button`
  background: #9b7ed8;
  color: #fff;
  border: 2px solid #9b7ed8;
  border-radius: 50px;
  padding: 0.7rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 550;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease-in-out;

  &:focus {
    outline: none;
  }
`;
