import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Chart = () => {
  const navigate = useNavigate();

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "http://3.39.217.34:8000/melon-chart",
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data = response.data;
        console.log(data);
        setChartData(response.data);
      } catch (error) {
        console.error("차트 불러오기 실패:", error);
      }
    };

    fetchChartData();
  }, [navigate]);

  return (
    <Container>
      <TopNav />
      <ListContainer>
        {chartData.map((song, index) => (
          <SongCard key={index}>
            <Rank>{song.rank}</Rank>
            <AlbumImg src={song.image} alt={`${song.title} 앨범 이미지`} />
            <Info>
              <Title>{song.title}</Title>
              <Artist>{song.artist}</Artist>
            </Info>
            {song.isNew && <NewBadge>NEW</NewBadge>}
          </SongCard>
        ))}
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default Chart;

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

const SongCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  position: relative;
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

const NewBadge = styled.div`
  position: absolute;
  right: 12px;
  top: 12px;
  background-color: #9b7ed8;
  color: black;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 6px;
`;
