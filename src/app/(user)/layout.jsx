"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function UserLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "My Tree", href: "/dashboard/my-tree", icon: TrendingUp },
    { name: "Withdraw", href: "/dashboard/withdraw", icon: Wallet },
    { name: "Bonus-Logs", href: "/dashboard/bonus-logs", icon: Users },
    { name: "my-orders", href: "/dashboard/user-order", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-slate-600" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-600" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  PORTAL
                </span>
              </div>
            </div>

            {/* Right: User Info + Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Info - Hidden on small screens */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-700">
                  {user?.name || "Loading..."}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {user?.username || "Member"}
                </span>
              </div>

              {/* Profile Picture */}
              <div className="relative group">
                <img
                  src={user?.profile_picture || "/default-avatar.png"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-slate-200 group-hover:border-indigo-400 transition-all shadow-sm"
                  alt="profile"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-40
              w-64 lg:w-auto lg:col-span-3
              transform lg:transform-none transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              pt-16 lg:pt-0
            `}
          >
            <div className="h-full lg:h-auto bg-white lg:bg-transparent p-4 lg:p-0 space-y-6 overflow-y-auto">
              {/* Navigation */}
              <div className="bg-white lg:p-3 rounded-2xl shadow-sm border border-slate-100">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-50 to-indigo-50/50 text-indigo-600 shadow-sm"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={`w-5 h-5 ${
                                isActive
                                  ? "text-indigo-600"
                                  : "text-slate-400 group-hover:text-slate-600"
                              }`}
                            />
                            <span className="font-semibold text-sm">
                              {item.name}
                            </span>
                          </div>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User Stats Card - Mobile Only */}
              <div className="lg:hidden bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user?.profile_picture || "/default-avatar.png"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    alt="profile"
                  />
                  <div>
                    <p className="font-bold text-sm">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-xs text-slate-300">
                      @{user?.username || "member"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">
                      Ref Code
                    </p>
                    <p className="font-mono font-bold text-xs">
                      {user?.reff_id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">
                      Placement
                    </p>
                    <p className="font-mono font-bold text-xs">
                      {user?.placement_id || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-indigo-100 text-xs font-bold uppercase mb-1 tracking-wide">
                    Need Help?
                  </p>
                  <p className="text-sm font-medium mb-4 leading-relaxed">
                    Contact our 24/7 support team
                  </p>
                  <button className="bg-white text-indigo-600 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                    Contact Support
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="min-h-[calc(100vh-12rem)]">{children}</div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2024 Portal. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
