import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  const [isFocused, setIsFocused] = useState(false);

  // 쿼리 파라미터로 검색어 유지
  useEffect(() => {
    const query = new URLSearchParams(location.search).get("query");
    const isFromHome = location.state?.from === "home";

    if (query && !isFromHome) {
      setIsSearchOpen(true);
      setSearchText(query);
    } else {
      setIsSearchOpen(false);
      setSearchText("");
    }
  }, [location.search]);

  // 로컬스토리지에서 최근 검색어 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(saved);
  }, []);

  // 포커스 이벤트 핸들러
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    // 딜레이 안 주면 클릭 전에 사라져버림
    setTimeout(() => setIsFocused(false), 150);
  };

  const saveToHistory = (term) => {
    const updated = [term, ...searchHistory.filter((t) => t !== term)].slice(
      0,
      10
    );
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      saveToHistory(trimmed);
      navigate(`/searchpage?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleBack = () => {
    if (location.pathname === "/searchpage") {
      // 검색결과 페이지에서는 뒤로가기
      navigate(-1);
    } else {
      // 홈 화면에서는 그냥 검색창 닫기
      setIsSearchOpen(false);
      setSearchText("");
    }
  };

  const handleDeleteHistory = (term) => {
    const updated = searchHistory.filter((t) => t !== term);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const handleClickHistory = (term) => {
    setSearchText(term);
    saveToHistory(term);
    navigate(`/searchpage?query=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <Container>
        {!isSearchOpen ? (
          <>
            <AppTitle onClick={() => navigate("/")}>
              <img src="/img/Logo.png" alt="Logo" />
              <MainTitle>MyMelody</MainTitle>
            </AppTitle>
            <AppTitle2 onClick={() => setIsSearchOpen(true)}>
              <img
                src="/icon/SearchIcon.png"
                alt="Search"
                style={{ cursor: "pointer" }}
              />
            </AppTitle2>
          </>
        ) : (
          <SearchContainer>
            <CloseButton onClick={handleBack}>
              <img
                src="/icon/BackArrowIcon.png"
                alt="Back"
                style={{ cursor: "pointer" }}
              />
            </CloseButton>
            <SearchLayout>
              <SearchBox>
                <SearchInput
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="노래, 아티스트 검색"
                />

                {searchText && (
                  <CancelButton onClick={() => setSearchText("")}>
                    <img src="/icon/CloseIcon.png" alt="Clear" />
                  </CancelButton>
                )}
              </SearchBox>
              <SearchIconDiv>
                <img
                  src="/icon/SearchIcon.png"
                  alt="Search"
                  onClick={handleSearch}
                  style={{ cursor: "pointer" }}
                />
              </SearchIconDiv>
            </SearchLayout>
          </SearchContainer>
        )}
      </Container>

      {isSearchOpen && isFocused && searchHistory.length > 0 && (
        <HistoryContainer>
          {searchHistory.map((term, idx) => (
            <HistoryItem key={idx}>
              <img src="/icon/HistoryIcon.png" alt="Delete" />
              <Term onClick={() => handleClickHistory(term)}>{term}</Term>
              <DeleteBtn onClick={() => handleDeleteHistory(term)}>
                <img src="/icon/CloseIcon.png" alt="Delete" />
              </DeleteBtn>
            </HistoryItem>
          ))}
        </HistoryContainer>
      )}
    </>
  );
};

export default TopNav;

// 스타일 컴포넌트는 그대로 유지
const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 600px;
  height: 50px;
  border-bottom: 1px solid #282828;
  background-color: #090909;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1rem;
  z-index: 100;

  img {
    width: 1.2rem;
  }

  @media (max-width: 600px) {
    img {
      width: 1rem;
    }
  }
`;

const AppTitle = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const AppTitle2 = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const MainTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const CloseButton = styled.div`
  margin-left: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
`;

const SearchLayout = styled.div`
  background: #282828;
  border-radius: 15px;
  width: 85%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchBox = styled.div`
  background: #282828;
  border-radius: 15px;
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchInput = styled.input`
  color: white;
  height: 30px;
  width: 100%;
  padding: 5px 15px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  outline: none;
  box-sizing: border-box;
  background: transparent;

  &::placeholder {
    color: #8e8e8a;
    font-size: 1rem;
    font-weight: bold;
  }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const SearchIconDiv = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const HistoryContainer = styled.div`
  position: absolute;
  top: 50px;
  background: #222222;
  width: 100%;
  max-width: 600px;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 200px;

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

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px solid #2a2a2a;

  img {
    width: 1.2rem;
  }

  @media (max-width: 600px) {
    img {
      width: 1rem;
    }
  }
`;

const Term = styled.div`
  color: #ccc;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
  margin: 0 1rem;
  &:hover {
    color: white;
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
`;
