import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VocalResultPage = () => {
  const { state } = useLocation();
  const { result, videoId } = state || {};

  if (!result) return <div>결과가 없습니다.</div>;

  return (
    <div>
      <h2>분석 결과</h2>
      <p>🎯 피치 유사도: {result.pitchSimilarity}%</p>
      <p>🥁 리듬 점수: {result.rhythmScore}</p>
      <p>⏱ 타이밍 정확도: {result.timingAccuracy}</p>
      <p>💬 코멘트: {result.comments}</p>
    </div>
  );
};

export default VocalResultPage;
