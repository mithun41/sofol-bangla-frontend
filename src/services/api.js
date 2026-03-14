import axios from "axios";

const api = axios.create({
  // এখন থেকে এই লিংকটা .env ফাইল থেকে অটোমেটিক আসবে
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
