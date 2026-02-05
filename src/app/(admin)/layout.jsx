"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Network,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  Wallet,
  Package,
  Layers,
  Home,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
    { name: "Manage Products", href: "/products", icon: <Package size={20} /> },
    { name: "Manage Orders", href: "/orders", icon: <Package size={20} /> },
    { name: "Categories", href: "/categories", icon: <Layers size={20} /> },
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
          className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f1419] border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Logo Section - Click to Home */}
          <Link
            href="/"
            className="h-20 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-lg italic">SB</span>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white block leading-none">
                  SOFOL BANGLA
                </span>
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                  Visit Home <ExternalLink size={10} />
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setSidebarOpen(false);
              }}
              className="md:hidden text-slate-400"
            >
              <X size={24} />
            </button>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4 scrollbar-hide">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"}`}
                >
                  {item.icon}
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Profile Section */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    {user?.role || "Administrator"}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-slate-800 text-red-500 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
          <header className="h-20 bg-white/80 dark:bg-[#0f1419]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8">
            <div className="h-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 bg-slate-100 rounded-lg text-slate-600"
                >
                  <Menu size={20} />
                </button>
                <div className="hidden sm:block">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                    {pathname.split("/").pop()?.replace("-", " ") ||
                      "Dashboard"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-5">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {darkMode ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-slate-600" />
                  )}
                </button>

                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors">
                  <Bell
                    size={20}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1419]" />
                </button>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

                <div className="flex items-center gap-3">
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                      {user?.name}
                    </p>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                      Active Now
                    </span>
                  </div>
                  {user?.image ? (
                    <img
                      src={user.image}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                      alt="Admin"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
