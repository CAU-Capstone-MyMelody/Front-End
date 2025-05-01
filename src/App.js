import logo from "./logo.svg";
import "./App.css";
import styled from "styled-components";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { NavProvider } from "./apis/NavContext";
import Analyze from "./pages/Analyze";
import Chart from "./pages/Chart";
import Mypage from "./pages/Mypage";
import SearchResultPage from "./pages/SearchResultPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import VocalRecordPage from "./pages/VocalRecordPage";
import PitchAnalysisPage from "./pages/PitchAnalysisPage";
import GenreSelection from "./pages/GenreSelection ";
import SingleRecordPage from "./pages/SingleRecordPage ";
import SinglePitchAnalysisPage from "./pages/SinglePitchAnalysisPage ";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import CoachingHistorySection from "./pages/CoachingHistorySection ";
import AnalyzeHistroySection from "./pages/AnalyzeHistorySection";
import AnalyzeDetailPage from "./pages/AnalyzeDetailPage";
import GuideLinePage from "./pages/GuideLinePage";
import MergeKaraokePage from "./pages/MergeKaraokePage";

function App() {
  return (
    <NavProvider>
      <AppDom>
        <Routes>
          <Route path="/" element={<Home></Home>}></Route>
          <Route path="/analyze" element={<Analyze></Analyze>}></Route>
          <Route
            path="/guideline"
            element={<GuideLinePage></GuideLinePage>}
          ></Route>
          <Route
            path="/genre"
            element={<GenreSelection></GenreSelection>}
          ></Route>
          <Route
            path="/singlerecord"
            element={<SingleRecordPage></SingleRecordPage>}
          ></Route>
          <Route
            path="/singlepitchanalysis"
            element={<SinglePitchAnalysisPage />}
          />
          <Route path="/chart" element={<Chart></Chart>}></Route>
          <Route path="/mypage" element={<Mypage></Mypage>}></Route>
          <Route
            path="/searchpage"
            element={<SearchResultPage></SearchResultPage>}
          ></Route>
          <Route path="/video/:videoId" element={<VideoDetailPage />} />
          <Route path="/vocalrecord" element={<VocalRecordPage />} />
          <Route path="/mergekaraoke" element={<MergeKaraokePage />} />
          <Route path="/pitchanalysis" element={<PitchAnalysisPage />} />
          <Route
            path="/coaching-history"
            element={<CoachingHistorySection />}
          />
          <Route path="/history-detail" element={<HistoryDetailPage />} />
          <Route path="/voice-analysis" element={<AnalyzeHistroySection />} />
          <Route path="/analysis-detail" element={<AnalyzeDetailPage />} />
        </Routes>
      </AppDom>
    </NavProvider>
  );
}

export default App;

const AppDom = styled.div`
  width: min(100vw, 600px); // 화면 너비에 맞추면서 최대 600px로 제한
  height: 100vh; // 웹 뷰
  margin: 0 auto;

  justify-content: center;
  align-items: center;
  position: relative;

  @media (max-width: 600px) {
    width: 100vw;
    height: calc(var(--vh, 1vh) * 100);
  }
`;

// view height 변수 설정
window.addEventListener("resize", () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});
