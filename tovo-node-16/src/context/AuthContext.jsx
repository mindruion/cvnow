import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "../utils/auth";

const AuthContext = createContext({
  accessToken: "",
  refreshToken: "",
  user: null,
  isAuthenticated: false,
  initializing: true,
  authLoading: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  signInWithTokens: () => ({ success: false }),
});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [refreshToken, setRefreshTokenState] = useState(() =>
    getRefreshToken()
  );
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setInitializing(false);
  }, []);

  const persistTokens = useCallback(({ access, refresh }) => {
    setTokens({ access, refresh });
    setAccessTokenState(access || "");
    setRefreshTokenState(refresh || "");
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setAccessTokenState("");
    setRefreshTokenState("");
    setUser(null);
  }, []);

  const login = useCallback(
    async (payload) => {
      setAuthLoading(true);
      try {
        const { data } = await api.post("/api/auth/login", payload);
        const access = data?.access || data?.token || "";
        if (!access) {
          throw new Error("Access token not provided by the server.");
        }
        const refresh = data?.refresh || "";
        persistTokens({ access, refresh });
        setUser(data?.user || null);
        return { success: true, data };
      } catch (error) {
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to complete the request.";
        return { success: false, message };
      } finally {
        setAuthLoading(false);
      }
    },
    [persistTokens]
  );

  const signup = useCallback(async (payload) => {
    setAuthLoading(true);
    try {
      const { data } = await api.post("/api/auth/signup", payload);
      return { success: true, data };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to complete the request.";
      return { success: false, message, data: error.response?.data };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signInWithTokens = useCallback(
    ({ access, refresh }) => {
      if (!access) {
        return {
          success: false,
          message: "Access token is required to sign in.",
        };
      }
      persistTokens({ access, refresh });
      return { success: true };
    },
    [persistTokens]
  );

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken),
      initializing,
      authLoading,
      login,
      signup,
      logout,
      signInWithTokens,
      setUser,
    }),
    [
      accessToken,
      refreshToken,
      user,
      initializing,
      authLoading,
      login,
      signup,
      logout,
      signInWithTokens,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
