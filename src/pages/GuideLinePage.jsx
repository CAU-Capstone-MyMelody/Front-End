import React from "react";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const GuideLinePage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Title>음역대 테스트 가이드</Title>
        <h2>음역대 가이드 라인 음정</h2>
        <audio controls src="record/test.mp3" />
        <GuideImg src="/img/guideline.png" alt="" />
        <Section>
          <h2>음역대 테스트</h2>
          <p>가장 낮은 음정부터 발음을 하며 점점 음을 내립니다.</p>
          <p>
            위의 사진은 예시일뿐 사진의 계이름 음정과 맞추실 필요는 없습니다.
          </p>
          <p>음이 끊기지 계속 이어져 가야됩니다.</p>
          <p>마지막 최고음을 2초 유지한 뒤 녹음을 종료해주세요</p>
          <TipNotice>
            최대 <span>30초</span> 내외로 녹음을 해주세요
          </TipNotice>
          <Tip>💡노래의 한 소절을 불러서 제공해주셔도 됩니다</Tip>
        </Section>

        <CoachBtn>
          <StartTestButton onClick={() => navigate("/genre")}>
            장르 선택
          </StartTestButton>
        </CoachBtn>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default GuideLinePage;

// Styled Components
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
  color: #ccc;
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

  audio {
    width: 100%;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const GuideImg = styled.img`
  width: 80%;
  border-radius: 16px;
  margin: 1rem auto;
  display: block;
`;

const Section = styled.div`
  background-color: #1c1c1e;
  border-radius: 16px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  color: #e2e2e2;

  h2 {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
  }

  p {
    margin-bottom: 0.4rem;
    font-size: 0.95rem;
  }
`;

const Tip = styled.p`
  font-size: 0.9rem;
  color: #9b7ed8;
  margin-top: 0.5rem;
`;
const TipNotice = styled.p`
  span {
    color: red;
    font-weight: bold;
  }
  margin-top: 0.5rem;
`;

const CoachBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StartTestButton = styled.button`
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
