"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import Link from "next/link";

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("accounts/profile/");
        setUser(res.data);
      } catch (err) {
        console.error("Dashboard data fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-slate-600">
        Loading Dashboard...
      </div>
    );

  const stats = [
    {
      title: "Current Balance",
      value: `$ ${user.balance || "0.00"}`,
      icon: "💰",
      color: "bg-blue-600",
    },
    {
      title: "Total Points",
      value: user.points || 0,
      icon: "⭐",
      color: "bg-purple-600",
    },
    {
      title: "Left Members",
      value: user.left_count || 0,
      icon: "👥",
      color: "bg-indigo-500",
    },
    {
      title: "Right Members",
      value: user.right_count || 0,
      icon: "👥",
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {user.name || user.username}
          </h1>

          {/* Current Rank Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                user.star_level > 0
                  ? "bg-yellow-400 text-yellow-950 border border-yellow-500"
                  : "bg-slate-200 text-slate-500 border border-slate-300"
              }`}
            >
              {user.star_level > 0 ? `${user.star_level} STAR RANK` : "NO RANK"}
            </span>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
          <span>
            Current Matching:{" "}
            <span className="text-indigo-600">
              {Math.min(user.left_count, user.right_count)}
            </span>
          </span>
          {user.star_level < 4 && (
            <>
              <span className="text-slate-300">|</span>
              <span>
                Need{" "}
                <span className="text-rose-500">
                  {15 - Math.min(user.left_count, user.right_count)}
                </span>{" "}
                more for <span className="text-amber-500">4 Star</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg text-lg`}
            >
              {item.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              {item.title}
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {item.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-lg mb-6 text-slate-800">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/withdraw"
              className="p-5 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all text-center group border border-transparent hover:border-indigo-100"
            >
              <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">
                💸
              </span>
              <span className="text-sm font-bold text-slate-700">Withdraw</span>
            </Link>
            <Link
              href="/dashboard/bonus-logs"
              className="p-5 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all text-center group border border-transparent hover:border-indigo-100"
            >
              <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">
                📊
              </span>
              <span className="text-sm font-bold text-slate-700">Earnings</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-5 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all text-center group border border-transparent hover:border-indigo-100"
            >
              <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">
                👤
              </span>
              <span className="text-sm font-bold text-slate-700">Profile</span>
            </Link>
          </div>
        </div>

        {/* Identity Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <h4 className="font-bold text-lg mb-6 opacity-90 relative z-10">
            Your Identity Codes
          </h4>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase font-black text-slate-500 mb-1">
                Referral ID
              </p>
              <p className="text-xl font-mono font-bold tracking-widest text-indigo-400">
                {user.reff_id || "N/A"}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] uppercase font-black text-slate-500 mb-1">
                Placement ID
              </p>
              <p className="text-xl font-mono font-bold tracking-widest text-emerald-400">
                {user.placement_id || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(user.reff_id);
              alert("Referral ID Copied!");
            }}
            className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            Copy Referral Code
          </button>
        </div>
      </div>
    </div>
  );
}
