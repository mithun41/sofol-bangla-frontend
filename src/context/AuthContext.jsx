"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      const userData = res.data;
      setUser(userData);

      // কুকিতে রোল আপডেট করুন (মিডলওয়্যারের জন্য)
      Cookies.set("role", userData.role, { expires: 7 });

      // গুরুত্বপূর্ণ: যদি এডমিন ভুল করে /dashboard এ থাকে, তাকে সরিয়ে দিন
      if (
        userData.role === "admin" &&
        window.location.pathname === "/dashboard"
      ) {
        router.replace("/admin-dashboard");
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // AuthContext.jsx এর login ফাংশনের ভেতর
  const login = async (credentials) => {
    try {
      const res = await api.post("accounts/login/", credentials);
      const { access, refresh, role } = res.data;

      // টোকেন এবং রোল কুকিতে সেট করা (Middleware এর জন্য এটিই সবথেকে জরুরি)
      Cookies.set("token", access, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      await fetchProfile();

      // সরাসরি রিডাইরেক্ট
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/dashboard");
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: "Login failed" };
    }
  };
  console.log(user);
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // কুকি রিমুভ করার সময় পাথ স্পেসিফাই করা ভালো
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });

    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
