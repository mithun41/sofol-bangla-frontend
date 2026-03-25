"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  ArrowRightLeft,
  Copy,
  CheckCircle2,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
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
        const res = await api.get("/accounts/my-network/");
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
    const refCode = network?.counts?.username || "";
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

  // ফিল্টারিং এবং সার্চ লজিক (Full Team এর জন্য)
  const filteredTeam = network?.all_team?.filter((u) => {
    const matchesPos = posFilter === "all" ? true : u.position === posFilter;
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPos && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* 1. Top Bar: Referral Link & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-800">
              Your Referral Code
            </h2>
            <p className="text-slate-500 text-sm">
              Use this code to invite new members to your team.
            </p>
          </div>

          <div className="flex items-center bg-slate-50 rounded-2xl p-2 border border-dashed border-orange-300 w-full md:w-auto min-w-[200px]">
            <span className="flex-1 text-center font-mono font-black text-lg text-[#FF620A] tracking-widest px-4">
              {network?.counts?.username}
            </span>
            <button
              onClick={copyRefCode}
              className="flex items-center gap-2 bg-[#FF620A] text-white px-4 py-2 rounded-xl hover:bg-[#e55609] transition-all shadow-lg active:scale-95"
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              <span className="text-sm font-bold">
                {copied ? "Copied!" : "Copy Code"} 
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
              {network?.counts?.total_referrals}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Binary Tree Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-blue-500 flex justify-between items-center">
          <div>
            <p className="text-blue-500 text-xs font-bold uppercase">
              Left Team Strength
            </p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {network?.counts?.total_left} Members
            </h3>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-medium">New Points</p>
            <p className="text-lg font-bold text-blue-600">
              {network?.counts?.left_count}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-green-500 flex justify-between items-center">
          <div>
            <p className="text-green-500 text-xs font-bold uppercase">
              Right Team Strength
            </p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">
              {network?.counts?.total_right} Members
            </h3>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-medium">New Points</p>
            <p className="text-lg font-bold text-green-600">
              {network?.counts?.right_count}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Network Tabs */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === "referrals" ? "bg-white shadow-sm text-[#FF620A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <UserCheck size={18} />
            Direct Referrals
          </button>
          <button
            onClick={() => setActiveTab("all_team")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === "all_team" ? "bg-white shadow-sm text-[#FF620A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <ArrowRightLeft size={18} />
            Full Team Network
          </button>
        </div>

        <div className="p-6">
          {activeTab === "referrals" ? (
            /* Referral Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[11px] uppercase tracking-widest border-b">
                    <th className="pb-4 font-bold">Member info</th>
                    <th className="pb-4 font-bold">Username</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 text-right font-bold">Joined Date</th>
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
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                          {user.role}
                        </div>
                      </td>
                      <td className="py-4 text-slate-600 font-medium">
                        @{user.username}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.status === "active" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-400 text-xs font-medium">
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
              {network?.referrals.length === 0 && (
                <p className="text-center py-10 text-slate-400 italic">
                  No direct referrals yet.
                </p>
              )}
            </div>
          ) : (
            /* All Team / Downline Filtered View */
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search downline member..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
                  {["all", "left", "right"].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosFilter(pos)}
                      className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${posFilter === pos ? "bg-white text-[#FF620A] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Downline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeam?.length > 0 ? (
                  filteredTeam.map((u) => (
                    <div
                      key={u.id}
                      className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all relative overflow-hidden"
                    >
                      {/* Side Indicator */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${u.position === "left" ? "bg-blue-500" : "bg-green-500"}`}
                      />

                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-[#FF620A] transition-colors font-bold">
                          {u.username.substring(0, 1).toUpperCase()}
                        </div>
                        <div
                          className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase ${u.position === "left" ? "text-blue-500 border-blue-50" : "text-green-500 border-green-50"}`}
                        >
                          {u.position}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 truncate">
                          @{u.username}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tight">
                          <span className="font-bold">Upline:</span>{" "}
                          {u.placement_under_username || "N/A"}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <div
                          className={`text-[10px] font-bold uppercase ${u.status === "active" ? "text-green-500" : "text-amber-500"}`}
                        >
                          ● {u.status}
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium">
                          LVL: {u.star_level} ★
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-3">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Search size={32} />
                    </div>
                    <p className="text-slate-400 font-medium italic">
                      No downline members found in this side.
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
