import axios from "axios";

const api = axios.create({
  //baseURL: "https://designation-browse-phrases-seats.trycloudflare.com/api",
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (config.data instanceof FormData) {
    config.headers.setContentType("multipart/form-data");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
