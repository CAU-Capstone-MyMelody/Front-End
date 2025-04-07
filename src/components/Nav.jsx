import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useNavContext } from "../apis/NavContext";

const Nav = () => {
  // 사실상 setActiveNav 호출이 불필요 NavContext에서 url이 이동하면 자동으로 실행되기에
  const { activeNav, setActiveNav } = useNavContext(); // 상태 및 setter 가져오기
  const navigate = useNavigate();
  const storedActiveNav = localStorage.getItem("activeNav");

  const handleNavClick = (index, path) => {
    // setActiveNav(index);
    navigate(path);
    console.log(activeNav);
  };

  return (
    <Container>
      <IconList>
        <IconButton onClick={() => handleNavClick(0, "/")}>
          <img
            src={activeNav === 0 ? "/icon/HomeFill.png" : "/icon/HomeBlank.png"}
            alt="Home"
          />
          <span>홈</span>
        </IconButton>
        <IconButton onClick={() => handleNavClick(2, "/analyze")}>
          <img
            src={activeNav === 1 ? "/icon/MicFill.png" : "/icon/MicBlank.png"}
            alt="Search"
          />
          <span>분석</span>
        </IconButton>
        <IconButton onClick={() => handleNavClick(1, "/chart")}>
          <img
            src={
              activeNav === 2 ? "/icon/ChartFill.png" : "/icon/ChartBlank.png"
            }
            alt="Find"
          />
          <span>차트</span>
        </IconButton>
        <IconButton onClick={() => handleNavClick(3, "/mypage")}>
          <img
            src={activeNav === 3 ? "/icon/UserFill.png" : "/icon/UserBlank.png"}
            alt="User"
          />
          <span>마이</span>
        </IconButton>
      </IconList>
    </Container>
  );
};

export default Nav;

const Container = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 600px;
  max-height: 50px;
  // height: 8vh; // 네비게이션 바의 높이를 화면 비율에 맞춰 설정 (전체 화면의 10%)
  height: 50px; // 네비게이션 바의 높이를 화면 비율에 맞춰 설정 (전체 화면의 10%)
  border-top: 1px solid #282828;

  background-color: #090909;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 600px) {
    height: calc(
      var(--vh, 1vh) * 8
    ); // 작은 화면에서는 화면 비율에 맞게 높이 설정 전체 높이의 &%
  }

  z-index: 10000;
`;

const IconList = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const IconBox = styled.div``;

const IconButton = styled.button`
  // flex: 1;
  // padding: 0.5rem; // 위아래로 패딩 추가하여 클릭 가능한 영역을 확장
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;

  padding: 0;

  span {
    font-size: 0.6rem;
    color: white;
  }
  img {
    width: 1.2rem;
    margin-bottom: 0.2rem;
  }

  @media (max-width: 600px) {
    img {
      width: 1rem;
    }
  }

  &:hover {
    background-color: rgb(53, 53, 53); // 마우스 호버 시 배경색을 살짝 변경
    border-radius: 10%;
  }
`;
