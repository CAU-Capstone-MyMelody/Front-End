import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // 추가
import { searchYouTube } from "../apis/youtubeapi";
import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import styled, { keyframes } from "styled-components";

const SearchResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 추가
  const query = new URLSearchParams(location.search).get("query");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        setLoading(true);
        const data = await searchYouTube(query, 30);
        setResults(data);
        setLoading(false);
        console.log(data);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <Container>
      <TopNav />
      <ListContainer>
        {loading ? (
          <LoaderWrapper>
            <Spinner />
            <LoadingText>검색 중입니다...</LoadingText>
          </LoaderWrapper>
        ) : results.length > 0 ? (
          results.map((video) => (
            <VideoItem
              key={video.id}
              onClick={() =>
                navigate(
                  `/video/${video.id}?query=${encodeURIComponent(query)}`
                )
              }
            >
              <Thumbnail
                src={video.snippet.thumbnails.medium.url}
                alt="썸네일"
              />
              <VideoInfo>
                <Title>{video.snippet.title}</Title>
                <Channel>{video.snippet.channelTitle}</Channel>
                <ExtraInfo>
                  조회수 {Number(video.statistics.viewCount).toLocaleString()}회
                  ・ {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </ExtraInfo>
              </VideoInfo>
            </VideoItem>
          ))
        ) : (
          <NoResults>검색 결과가 없습니다.</NoResults>
        )}
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default SearchResultPage;

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

const VideoItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1c1c1c;
    border-radius: 10px;
  }
`;
const Thumbnail = styled.img`
  width: 150px;
  height: 100px;
  object-fit: cover;
  margin-right: 0.5rem;
  border-radius: 10px;
`;

const VideoInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 0.2rem;
`;

const Channel = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const ExtraInfo = styled.div`
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 0.3rem;
`;

const NoResults = styled.div`
  color: #888;
  font-size: 1rem;
  margin-top: 1rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid #ccc;
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
`;

const LoadingText = styled.div`
  margin-top: 0.8rem;
  font-size: 0.9rem;
  color: #aaa;
`;
