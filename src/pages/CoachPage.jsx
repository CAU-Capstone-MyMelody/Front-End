import React, { useState } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import TopNav from "../components/TopNav";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";

const chartData = [
  {
    rank: 1,
    title: "벚꽃엔딩",
    artist: "버스커 버스커",
    image: "/img/벚꽃엔딩.png",
    videoId: "uEsT7K_X7Pw",
  },
  {
    rank: 2,
    title: "헤어지자 말해요",
    artist: "박재정",
    image: "/img/헤어지자말해요.png",
    videoId: "SrQzxD8UFdM",
  },
  {
    rank: 3,
    title: "아무노래",
    artist: "지코 (ZICO)",
    image: "/img/아무노래.png",
    videoId: "yL6P7OR5WOM",
  },
];

const CoachPage = () => {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const filteredData = chartData.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuggestionClick = (keyword) => {
    setSearch(keyword);
    setShowSuggestions(false);
  };

  return (
    <Container>
      <TopNav />
      <ListContainer>
        <SearchBarWrapper>
          <FaSearch color="#ccc" size={16} />
          <SearchInput
            type="text"
            placeholder="곡 제목 또는 아티스트 검색"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && search && (
            <SuggestionsBox>
              {filteredData.slice(0, 5).map((item, idx) => (
                <SuggestionItem
                  key={idx}
                  onClick={() => handleSuggestionClick(item.title)}
                >
                  {item.title} - {item.artist}
                </SuggestionItem>
              ))}
              {filteredData.length === 0 && (
                <NoResult>일치하는 곡이 없습니다</NoResult>
              )}
            </SuggestionsBox>
          )}
        </SearchBarWrapper>

        <h2>🎧 노래 목록</h2>
        {filteredData.map((song, index) => (
          <SongCard
            key={index}
            onClick={() => navigate(`/coachrecord?videoId=${song.videoId}`)}
          >
            <Rank>{song.rank}</Rank>
            <AlbumImg src={song.image} alt={`${song.title} 앨범 이미지`} />
            <Info>
              <Title>{song.title}</Title>
              <Artist>{song.artist}</Artist>
            </Info>
          </SongCard>
        ))}
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default CoachPage;

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

  h2 {
    color: white;
    margin-bottom: 0.8rem;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
  border: 1.5px solid #444;

  .icon {
    color: #aaa;
    margin-right: 0.6rem;
    font-size: 1rem;
  }

  &:focus-within {
    border: 2px solid #9b7ed8;
  }
`;

const SongCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: #222;
  }
`;

const Rank = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  width: 30px;
  text-align: center;
  color: #9b7ed8;
`;

const AlbumImg = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  margin: 0 0.75rem;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
`;

const Artist = styled.div`
  font-size: 0.875rem;
  color: #aaa;
`;

const SearchBarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #444;
`;

const SearchInput = styled.input`
  background-color: transparent;
  border: none;
  color: white;
  margin-left: 0.5rem;
  flex: 1;
  font-size: 0.9rem;

  &:focus {
    outline: none;
  }
`;

const SuggestionsBox = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background-color: #222;
  border: 1px solid #333;
  border-radius: 8px;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  padding: 0.5rem 0.75rem;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const NoResult = styled.div`
  padding: 0.5rem 0.75rem;
  color: #aaa;
  font-size: 0.85rem;
`;
