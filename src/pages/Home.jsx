import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import { useNavContext } from "../apis/NavContext";
import MusicSection from "../components/MusicSection";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { setActiveNav } = useNavContext();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveNav(0);
  }, []);

  return (
    <Container>
      <TopNav></TopNav>
      <ListContainer>
        <GoToBoxContainer>
          <GoToBox onClick={() => navigate("/coach")}>
            <Title>🎤노래 코칭</Title>
            <Text>바로가기</Text>
            <Description>
              마이멜로디에서 제공하는 간단한 노래 코칭 서비스입니다.
              <br /> 원하는 파트를 골라 짧게 따라 부르면, 음정 분석을 통해
              간단한 피드백을 받을 수 있습니다.
              <br />
              제공되는 노래는 점진적으로 업데이트될 예정입니다.
              <br /> <br />
              <strong>
                <span>
                  실시간 녹음 혹은 미리 준비된 음성 파일을 업로드하고 해당
                  녹음된 파트의 원곡 시간대를 작성해주세요
                </span>
              </strong>
            </Description>
          </GoToBox>
        </GoToBoxContainer>
        {/* <h2>국가별 인기 차트</h2> */}
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
  justify-content: center;
  margin: 1.5rem 0;
`;

const GoToBox = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: #1e1e1e; /* 어두운 배경 */
  border-radius: 16px;
  padding: 1.5rem;
  color: #ffffff;
  position: relative;
  cursor: pointer;
  border: 1px solid #333;
  box-sizing: border-box;
  transition: background-color 0.2s;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: #c9c9c9;
  line-height: 1.6;
  margin-bottom: 2rem;

  span {
    color: white;
  }
`;

const Text = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  font-size: 0.85rem;
  color: #9b7ed8;
  background-color: #2f2f2f;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
  transition: background-color 0.2s;

  ${GoToBox}:hover & {
    background-color: #3b3b3b;
  }
`;
