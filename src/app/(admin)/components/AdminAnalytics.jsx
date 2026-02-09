"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DollarSign, Gift, Package, TrendingUp } from "lucide-react";

export default function AdminAnalytics({ reportData }) {
  // ১. ভ্যালুগুলোকে Number এ কনভার্ট করে নেওয়া (যাতে undefined থাকলে ০ দেখায়)
  const sales = Number(reportData?.monthly_sales || 0);
  const bonus = Number(reportData?.monthly_bonus || 0);
  const pending = reportData?.pending_orders || 0;
  const month = reportData?.month_name || "Current Month";

  const chartData = [
    { name: "Revenue", value: sales, color: "#10b981" },
    { name: "Bonus", value: bonus, color: "#3b82f6" },
  ];

  return (
    <div className="space-y-8 p-6 bg-slate-50 rounded-[3rem]">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`৳${sales.toLocaleString()}`} // কমা সহ ফরম্যাট (যেমন: ৫,০০০)
          icon={<DollarSign />}
          trend="+12.5%"
          color="bg-emerald-500"
        />
        <StatCard
          title="Points Distributed"
          value={`${bonus} PV`}
          icon={<Gift />}
          trend="Current Month"
          color="bg-blue-600"
        />
        <StatCard
          title="Pending Orders"
          value={pending}
          icon={<Package />}
          trend="Needs Attention"
          color="bg-orange-500"
        />
      </div>

      {/* Sales vs Bonus Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" /> Sales Overview ({month})
          </h3>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
      <div className="flex items-center gap-4">
        <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-800">{value}</h3>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">{trend}</p>
        </div>
      </div>
    </div>
  );
}
