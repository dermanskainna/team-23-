import axios from "axios";

const api = axios.create({
  baseURL: "https://varta-7z8t.onrender.com/api",
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
