"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LayoutDashboard,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Users,
  Network,
  History,
  ShoppingBag,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function UserLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("accounts/profile/");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user info");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Binary Tree", href: "/dashboard/my-tree", icon: Network },
    { name: "My Network", href: "/dashboard/my-network", icon: Users },
    { name: "Withdrawal", href: "/dashboard/withdraw", icon: Wallet },
    { name: "Bonus Logs", href: "/dashboard/bonus-logs", icon: History },
    { name: "My Orders", href: "/dashboard/user-order", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link href="/" className="flex items-center gap-3 shrink-0">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                  <Image
                    src="/logo.jpeg"
                    alt="Logo"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
                <span className="text-sm font-black tracking-tighter uppercase hidden sm:block">
                  Sofol Bangla
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-[11px] font-bold text-slate-700 leading-none mb-1">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium italic">
                      @{user?.username || "member"}
                    </p>
                  </div>
                  <img
                    src={user?.profile_picture || "/default-avatar.png"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-50"
                    alt="profile"
                  />
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200 z-[70]">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings size={16} /> Account Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all border-t border-slate-50 mt-1"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 max-w-[1600px] w-full mx-auto relative overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky lg:top-16 z-40 h-[calc(100vh-4rem)]
            transition-all duration-300 ease-in-out
            ${isCollapsed ? "w-20" : "w-64"}
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            bg-white border-r border-slate-200 lg:bg-transparent lg:border-none py-6
          `}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-50"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>

          <nav className="flex flex-col gap-1.5 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : ""}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} p-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <item.icon
                        className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`}
                      />
                      {!isCollapsed && (
                        <span className="font-bold text-[14px] whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isActive && isCollapsed && (
                      <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-hidden py-6 px-4 lg:pr-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-full flex flex-col overflow-hidden">
            {/* এখানে overflow-auto রাখা হয়েছে যাতে ভেতরের কন্টেন্ট (যেমন ট্রি) 
              বেশি বড় হলে এই মেইন কার্ডের ভেতরেই স্ক্রল হয়, বর্ডার ভেঙে বাইরে না যায়।
            */}
            <div className="flex-1 p-6 lg:p-8 overflow-auto scrollbar-hide">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
