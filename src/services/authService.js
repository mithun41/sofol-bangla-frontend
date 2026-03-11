import api from "./api";
import axios from "axios";

// আপনার মেইন প্রজেক্টের URL স্ট্রাকচার অনুযায়ী বেস ইউআরএল
const FULL_API_URL = "https://mithun41.pythonanywhere.com/api/accounts/";

export const authService = {
  // ১. ইউজার রেজিস্ট্রেশন
  register: async (userData) => {
    try {
      const response = await api.post("accounts/register/", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Registration Failed");
    }
  },

  // ২. লগইন ফাংশন
  login: async (credentials) => {
    try {
      const response = await api.post("accounts/login/", credentials);
      const { access, refresh, userinfo } = response.data;

      if (access) {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user", JSON.stringify(userinfo));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Login Failed");
    }
  },

  // ৩. প্রোফাইল ডাটা ফেচ করা
  getProfile: async () => {
    try {
      const response = await api.get("accounts/profile/");
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Profile Fetch Failed");
    }
  },

  // ৯. অ্যাডমিন ইউজার আপডেট করবে (Referrer, Placement, Position)
  updateUserByAdmin: async (userId, payload) => {
    try {
      // তোর urls.py অনুযায়ী সঠিক এন্ডপয়েন্ট হলো: accounts/users/{id}/
      const response = await api.patch(`accounts/users/${userId}/`, payload);
      return response.data;
    } catch (error) {
      // এরর মেসেজটা কনসোলে দেখার জন্য
      console.error("Backend Error Details:", error.response?.data);
      throw error.response?.data || new Error("Admin Update Failed");
    }
  },

  // ৫. পাসওয়ার্ড পরিবর্তনের ফাংশন (লগইন থাকা অবস্থায়)
  changePassword: async (passwordData) => {
    try {
      const response = await api.post(
        "accounts/change-password/",
        passwordData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Password Change Failed");
    }
  },

  // ৮. ওটিপি রিকোয়েস্ট (সরাসরি axios ব্যবহার করা হয়েছে ইন্টারসেপ্টর এড়াতে)
  // services/authService.js

  requestOTP: async ({ username, phone }) => {
    // এখানে অবজেক্ট ডিস্ট্রাকচারিং করা হয়েছে
    try {
      const response = await axios.post(`${FULL_API_URL}forgot-password/`, {
        username, // ব্যাকএন্ডের জন্য নতুন ফিল্ড
        phone,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "OTP Request Failed" };
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await axios.post(
        "https://mithun41.pythonanywhere.com/api/accounts/reset-password/",
        {
          username: resetData.username, // এটিও মাস্ট লাগবে
          phone: resetData.phone,
          otp: resetData.otp,
          new_password: resetData.new_password,
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Reset Failed" };
    }
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("accounts/logout/", { refresh });
      }
    } catch (error) {
      console.warn("Logout failed on server");
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  },
};
