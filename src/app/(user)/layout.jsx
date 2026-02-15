"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  LayoutDashboard,
  Wallet,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  Users,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";

export default function UserLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
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
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "My Tree", href: "/dashboard/my-tree", icon: TrendingUp },
    { name: "Withdraw", href: "/dashboard/withdraw", icon: Wallet },
    { name: "Bonus Logs", href: "/dashboard/bonus-logs", icon: Users },
    { name: "My Orders", href: "/dashboard/user-order", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Apnar logout logic ekhane hobe (e.g., cookie remove, token delete)
    console.log("Logging out...");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  PORTAL<span className="text-indigo-600">.</span>
                </span>
              </Link>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-700 leading-none mb-1">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      @{user?.username || "member"}
                    </p>
                  </div>
                  <div className="relative">
                    <img
                      src={user?.profile_picture || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                      alt="profile"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 mb-2 sm:hidden">
                      <p className="text-sm font-bold text-slate-800">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{user?.username}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-40
              w-64 lg:col-span-3
              transform lg:transform-none transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              bg-white lg:bg-transparent border-r lg:border-none
            `}
          >
            <div className="h-full flex flex-col pt-20 lg:pt-0">
              <nav className="space-y-1.5 px-4 lg:px-0">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 relative group ${
                          isActive
                            ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                            : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <item.icon
                            className={`w-5 h-5 ${
                              isActive
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          />
                          <span className="font-semibold text-[14px]">
                            {item.name}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                        )}
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Promo Card */}
              <div className="mt-8 px-4 lg:px-0">
                <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">
                      Support 24/7
                    </p>
                    <p className="text-sm font-medium mb-4">
                      Having trouble with your tree?
                    </p>
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold transition-all">
                      Get Help Now
                    </button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 min-h-[calc(100vh-12rem)]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <footer className="mt-auto py-8 border-t border-slate-200 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 text-center sm:flex sm:justify-between items-center text-slate-400 text-sm">
          <p>© 2024 Portal Dashboard. Professional Solution.</p>
          <div className="flex gap-6 justify-center mt-4 sm:mt-0 font-medium">
            <a href="#" className="hover:text-slate-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
