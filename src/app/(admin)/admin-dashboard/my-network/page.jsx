"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  ArrowRightLeft,
  Copy,
  CheckCircle2,
  Search,
  UserPlus,
  Filter,
} from "lucide-react";
import api from "@/services/api";

const MyNetwork = () => {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("referrals"); // referrals or all_team
  const [posFilter, setPosFilter] = useState("all"); // all, left, right
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const res = await api.get("accounts/my-network/");
        setNetwork(res.data);
      } catch (err) {
        console.error("Failed to load network data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworkData();
  }, []);

  const copyRefCode = () => {
    const refCode = network?.summary?.username || "";
    if (!refCode) return;

    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF620A]"></div>
      </div>
    );

  // ফিল্টারিং লজিক: referrals অ্যারে থেকেই সব মেম্বার ফিল্টার হচ্ছে
  const filteredTeam = network?.referrals?.filter((u) => {
    const matchesPos = posFilter === "all" ? true : u.position === posFilter;
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPos && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-center md:justify-start">
              <UserPlus className="text-[#FF620A]" size={20} />
              Referral Code
            </h2>
            <p className="text-slate-500 text-sm">
              Invite members to grow your network.
            </p>
          </div>

          <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-dashed border-orange-300 w-full md:w-auto min-w-[200px]">
            <span className="flex-1 text-center font-mono font-black text-lg text-[#FF620A] tracking-widest px-4">
              {network?.summary?.username}
            </span>
            <button
              onClick={copyRefCode}
              className="flex items-center gap-2 bg-[#FF620A] text-white px-4 py-2 rounded-xl hover:bg-[#e55609] transition-all shadow-lg active:scale-95"
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              <span className="text-sm font-bold">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-2xl text-[#FF620A]">
            <Users size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Direct Referrals
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {network?.summary?.total_referrals}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Team Strength Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-blue-500 flex justify-between items-center group hover:bg-blue-50/30 transition-colors">
          <div>
            <p className="text-blue-600 text-xs font-black uppercase tracking-wider">
              Left Team
            </p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {network?.summary?.total_left}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              Total Members
            </p>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black mb-2 uppercase">
              Active: {network?.summary?.active_left}
            </div>
            <p className="text-xs font-bold text-slate-400">
              Strength Indicator
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-green-500 flex justify-between items-center group hover:bg-green-50/30 transition-colors">
          <div>
            <p className="text-green-600 text-xs font-black uppercase tracking-wider">
              Right Team
            </p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {network?.summary?.total_right}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              Total Members
            </p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black mb-2 uppercase">
              Active: {network?.summary?.active_right}
            </div>
            <p className="text-xs font-bold text-slate-400">
              Strength Indicator
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Content Tabs */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === "referrals" ? "bg-white shadow-sm text-[#FF620A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <UserCheck size={18} /> Direct List
          </button>
          <button
            onClick={() => setActiveTab("all_team")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === "all_team" ? "bg-white shadow-sm text-[#FF620A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <ArrowRightLeft size={18} /> Full Team Network
          </button>
        </div>

        <div className="p-6">
          {activeTab === "referrals" ? (
            /* --- Table Design for Direct Referrals --- */
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] uppercase tracking-widest border-b">
                    <th className="pb-4 font-bold">Member Name</th>
                    <th className="pb-4 font-bold">Username</th>
                    <th className="pb-4 font-bold">Position</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 text-right font-bold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {network?.referrals.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4">
                        <div className="font-bold text-slate-700">
                          {user.name || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {user.role}
                        </div>
                      </td>
                      <td className="py-4 text-slate-600 font-medium italic">
                        @{user.username}
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${user.position === "left" ? "text-blue-500 border-blue-100 bg-blue-50" : "text-green-500 border-green-100 bg-green-50"}`}
                        >
                          {user.position}
                        </span>
                      </td>
                      <td className="py-4">
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${user.status === "active" ? "text-green-500" : "text-red-500"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                          />
                          {user.status}
                        </div>
                      </td>
                      <td className="py-4 text-right text-slate-400 text-xs font-bold">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* --- Card Design for Full Team with Filters --- */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="relative w-full md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or username..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter
                    size={16}
                    className="text-slate-400 hidden md:block"
                  />
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
                    {["all", "left", "right"].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosFilter(pos)}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${posFilter === pos ? "bg-[#FF620A] text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeam?.length > 0 ? (
                  filteredTeam.map((u) => (
                    <div
                      key={u.id}
                      className="group bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all relative"
                    >
                      {/* Active/Inactive Status Bar */}
                      <div
                        className={`absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-[9px] font-black uppercase tracking-tighter ${u.status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                      >
                        {u.status}
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black ${u.position === "left" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"}`}
                        >
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                            {u.name || "N/A"}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium italic">
                            @{u.username}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">
                            Side
                          </p>
                          <p
                            className={`text-xs font-black uppercase ${u.position === "left" ? "text-blue-600" : "text-green-600"}`}
                          >
                            {u.position}
                          </p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">
                            Level
                          </p>
                          <p className="text-xs font-black text-slate-700">
                            {u.star_level} ★
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">
                          Upline:
                        </span>
                        <span className="text-[10px] font-black text-slate-600">
                          @{u.placement_under_username || "none"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={40} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold italic tracking-tight">
                      No team members found in this category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyNetwork;
