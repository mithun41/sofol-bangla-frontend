"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllProducts } from "@/services/productService";
import { toast, Toaster } from "react-hot-toast"; // ✅ Toaster ইম্পোর্ট
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
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  BanIcon,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Notification States
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("admin_theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Fetch Low Stock Data
  const fetchNotifications = async () => {
    try {
      const res = await getAllProducts();
      const allProducts = Array.isArray(res.data) ? res.data : res.data.results;
      const lowStock = allProducts.filter((p) => Number(p.stock ?? 0) < 5);
      setLowStockProducts(lowStock);
    } catch (err) {
      console.error("Notif Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      { name: "POS (Sales)", href: "/admin-dashboard/pos", Icon: ShoppingCart }, // ✅ POS লিঙ্ক অ্যাড করা হয়েছে
      {
        name: "Manage Users",
        href: "/admin-dashboard/manage-users",
        Icon: Users,
      },
      {
        name: "Manage Products",
        href: "/admin-dashboard/products",
        Icon: Package,
      },
      { name: "Manage Orders", href: "/admin-dashboard/orders", Icon: Package },
      { name: "Income Reports", href: "/admin-dashboard/income-report", Icon: Package },
      { name: "Categories", href: "/admin-dashboard/categories", Icon: Layers },
      {
        name: "Binary Tree",
        href: "/admin-dashboard/admin-tree",
        Icon: Network,
      },
      {
        name: "My Network",
        href: "/admin-dashboard/my-network",
        Icon: Network,
      },
      { name: "Bonus Logs", href: "/admin-dashboard/bonus-logs", Icon: Wallet },
      {
        name: "Withdrawals",
        href: "/admin-dashboard/withdrawls",
        Icon: Wallet,
      },
      { name: "Banner", href: "/admin-dashboard/banner", Icon: BanIcon },
    ],
    [],
  );

  const pageTitle = useMemo(() => {
    const clean =
      pathname?.split("/").filter(Boolean).slice(-1)[0] || "Dashboard";
    return clean.replaceAll("-", " ");
  }, [pathname]);

  const isActive = (href) =>
    href === "/admin-dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] text-slate-800 dark:text-slate-100 font-sans">
      {/* ✅ Global Toaster: এখন থেকে সব পেজে টোস্ট কাজ করবে */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? "#1e293b" : "#fff",
            color: darkMode ? "#fff" : "#1e293b",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "bold",
          },
        }}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0f1419] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-72"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-20 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            {!collapsed && (
              <span className="text-sm font-black tracking-tighter dark:text-white uppercase">
                Sofol Bangla
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          <div className="space-y-1">
            {menuItems.map(({ name, href, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"} ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={20} />
                  {!collapsed && (
                    <span className="font-bold text-sm">{name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profile / Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
            <div
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 grid place-items-center text-white font-black text-xs">
                {getInitials(user?.name)}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-black truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[9px] font-black uppercase text-slate-500">
                    Administrator
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full py-2 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
            >
              <LogOut size={14} /> {!collapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-72"}`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1419]/80 backdrop-blur-xl">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition"
              >
                {collapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                  {pageTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              >
                {darkMode ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-slate-600" />
                )}
              </button>

              {/* Notification System */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                >
                  <Bell
                    size={20}
                    className={
                      lowStockProducts.length > 0
                        ? "text-rose-500 animate-pulse"
                        : "text-slate-600 dark:text-slate-300"
                    }
                  />
                  {lowStockProducts.length > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-rose-600 text-[9px] text-white font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0f1419]">
                      {lowStockProducts.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0f1419] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2rem] z-50 overflow-hidden ring-4 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b dark:border-slate-800 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Inventory Alerts
                      </h3>
                      <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                        {lowStockProducts.length}
                      </span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                      {lowStockProducts.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm font-bold">
                          All products are healthy! ✨
                        </div>
                      ) : (
                        lowStockProducts.map((p) => (
                          <Link
                            key={p.id}
                            href="/admin-dashboard/products"
                            onClick={() => setIsNotifOpen(false)}
                            className="p-4 border-b dark:border-slate-800 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <img
                              src={p.image}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                              alt=""
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-rose-500 font-black uppercase mt-1">
                                Stock: {p.stock} left
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <Link
                      href="/admin-dashboard/products"
                      className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-blue-600 bg-slate-50 dark:bg-slate-800/30"
                    >
                      View All Inventory
                    </Link>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right leading-none">
                  <p className="text-sm font-black dark:text-white">
                    {user?.name || "Admin"}
                  </p>
                  <span className="text-[9px] font-black uppercase text-emerald-500">
                    Online
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center text-xs font-black">
                  {getInitials(user?.name)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
