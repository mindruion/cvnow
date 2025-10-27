import axios from "axios";
import { getAccessToken } from "../utils/auth";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
