import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// nav 클릭된 순서 저장(이미지 변경을 위해서)

// Context 객체 생성
const NavContext = createContext();

// NavProvider는 children을 포함한 컴포넌트에서 네비게이션 상태를 사용할 수 있도록 Context를 제공하는 컴포넌트입니다
export const NavProvider = ({ children }) => {
  // URL 경로 추적
  const location = useLocation();
  // 활성화된 네비게이션 항목의 인덱스 저장
  const [activeNav, setActiveNav] = useState(0); // 로컬 스토리지에서 값을 가져오거나 기본값 0

  useEffect(() => {
    const pathname = location;

    const pathMap = {
      "/": 0,
      "/find": 1,
      "/lost": 2,
      "/analyze": 3,
      "/userpage": 4,
      "/registeitem": 4,
      "/chargepoint": 4,
      "/message": 4,
      "/messageDetail": 4,
    };

    setActiveNav(pathMap[location.pathname] ?? 0);
  }, [location]);

  return (
    <NavContext.Provider value={{ activeNav, setActiveNav }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNavContext = () => {
  return useContext(NavContext);
};
