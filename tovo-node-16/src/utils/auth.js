const ACCESS_TOKEN_KEY = "awesome_resume_access";
const REFRESH_TOKEN_KEY = "awesome_resume_refresh";

let accessTokenCache = "";
let refreshTokenCache = "";

const readStorage = (key) => {
  try {
    return localStorage.getItem(key) || "";
  } catch (error) {
    return "";
  }
};

const writeStorage = (key, value) => {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    // localStorage might be unavailable (private mode, SSR, etc.)
  }
};

export const getAccessToken = () => {
  if (!accessTokenCache) {
    accessTokenCache = readStorage(ACCESS_TOKEN_KEY);
  }
  return accessTokenCache;
};

export const getRefreshToken = () => {
  if (!refreshTokenCache) {
    refreshTokenCache = readStorage(REFRESH_TOKEN_KEY);
  }
  return refreshTokenCache;
};

export const setAccessToken = (token) => {
  accessTokenCache = token || "";
  writeStorage(ACCESS_TOKEN_KEY, accessTokenCache);
};

export const setRefreshToken = (token) => {
  refreshTokenCache = token || "";
  writeStorage(REFRESH_TOKEN_KEY, refreshTokenCache);
};

export const setTokens = ({ access, refresh }) => {
  setAccessToken(access || "");
  setRefreshToken(refresh || "");
};

export const clearTokens = () => {
  accessTokenCache = "";
  refreshTokenCache = "";
  writeStorage(ACCESS_TOKEN_KEY, "");
  writeStorage(REFRESH_TOKEN_KEY, "");
};

// Backwards compatible helpers
export const getToken = () => getAccessToken();
export const setToken = (token) => setAccessToken(token);
export const clearToken = () => clearTokens();
export const hasToken = () => Boolean(getAccessToken());
