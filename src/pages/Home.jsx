import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import { useNavContext } from "../apis/NavContext";
import MusicSection from "../components/MusicSection";

const Home = () => {
  const { setActiveNav } = useNavContext();

  useEffect(() => {
    setActiveNav(0);
  }, []);

  return (
    <Container>
      <TopNav></TopNav>
      <ListContainer>
        {/* <GoToBoxContainer>
          <GoToBox>
            <Title>음역대 분석</Title>
            <Text>바로가기</Text>
          </GoToBox>
          <GoToBox>
            <Title>Top100 Song</Title>
            <Text>바로가기</Text>
          </GoToBox>
        </GoToBoxContainer> */}

        <MusicSection
          title="🇰🇷🎧 지금 한국에서 인기 있는 음악"
          regionCode="KR"
        />
        <MusicSection title="🇯🇵🎌 요즘 일본에서 뜨는 음악" regionCode="JP" />
        <MusicSection title="🇺🇸🔥 미국에서 많이 듣는 음악" regionCode="US" />
      </ListContainer>
      <Nav></Nav>
    </Container>
  );
};

export default Home;

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

const GoToBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`;

const GoToBox = styled.div`
  width: 40%;
  background-color: white;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: black;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
  border: 2px solid #e0e1e1;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: bold;
`;

const Text = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
`;
