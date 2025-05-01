const STORAGE_KEY = "recent_searches";

export const getRecentSearches = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addRecentSearch = (query) => {
  let searches = getRecentSearches();
  searches = [query, ...searches.filter((q) => q !== query)]; // 중복 제거
  if (searches.length > 5) searches = searches.slice(0, 5); // 최대 5개
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
};
