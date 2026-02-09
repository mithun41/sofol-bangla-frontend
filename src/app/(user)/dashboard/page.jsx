"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import Link from "next/link";
import reportService from "@/services/reportService"; // নতুন সার্ভিস
import { Loader2 } from "lucide-react";
import UserMonthlyReport from "@/components/UserMonthlyReport";

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null); // গ্রাফের ডাটার জন্য
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ১. প্রোফাইল ডাটা এবং ২. রিপোর্ট ডাটা একসাথে ফেচ করা
        const [profileRes, reportData] = await Promise.all([
          api.get("accounts/profile/"),
          reportService.getUserMonthlyReport(),
        ]);

        setUser(profileRes.data);
        setStats(reportData);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="font-bold text-slate-600">Loading Dashboard...</p>
      </div>
    );

  const cardStats = [
    {
      title: "Current Balance",
      value: `৳ ${user.balance || "0.00"}`,
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
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {user.name || user.username}
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                user.star_level > 0
                  ? "bg-yellow-400 text-yellow-950"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {user.star_level > 0 ? `${user.star_level} STAR RANK` : "NO RANK"}
            </span>
          </div>
        </div>
        {/* Progress Info */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-2">
          <span>
            Matching:{" "}
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
        {cardStats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
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
            <QuickLink
              href="/dashboard/withdraw"
              emoji="💸"
              label="Withdraw"
              color="hover:bg-indigo-50"
            />
            <QuickLink
              href="/dashboard/bonus-logs"
              emoji="📊"
              label="Earnings"
              color="hover:bg-emerald-50"
            />
            <QuickLink
              href="/dashboard/profile"
              emoji="👤"
              label="Profile"
              color="hover:bg-blue-50"
            />
          </div>
        </div>

        {/* Identity Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <h4 className="font-bold text-lg mb-6 opacity-90">Identity Codes</h4>
          <div className="space-y-6">
            <IDSection
              label="Referral ID"
              value={user.reff_id}
              color="text-indigo-400"
            />
            <IDSection
              label="Placement ID"
              value={user.placement_id}
              color="text-emerald-400"
            />
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(user.reff_id);
              alert("Copied!");
            }}
            className="mt-8 w-full bg-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            Copy Referral Code
          </button>
        </div>
      </div>
      {/* গ্রাফ রিপোর্ট সেকশন - এখানে গ্রাফটা বসালাম */}
      {/* <div className="mb-8">{stats && <UserMonthlyReport stats={stats} />}</div> */}
    </div>
  );
}

// ছোট হেল্পার কম্পোনেন্ট যাতে কোড ক্লিন থাকে
function QuickLink({ href, emoji, label, color }) {
  return (
    <Link
      href={href}
      className={`p-5 bg-slate-50 rounded-2xl transition-all text-center group border border-transparent hover:border-indigo-100 ${color}`}
    >
      <span className="block text-3xl mb-2 group-hover:scale-110 transition-transform">
        {emoji}
      </span>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </Link>
  );
}

function IDSection({ label, value, color }) {
  return (
    <div className="pt-4 first:pt-0 border-t first:border-0 border-slate-800">
      <p className="text-[10px] uppercase font-black text-slate-500 mb-1">
        {label}
      </p>
      <p className={`text-xl font-mono font-bold tracking-widest ${color}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}
