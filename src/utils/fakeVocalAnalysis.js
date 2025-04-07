export const fakeVocalAnalysis = async (audioBlob) => {
  // 임시로 2초 딜레이
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    pitchSimilarity: 78,
    rhythmScore: 85,
    timingAccuracy: "중상",
    comments: "전반적으로 피치 안정성은 양호하나, 후반 리듬이 살짝 늦습니다.",
  };
};
