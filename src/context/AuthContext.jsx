"use client";
// ✅ FINAL VERSION — cookie-based auth for middleware compatibility
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
      return userData;
    } catch (err) {
      logout();
      return null;
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

  const login = async (credentials) => {
    try {
      const res = await api.post("accounts/login/", credentials);
      const { access, refresh, role } = res.data;

      // Cookie ও localStorage এ token সেট করো
      Cookies.set("token", access, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Profile fetch করো — redirect এখানে করবে না
      await fetchProfile();

      // role return করো — redirect login page থেকে handle হবে
      return { success: true, role };
    } catch (err) {
      return { success: false, error: "Username বা Password ভুল হয়েছে" };
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
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
