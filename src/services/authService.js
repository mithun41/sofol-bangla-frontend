import api from "./api";

export const authService = {
  // রেজিস্ট্রেশন ফাংশন
  register: async (userData) => {
    try {
      const response = await api.post("accounts/register/", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Registration Failed");
    }
  },

  // লগইন ফাংশন
  login: async (credentials) => {
    try {
      const response = await api.post("accounts/login/", credentials);
      const { access, refresh, ...userData } = response.data;

      if (access) {
        localStorage.setItem("token", access);
        localStorage.setItem("refresh_token", refresh);
        // ডাটা লোকাল স্টোরেজে রাখা হচ্ছে যাতে রিফ্রেশ করলে পাওয়া যায়
        localStorage.setItem("user", JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Login Failed");
    }
  },

  // প্রোফাইল দেখার ফাংশন
  getProfile: async () => {
    try {
      const response = await api.get("accounts/profile/");
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Profile Fetch Failed");
    }
  },

  // ইউজার আপডেট (Admin বা User নিজের জন্য)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.patch(`accounts/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Update Failed");
    }
  },

  // লগআউট ফাংশন (এখান থেকেও হ্যান্ডেল করা ভালো)
  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
};
