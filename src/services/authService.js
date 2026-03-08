import api from "./api";

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

  // ২. লগইন ফাংশন (টোকেন এবং ইউজার ডাটা লোকাল স্টোরেজে সেভ করবে)
  login: async (credentials) => {
    try {
      const response = await api.post("accounts/login/", credentials);
      const { access, refresh, userinfo } = response.data;

      if (access) {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh_token", refresh);
        // userinfo অবজেক্টটি সেভ করা হচ্ছে যাতে ড্যাশবোর্ডে নাম/ছবি দেখানো যায়
        localStorage.setItem("user", JSON.stringify(userinfo));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Login Failed");
    }
  },

  // ৩. প্রোফাইল ডাটা ফেচ করা (লেটেস্ট ব্যালেন্স ও স্ট্যাটাসের জন্য)
  getProfile: async () => {
    try {
      const response = await api.get("accounts/profile/");
      // প্রোফাইল আপডেট হলে লোকাল স্টোরেজের ডাটাও আপডেট করে রাখা ভালো
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Profile Fetch Failed");
    }
  },

  // ৪. প্রোফাইল আপডেট (ইউজার নিজে নাম বা ছবি চেঞ্জ করলে)
  updateProfile: async (profileData) => {
    try {
      // যদি ছবি থাকে তবে FormData ব্যবহার করতে হতে পারে, নাহলে নরমাল অবজেক্ট
      const response = await api.patch("accounts/profile/", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Profile Update Failed");
    }
  },

  // ৫. পাসওয়ার্ড পরিবর্তনের ফাংশন
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

  logout: async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("accounts/logout/", { refresh });
      }
    } catch (error) {
      console.warn("Server-side logout failed, clearing local storage anyway.");
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  },

  // ৭. অ্যাডমিন কর্তৃক ইউজার আপডেট
  updateUserByAdmin: async (userId, userData) => {
    try {
      const response = await api.patch(`accounts/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Admin Update Failed");
    }
  },
};
