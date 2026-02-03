"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // আপনার AuthContext ইমপোর্ট করুন
import {
  LayoutDashboard,
  Users,
  Network,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  Search,
  Moon,
  Sun,
  Wallet,
  Package,
  Layers,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth(); // AuthContext থেকে ডাটা নিন
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ইউজার নেমের আদ্যক্ষর (Initials) বের করার জন্য
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "AD";
  };

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Manage Users", href: "/manage-users", icon: <Users size={20} /> },
    {
      name: "Manage Products",
      href: "/products",
      icon: <Package size={20} />,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: <Layers size={20} />,
    },
    { name: "Binary Tree", href: "/admin-tree", icon: <Network size={20} /> },
    { name: "Bonus Logs", href: "/bonus-logs", icon: <Wallet size={20} /> },
    { name: "Withdrawals", href: "/withdrawls", icon: <Wallet size={20} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0e1a] transition-colors duration-300">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f1419] border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo Section */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg italic">SB</span>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white block leading-none">
                  SOFOL BANGLA
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">
              Main Menu
            </p>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {item.icon}
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card (Dynamic Data) */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getInitials(user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium capitalize">
                    {user?.role || "Super Admin"}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
          <header className="h-20 bg-white/80 dark:bg-[#0f1419]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
            <div className="h-full px-4 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-slate-600"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Pages / {pathname.replace("/", "")}
                  </p>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                    Dashboard Overview
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  {darkMode ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} />
                  )}
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                </button>

                <div className="hidden sm:flex items-center gap-3 ml-2">
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                      Online
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {getInitials(user?.name)}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
