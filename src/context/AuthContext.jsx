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

      Cookies.set("role", userData.role, { expires: 7 });

      // রিডাইরেক্ট সেফটি চেক
      const path = window.location.pathname;

      if (userData.role === "admin" && path === "/dashboard") {
        router.replace("/admin-dashboard");
      }
      // ✅ যদি posAdmin ভুল করে অ্যাডমিন ড্যাশবোর্ডের মেইন পেজে ঢোকে, তাকে POS-এ পাঠান
      else if (
        userData.role === "posAdmin" &&
        window.location.pathname === "/"
      ) {
        router.replace("/pos/pos");
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

      Cookies.set("token", access, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      await fetchProfile();

      // ✅ আপনার রাউট অনুযায়ী রিডাইরেক্ট
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else if (role === "posAdmin") {
        router.push("/pos/pos"); // আপনার দেওয়া রাউট
      } else {
        router.push("/");
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
