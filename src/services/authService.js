import api from "./api";

export const authService = {
  // রেজিস্ট্রেশন ফাংশন
  register: async (userData) => {
    try {
      const response = await api.post("accounts/register/", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network Error");
    }
  },

  // লগইন ফাংশন
  login: async (credentials) => {
    try {
      const response = await api.post("accounts/login/", credentials);
      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Login Failed");
    }
  },

  // প্রোফাইল দেখার ফাংশন
  getProfile: async () => {
    try {
      const response = await api.get("accounts/profile/");
      return response.data;
    } catch (error) {
      throw error.response
        ? error.response.data
        : new Error("Profile Fetch Failed");
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const response = await api.patch(`accounts/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Update Failed");
    }
  },
};
