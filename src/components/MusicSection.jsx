import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getPopularMusicByRegion } from "../apis/youtubeapi";
import { useNavigate } from "react-router-dom";

const MusicSection = ({ title, regionCode }) => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularMusic = async () => {
      const results = await getPopularMusicByRegion(regionCode, 10);
      setVideos(results);
    };

    fetchPopularMusic();
  }, [regionCode]);

  return (
    <SectionContainer>
      <SectionTitle>{title}</SectionTitle>
      <Slider>
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            onClick={() =>
              navigate(`/video/${video.id}`, { state: { from: "home" } })
            }
          >
            <Thumbnail src={video.snippet.thumbnails.medium.url} />
            <Title>{video.snippet.title}</Title>
          </VideoCard>
        ))}
      </Slider>
    </SectionContainer>
  );
};

export default MusicSection;

const SectionContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
`;

const Slider = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 5px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(150, 150, 150);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(150, 150, 150, 0.1);
  }
`;

const VideoCard = styled.div`
  min-width: 180px;
  background: #1b1b1b;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
`;

const Thumbnail = styled.img`
  width: 100%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const Title = styled.div`
  padding: 8px;
  font-size: 0.85rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
