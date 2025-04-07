import React from "react";
import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Analyze = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <TopNav />
      <ListContainer>
        <ExplanationText>
          <h2>음성 분석 및 음악 추천</h2>
          <p>
            여기에서 여러분의 음성을 녹음하고, 음성의 피치를 분석하여 그에 맞는
            음악을 추천해드립니다. 분석된 결과는 여러분의 음성의 피치(음정) 및
            스펙트럼 특성에 기반하여 제공됩니다.
          </p>
          <p>
            Librosa를 통해 피치(음정)를 분석하고, ChatGPT를 활용하여 음악을
            추천해 드립니다.
          </p>
        </ExplanationText>

        <CoachBtn
          onClick={() => {
            navigate("/genre");
          }}
        >
          <StartRecordingButton>분석</StartRecordingButton>
        </CoachBtn>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default Analyze;

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

const CoachBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StartRecordingButton = styled.button`
  background: #9b7ed8;
  color: #fff; /* 텍스트 색상 */
  border: 2px solid #9b7ed8; /* 테두리 */
  border-radius: 50px;
  padding: 0.7rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 550;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); /* 그림자 효과 */
  transition: all 0.3s ease-in-out;

  &:focus {
    outline: none;
  }
`;
