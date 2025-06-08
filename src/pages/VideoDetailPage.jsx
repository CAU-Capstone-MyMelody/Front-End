import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChannelDetail, getVideoDetail } from "../apis/youtubeapi";
import Nav from "../components/Nav";
import styled from "styled-components";
import TopNavBack from "../components/TopNavBack";

const VideoDetailPage = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // state 추가
  const [channel, setChannel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getVideoDetail(videoId);
      setVideo(data);
      const channelData = await getChannelDetail(data.snippet.channelId);
      setChannel(channelData);
      setLoading(false);
    };
    fetchDetail();
  }, [videoId]);

  const handleTagClick = (tag) => {
    navigate(`/searchpage?query=${encodeURIComponent(tag)}`);
  };

  return (
    <Container>
      <TopNavBack />
      <ListContainer>
        <Content>
          {loading || !video ? (
            <LoadingText>불러오는 중...</LoadingText>
          ) : (
            <VideoWrapper>
              <IframeWrapper>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </IframeWrapper>
              <VideoInfo>
                <Title>{video.snippet.title}</Title>
                <ChannelWrapper
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/channel/${video.snippet.channelId}`,
                      "_blank"
                    )
                  }
                >
                  {channel?.snippet?.thumbnails?.default?.url && (
                    <ChannelImg
                      src={channel.snippet.thumbnails.default.url}
                      alt="채널 이미지"
                    />
                  )}
                  <Channel>{video.snippet.channelTitle}</Channel>
                </ChannelWrapper>
                <ExtraInfo>
                  조회수 {Number(video.statistics.viewCount).toLocaleString()}회
                  ・ {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </ExtraInfo>
                {video.snippet.tags && (
                  <Tags>
                    {video.snippet.tags.map((tag, index) => (
                      <Tag key={index} onClick={() => handleTagClick(tag)}>
                        #{tag}
                      </Tag>
                    ))}
                  </Tags>
                )}
              </VideoInfo>
            </VideoWrapper>
          )}
        </Content>
        {/* <CoachBtn onClick={() => navigate(`/vocalrecord?videoId=${videoId}`)}>
          <StartCoachingButton>
            <img src="/icon/MicBlank.png" alt="Search" />
            &nbsp;음정 코칭
          </StartCoachingButton>
        </CoachBtn>
        <CoachBtn onClick={() => navigate(`/mergekaraoke?videoId=${videoId}`)}>
          <StartCoachingButton>
            <img src="/icon/MicBlank.png" alt="Mic" />
            &nbsp;노래 합성하기
          </StartCoachingButton>
        </CoachBtn> */}
      </ListContainer>
      <Nav />
    </Container>
  );
};

export default VideoDetailPage;

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

const Content = styled.div``;

const LoadingText = styled.div`
  color: #aaa;
  font-size: 1rem;
  text-align: center;
  margin-top: 2rem;
`;

const VideoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const IframeWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
`;

const VideoInfo = styled.div`
  color: #fff;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const Channel = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const ExtraInfo = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.3rem;
`;

const Tags = styled.div`
  margin-top: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background-color: #222;
  color: #ccc;
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
`;

const ChannelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-top: 0.5rem;
`;

const ChannelImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

const CoachBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  img {
    width: 1rem;
  }
`;

const StartCoachingButton = styled.div`
  background: #9b7ed8;
  color: #fff; /* 텍스트 색상 */
  border-radius: 15px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 550;
  text-transform: uppercase;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
`;
