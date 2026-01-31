import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // আপনার জ্যাঙ্গো ব্যাকএন্ড ইউআরএল
  headers: {
    "Content-Type": "application/json",
  },
});

// রিকোয়েস্ট পাঠানোর আগে যদি টোকেন থাকে তবে তা হেডারে সেট করবে
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
