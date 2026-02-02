"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";

// Import the global CSS in your root layout or _app.js:
// import './admin-dashboard.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Manage Users", href: "/manage-users", icon: <Users size={20} /> },
    { name: "Binary Tree", href: "/admin-tree", icon: <Network size={20} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
    { name: "Bonus Logs", href: "/bonus-logs", icon: <Wallet size={20} /> },
    {
      name: "Withdraws",
      href: "/withdrawls",
      icon: <Wallet size={20} />,
    },
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
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
              className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3 mt-2">
              Main Menu
            </p>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  <span className="font-semibold text-sm relative z-10">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                  MD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    Mithun Dev
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Super Admin
                  </p>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 mb-3" />
              <button className="flex items-center gap-2 w-full text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group">
                <LogOut size={16} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-20 bg-white/80 dark:bg-[#0f1419]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 -ml-2"
                >
                  <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                    Pages / {pathname.replace("/", "") || "Dashboard"}
                  </p>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                    Welcome Back, Admin
                  </h1>
                </div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white sm:hidden">
                  Dashboard
                </h1>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3 sm:gap-6">
                {/* Theme Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center hover:scale-105"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center hover:scale-105">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0f1419] shadow-lg">
                    3
                  </span>
                </button>

                {/* Divider (hidden on mobile) */}
                <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700" />

                {/* User Avatar (hidden on mobile in favor of menu button) */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                      Mithun Dev
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                      Super Admin
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform cursor-pointer">
                    MD
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1419] transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
              <p>
                © 2025 <span className="font-semibold">Sofol Bangla</span>. All
                rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Support
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
