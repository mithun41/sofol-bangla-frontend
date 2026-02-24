"use client";
import React from "react";
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  Wallet,
  PieChart,
  Star,
  Plane,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function AdminAnalytics({ reportData }) {
  // ১. ব্যাকএন্ডের নতুন API স্ট্রাকচার অনুযায়ী ডাটা ধরা
  const summary = reportData?.summary || {};
  const funds = reportData?.funds || {};

  // ২. ফান্ড কার্ডের জন্য ম্যাপিং (তোর Python API এর কীগুলোর সাথে মিল রেখে)
  const fundList = [
    {
      label: "Referral Fund",
      value: funds.referral,
      icon: <Users size={18} />,
      color: "bg-blue-500",
    },
    {
      label: "Matching Fund",
      value: funds.matching,
      icon: <PieChart size={18} />,
      color: "bg-purple-500",
    },
    {
      label: "Rank Reward",
      value: funds.rank_reward,
      icon: <Star size={18} />,
      color: "bg-orange-500",
    },
    {
      label: "Tour Fund",
      value: funds.tour,
      icon: <Plane size={18} />,
      color: "bg-emerald-500",
    },
    {
      label: "Leadership Fund",
      value: funds.leadership,
      icon: <ShieldCheck size={18} />,
      color: "bg-indigo-500",
    },
    {
      label: "Company Fund",
      value: funds.company,
      icon: <Building2 size={18} />,
      color: "bg-slate-800",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={summary.total_users || 0}
          icon={<Users />}
          trend="Total Community"
          color="bg-blue-600"
        />
        <StatCard
          title="Active Members"
          value={summary.active_users || 0}
          icon={<Activity />}
          trend="Paid Members"
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending Payouts"
          value={summary.pending_withdrawals || 0}
          icon={<Clock />}
          trend="Needs Approval"
          color="bg-orange-500"
        />
        <StatCard
          title="Net Profit"
          value={`৳${Number(summary.net_profit || 0).toLocaleString()}`}
          icon={<TrendingUp />}
          trend="Current Month"
          color="bg-indigo-600"
        />
      </div>

      {/* Global Fund Balances Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
          <Wallet className="text-emerald-500" size={24} /> Global Fund Balances
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {fundList.map((fund, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div
                className={`${fund.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform`}
              >
                {fund.icon}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-1">
                {fund.label}
              </p>
              <h3 className="text-lg font-black text-slate-800">
                ৳{Number(fund.value || 0).toLocaleString()}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        <p className="text-[10px] text-emerald-500 font-bold mt-1 italic">
          {trend}
        </p>
      </div>
    </div>
  );
}
