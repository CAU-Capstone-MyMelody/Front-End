import React from "react";
import styled from "styled-components";
import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import { useNavigate } from "react-router-dom";

const Mypage = () => {
  const navigate = useNavigate();

  // 임시 더미 데이터 (최근 3개만 보여줌)
  const coachingHistory =
    JSON.parse(localStorage.getItem("coachingHistory")) || [];
  const voiceAnalysis = JSON.parse(localStorage.getItem("voiceAnalysis")) || [];

  const recentCoaching = coachingHistory.slice(-3).reverse();
  const recentVoice = voiceAnalysis.slice(-3).reverse();

  const handleClick = (item) => {
    navigate("/history-detail", { state: item });
  };

  const handleClick2 = (item) => {
    navigate("/analysis-detail", { state: item });
  };

  return (
    <Container>
      <TopNav />
      <ListContainer>
        <Section>
          <SectionHeader>
            <SectionTitle>👤 내 정보</SectionTitle>
          </SectionHeader>
          <UserInfo>
            <p>닉네임: 마이멜로디-쿠로미</p>
            <p>가입일: 2024-01-01</p>
            <p>분석 횟수: {coachingHistory.length}</p>
          </UserInfo>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>🎤 코칭 히스토리</SectionTitle>
            <MoreButton onClick={() => navigate("/coaching-history")}>
              더보기
            </MoreButton>
          </SectionHeader>
          <ItemList>
            {recentCoaching.map((item) => (
              <Item key={item.id} onClick={() => handleClick(item)}>
                <Thumbnail
                  src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                  alt="thumbnail"
                />
                <TextGroup>
                  <Title>{item.title}</Title>
                  <Day>{new Date(item.createdAt).toLocaleString()}</Day>
                </TextGroup>
              </Item>
            ))}
          </ItemList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>📊 음성 분석</SectionTitle>
            <MoreButton onClick={() => navigate("/voice-analysis")}>
              더보기
            </MoreButton>
          </SectionHeader>
          <ItemList>
            {recentVoice.map((item) => (
              <Item key={item.id} onClick={() => handleClick2(item)}>
                <RecordIcon src="/icon/MicBlank.png" alt="Search" />
                <TextGroup>
                  <Title>{item.title}</Title>
                  <Day>{new Date(item.createdAt).toLocaleString()}</Day>
                </TextGroup>
              </Item>
            ))}
          </ItemList>
        </Section>
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default Mypage;

// 💅 스타일
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
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 1.2rem;
`;

const MoreButton = styled.button`
  background-color: transparent;
  color: #9b7ed8;
  border: none;
  font-size: 0.8rem;
  font-weight: 550;
  cursor: pointer;
`;

const UserInfo = styled.div`
  color: #ddd;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Item = styled.div`
  background-color: #1f2122;
  border-radius: 8px;
  padding: 0.8rem;
  color: #ccc;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Thumbnail = styled.img`
  width: 120px;
  height: 68px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 0.8rem;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Title = styled.p`
  color: #fff;
  font-weight: bold;
  font-size: 0.95rem;
  margin: 0;
`;

const Day = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const RecordIcon = styled.img`
  width: 2rem;
  margin-right: 1rem;
`;
