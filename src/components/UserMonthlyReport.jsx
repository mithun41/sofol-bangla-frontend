"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Calendar, ShoppingBag, Star, TrendingUp } from "lucide-react";

export default function UserMonthlyReport({ stats }) {
  // গ্রাফের জন্য ডাটা তৈরি
  const data = [
    { name: "Spent", value: Number(stats?.monthly_spend || 0) },
    { name: "Points", value: Number(stats?.monthly_points || 0) },
  ];
  const COLORS = ["#10b981", "#f59e0b"];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden mb-8">
      {/* Background Icon Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <ShoppingBag size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Monthly Insights
            </h2>
            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
              <Calendar size={14} /> {stats?.month_name || "This Month"}, 2026
            </p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-md">
            {stats?.total_orders || 0} Orders Placed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <div className="group">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                Total Expenses
              </p>
              <h3 className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">
                ৳{Number(stats?.monthly_spend || 0).toLocaleString()}
              </h3>
            </div>

            <div className="group">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                <Star size={10} className="text-amber-500 fill-amber-500" />{" "}
                Reward Points
              </p>
              <h3 className="text-3xl font-black text-amber-500 group-hover:scale-105 origin-left transition-transform">
                +{stats?.monthly_points || 0} PV
              </h3>
            </div>
          </div>

          <div className="h-[180px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label for Pie */}
            <div className="absolute text-center">
              <TrendingUp size={24} className="text-slate-600 mx-auto" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Account Summary
          </span>
          <button className="text-slate-300 hover:text-white transition-colors underline underline-offset-4">
            View Statement
          </button>
        </div>
      </div>
    </div>
  );
}
