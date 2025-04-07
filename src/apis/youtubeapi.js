import axios from "axios";

// const API_KEY = "AIzaSyBhXRLFb1DMWme0tpW2EZAjHrKTiRoPziw";
const API_KEY = "AIzaSyAZiCAmcWUoYY1K1O56nbS-6T_1Me9hyq8"; // 테스트키2

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export const searchYouTube = async (query, maxResults = 30) => {
  try {
    const searchRes = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults,
        order: "viewCount",
        key: API_KEY,
      },
    });
    console.log(searchRes.data.items);

    const videoIds = searchRes.data.items
      .map((item) => item.id.videoId)
      .join(",");

    // 2차 요청: 통계 및 날짜 정보까지 가져오기
    const detailsRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          id: videoIds,
          key: API_KEY,
        },
      }
    );

    return detailsRes.data.items;
  } catch (error) {
    console.error("YouTube API Error:", error);
    return [];
  }
};

export const getVideoDetail = async (videoId) => {
  console.log(videoId);
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: "snippet,statistics",
        id: videoId,
        key: API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0]; // ✅ 첫 번째 비디오만 리턴
    } else {
      console.warn("비디오 정보를 찾을 수 없습니다.");
      return null;
    }
  } catch (error) {
    console.error("getVideoDetail 에러:", error);
    return null;
  }
};

export const getPopularMusicByRegion = async (regionCode, maxResults = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: "snippet,statistics",
        chart: "mostPopular",
        regionCode,
        videoCategoryId: 10, // 음악 카테고리
        maxResults,
        key: API_KEY,
      },
    });

    console.log(response.data.items);

    return response.data.items;
  } catch (error) {
    console.error("지역 인기 음악 불러오기 실패:", error);
    return [];
  }
};

export const getChannelDetail = async (channelId) => {
  const response = await axios.get(`${BASE_URL}/channels`, {
    params: {
      part: "snippet",
      id: channelId,
      key: API_KEY,
    },
  });
  return response.data.items[0];
};
