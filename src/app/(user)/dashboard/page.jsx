"use client";
import { useState, useEffect, useMemo } from "react"; // useMemo যোগ করা হয়েছে পারফরম্যান্সের জন্য
import api from "@/services/api";
import Link from "next/link";
import reportService from "@/services/reportService";
import {
  Loader2,
  Wallet,
  Users,
  Star,
  TrendingUp,
  Gift,
  Award,
  Crown,
  Zap,
  Sparkles,
} from "lucide-react";
import UserMonthlyReport from "@/components/UserMonthlyReport";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reportData] = await Promise.all([
          reportService.getUserMonthlyReport(),
        ]);
        setStats(reportData);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- ১. Active Matching Logic ---
  // আপনার API রেসপন্স অনুযায়ী যদি active_left/active_right থাকে তবে সেগুলো ব্যবহার করুন। 
  // না থাকলে আপাতত total_left/right এবং isActive চেক করা হচ্ছে।
  const currentMatching = useMemo(() => {
    if (!user) return 0;
    
    // শুধুমাত্র একটিভ ইউজারদের ম্যাচিং কাউন্ট করতে (আপনার ব্যাকএন্ড ডেটা অনুযায়ী নাম পরিবর্তন হতে পারে)
    const activeLeft = user.active_left || 0; 
    const activeRight = user.active_right || 0;
    
    return Math.min(activeLeft, activeRight);
  }, [user]);

  // --- ২. Rank Calculation Logic ---
  const getNextRankInfo = () => {
    const ranks = [
      { level: 'Leader', target: 15, rankId: 1 },
      { level: 'Sales Officer', target: 50, rankId: 2 },
      { level: 'Sr. Sales Officer', target: 200, rankId: 3 },
      { level: "Incharge", target: 500, rankId: 4 },
      { level: "Manager", target: 1200, rankId: 5 },
    ];

    // star_level এর সাথে rankId তুলনা করা হচ্ছে
    const currentRankLevel = parseInt(user?.star_level) || 0;
    const next = ranks.find((r) => r.rankId > currentRankLevel);
    
    if (!next) return null;

    const needed = next.target - currentMatching;

    return {
      star: next.level,
      needed: needed > 0 ? needed : 0,
    };
  };

  const nextRank = getNextRankInfo();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="font-bold text-slate-600">Loading Dashboard...</p>
      </div>
    );

  // --- ৩. UI Data Structures ---
  const mainStats = [
    {
      title: "Total Balance",
      value: `৳ ${user?.balance || "0.00"}`,
      icon: <Wallet size={20} />,
      color: "bg-blue-600",
    },
    {
      title: "Activation PV",
      value: user?.points || 0,
      icon: <Star size={20} />,
      color: "bg-purple-600",
    },
    {
      title: "Active Left", // নাম পরিবর্তন করা হয়েছে ক্লারিটির জন্য
      value: user?.active_left || 0,
      icon: <Users size={20} />,
      color: "bg-indigo-500",
    },
    {
      title: "Active Right",
      value: user?.active_right || 0,
      icon: <Users size={20} />,
      color: "bg-teal-500",
    },
  ];

  const bonusStats = [
    {
      title: "Referral Bonus",
      value: `৳ ${user?.referral_bonus || "0.00"}`,
      icon: <Gift size={18} />,
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Matching Bonus",
      value: `৳ ${user?.matching_bonus || "0.00"}`,
      icon: <TrendingUp size={18} />,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Leadership Bonus",
      value: `৳ ${user?.leadership_bonus || "0.00"}`,
      icon: <Crown size={18} />,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Rank Reward",
      value: `৳ ${user?.rank_reward_bonus || "0.00"}`,
      icon: <Award size={18} />,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const offerStats = [
    {
      title: "Your Offer",
      value: `৳ ${user?.total_offer_earned || "0.00"}`,
      icon: <Sparkles size={18} />,
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Lifetime Shopping PV",
      value: `${user?.lifetime_offer_points || "0"} PV`,
      icon: <Zap size={18} />,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {user?.name || user?.username}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
              user?.star_level > 0 ? "bg-yellow-400 text-yellow-950" : "bg-slate-200 text-slate-500"
            }`}
          >
            {user?.star_level > 0 ? `${user.star_level} STAR RANK` : "NO RANK"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-2">
          <span>
            Active Matching: <span className="text-indigo-600">{currentMatching}</span>
          </span>
          {nextRank && (
            <>
              <span className="text-slate-300">|</span>
              <span>
                Need <span className="text-rose-500">{nextRank.needed}</span> more for{" "}
                <span className="text-amber-500">{nextRank.star}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]"
          >
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
              {item.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.title}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Offer Rewards Section */}
      <div className="mb-8 bg-gradient-to-r from-rose-50 to-amber-50 p-6 rounded-[2.5rem] border border-white shadow-inner">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 px-2 text-sm uppercase tracking-widest">
          <Sparkles size={16} className="text-rose-500" /> Special Offer Rewards
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offerStats.map((item, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.bgColor} ${item.textColor} rounded-2xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">{item.title}</p>
                  <h3 className={`text-xl font-black ${item.textColor}`}>{item.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Earnings Section */}
      <div className="mb-8">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 px-2 text-sm uppercase tracking-widest">
          Bonus Earnings Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bonusStats.map((item, index) => (
            <div key={index} className={`${item.bgColor} p-4 rounded-2xl border border-white/50 shadow-sm`}>
              <div className={`${item.textColor} mb-2`}>{item.icon}</div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">{item.title}</p>
              <h3 className={`text-lg font-bold ${item.textColor}`}>{item.value}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}