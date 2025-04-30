import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNavBack from "../components/TopNavBack";

const AnalyzeHistroySection = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("voiceAnalysis")) || [];
    setHistory(saved.reverse()); // 최신순
  }, []);

  const handleClick = (item) => {
    navigate("/analysis-detail", { state: item });
    console.log(item);
  };

  return (
    <Container>
      <TopNavBack></TopNavBack>
      <ListContainer>
        <Section>
          <h2>🎤 음성 분석 히스토리</h2>
          <List>
            {history.map((item) => (
              <ListItem key={item.id} onClick={() => handleClick(item)}>
                <img src="/icon/MicBlank.png" alt="Search" />
                <TextGroup>
                  <Title>{item.title}</Title>
                  <Day>{new Date(item.createdAt).toLocaleString()}</Day>
                </TextGroup>
              </ListItem>
            ))}
          </List>
        </Section>{" "}
      </ListContainer>
      <Nav></Nav>
    </Container>
  );
};

export default AnalyzeHistroySection;

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

const Section = styled.div`
  padding: 1rem;
  color: white;
`;

const List = styled.ul`
  margin-top: 1rem;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  background-color: #1f2122;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #2c2c2c;
  }

  img {
    width: 2rem;
    margin-right: 1rem;
  }
`;

const Title = styled.div`
  font-size: 0.9rem;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Day = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;
