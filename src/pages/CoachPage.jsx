import React from "react";
import styled from "styled-components";
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
  const navigate = useNavigate();

  return (
    <Container>
      <TopNav></TopNav>
      <ListContainer>
        <h2>🎧 노래 목록</h2>
        {chartData.map((song, index) => (
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
      <Nav></Nav>
    </Container>
  );
};

export default CoachPage;

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

  h2 {
    color: white;
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
