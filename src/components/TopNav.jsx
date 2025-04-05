import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const TopNav = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  return (
    <Container>
      {!isSearchOpen ? (
        <>
          <AppTitle>
            <img src="/img/Logo.png" alt="Logo" />
            <MainTitle>MyMelody</MainTitle>
          </AppTitle>
          <img
            src="/icon/SearchIcon.png"
            alt="Search"
            onClick={() => setIsSearchOpen(true)}
            style={{ cursor: "pointer" }}
          />
        </>
      ) : (
        <SearchContainer>
          <CloseButton onClick={() => setIsSearchOpen(false)}>
            <img
              src="/icon/BackArrowIcon.png"
              alt="Close"
              style={{ cursor: "pointer" }}
            />
          </CloseButton>
          <SearchBox>
            <SearchInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
              placeholder="노래, 아티스트 검색"
            />
            {searchText && (
              <CancelButton onClick={() => setSearchText("")}>
                <img
                  src="/icon/CloseIcon.png"
                  alt="Clear"
                  style={{ cursor: "pointer" }}
                />
              </CancelButton>
            )}
          </SearchBox>
        </SearchContainer>
      )}
    </Container>
  );
};

export default TopNav;

const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 600px;
  height: 50px;
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

const SearchBox = styled.div`
  background: #282828;
  border-radius: 15px;
  width: 85%;
  margin-right: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const SearchInput = styled.input`
  color: white;
  height: 30px;
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
  margin: 0 10px;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
`;
