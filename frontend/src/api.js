import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("user");
  if (raw) {
    const user = JSON.parse(raw);
    if (user?.token) config.headers.Authorization = `Token ${user.token}`;
  }
  return config;
});

export default api;
