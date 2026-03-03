"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * ✅ Professional Admin Layout
 * - Responsive sidebar (mobile drawer + overlay)
 * - Collapsible sidebar (desktop)
 * - Scrollable navigation with hidden scrollbar
 * - Active route highlighting
 * - Sticky topbar
 * - Dark mode (saved in localStorage)
 * - Logo from public/logo.jpeg (Next Image)
 */

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin_theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  // Persist theme to localStorage + add/remove html class for tailwind dark
  useEffect(() => {
    localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "AD";

  const menuItems = useMemo(
    () => [
      { name: "Dashboard", href: "/admin-dashboard", Icon: LayoutDashboard },
      { name: "Manage Users", href: "/manage-users", Icon: Users },
      { name: "Manage Products", href: "/products", Icon: Package },
      { name: "Manage Orders", href: "/orders", Icon: Package },
      { name: "Categories", href: "/categories", Icon: Layers },
      { name: "Binary Tree", href: "/admin-tree", Icon: Network },
      { name: "Bonus Logs", href: "/bonus-logs", Icon: Wallet },
      { name: "Withdrawals", href: "/withdrawls", Icon: Wallet },
      { name: "Settings", href: "/settings", Icon: Settings },
    ],
    [],
  );

  const pageTitle = useMemo(() => {
    const clean =
      pathname?.split("/").filter(Boolean).slice(-1)[0] || "Dashboard";
    return clean.replaceAll("-", " ");
  }, [pathname]);

  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "bg-white dark:bg-[#0f1419]",
          "border-r border-slate-200 dark:border-slate-800",
          "transition-all duration-300 ease-out",
          "flex flex-col",
          // width
          collapsed ? "w-20" : "w-72",
          // mobile slide
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Brand / Logo */}
        <div className="h-20 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm group-hover:shadow-md transition">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                  SOFOL BANGLA
                </div>
                <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                  Visit Home <ExternalLink size={10} />
                </div>
              </div>
            )}
          </Link>

          {/* Close (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {!collapsed && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">
              Main Menu
            </p>
          )}

          <div className="space-y-1">
            {menuItems.map(({ name, href, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all",
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60",
                    collapsed ? "justify-center" : "",
                  ].join(" ")}
                  title={collapsed ? name : undefined}
                >
                  <span
                    className={[
                      "grid place-items-center",
                      active
                        ? "text-white"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200",
                    ].join(" ")}
                  >
                    <Icon size={20} />
                  </span>

                  {!collapsed && (
                    <span className="font-bold text-sm">{name}</span>
                  )}

                  {/* active indicator */}
                  {active && !collapsed && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/90" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profile / Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-3">
            <div
              className={[
                "flex items-center",
                collapsed ? "justify-center" : "gap-3",
              ].join(" ")}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/20"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 grid place-items-center text-white font-black shadow-md">
                  {getInitials(user?.name)}
                </div>
              )}

              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {user?.name || "Admin"}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {user?.role || "Administrator"}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className={[
                "mt-3 w-full rounded-2xl border text-xs font-black uppercase tracking-wider",
                "py-2.5 transition-all",
                "text-red-600 border-red-100 bg-white hover:bg-red-50",
                "dark:bg-slate-900 dark:border-red-900/30 dark:hover:bg-red-900/10",
                collapsed ? "px-0" : "px-3",
                "flex items-center justify-center gap-2",
              ].join(" ")}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut size={14} />
              {!collapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className={[
          "min-h-screen flex flex-col",
          collapsed ? "md:ml-20" : "md:ml-72",
        ].join(" ")}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1419]/80 backdrop-blur-xl">
          <div className="h-full px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>

              {/* Desktop collapse toggle */}
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1419] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                aria-label="Toggle sidebar"
              >
                {collapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
                <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                  {collapsed ? "Expand" : "Collapse"}
                </span>
              </button>

              <div className="hidden sm:block">
                <h2 className="text-lg font-black capitalize text-slate-900 dark:text-white">
                  {pageTitle}
                </h2>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Admin Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme toggle */}
              <button
                onClick={() => setDarkMode((v) => !v)}
                className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon
                    size={20}
                    className="text-slate-600 dark:text-slate-300"
                  />
                )}
              </button>

              {/* Notifications */}
              <button
                className="relative p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                aria-label="Notifications"
              >
                <Bell
                  size={20}
                  className="text-slate-600 dark:text-slate-300"
                />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0f1419]" />
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

              {/* User chip */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-black text-slate-900 dark:text-white leading-none">
                    {user?.name || "Admin"}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                    Active Now
                  </div>
                </div>

                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Admin"
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 grid place-items-center text-white font-black text-sm shadow-md">
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

/* ✅ Optional: add this global CSS once (for scrollbar-hide)
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
*/
