"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart2, TrendingUp, Users, Star, ArrowDownCircle,
  Zap, Award, GitBranch, Search, RefreshCw,
  DollarSign, Activity, Wallet, Target,
} from "lucide-react";
import reportService from "@/services/reportService";
import {
  StatCard, SectionHeader, ReportTable, FundBar,
  LoadingSpinner, SkeletonCard, Badge, DateFilter,
} from "./components/ui";
import { getStarTitle } from "@/constants/starTitiles";

// ── Tab config ────────────────────────────────────────────
const TABS = [
  { key: "funds",       label: "Fund Flow",       icon: BarChart2 },
  { key: "matching",    label: "Matching Bonus",   icon: TrendingUp },
  { key: "referral",    label: "Referral Bonus",   icon: GitBranch },
  { key: "leadership",  label: "Leadership Bonus", icon: Award },
  { key: "rank",        label: "Rank Reward",      icon: Star },
  { key: "withdrawals", label: "Withdrawals",      icon: Wallet },
  { key: "activations", label: "Activations",      icon: Zap },
  { key: "stars",       label: "Star Levels",      icon: Target },
  { key: "top",         label: "Top Earners",      icon: DollarSign },
  { key: "monthly",     label: "Monthly",          icon: Activity },
  { key: "chain",       label: "Referral Chain",   icon: Users },
];

const FUND_COLORS = {
  referral_fund:    "blue",
  matching_fund:    "green",
  rank_reward_fund: "purple",
  tour_fund:        "amber",
  leadership_fund:  "orange",
  company_fund:     "slate",
};

export default function IncomeReportPage() {
  const [activeTab, setActiveTab] = useState("funds");
  const [loading, setLoading]     = useState(false);
  const [data, setData]           = useState({});
  const [dates, setDates]         = useState({ from: "", to: "" });
  const [chainUser, setChainUser] = useState("");
  const [chainInput, setChainInput] = useState("");
  const [topType, setTopType]     = useState("overall");
  const [year, setYear]           = useState(new Date().getFullYear());

  const fetchData = useCallback(async (tab) => {
    setLoading(true);
    try {
      const params = {};
      if (dates.from) params.from = dates.from;
      if (dates.to)   params.to   = dates.to;

      let res;
      if (tab === "funds")       res = await reportService.getFundReport(params);
      else if (tab === "matching")   res = await reportService.getMatchingBonus(params);
      else if (tab === "referral")   res = await reportService.getReferralBonus(params);
      else if (tab === "leadership") res = await reportService.getLeadershipBonus(params);
      else if (tab === "rank")       res = await reportService.getRankReward(params);
      else if (tab === "withdrawals")res = await reportService.getWithdrawals(params);
      else if (tab === "activations")res = await reportService.getActivations(params);
      else if (tab === "stars")      res = await reportService.getStarLevels(params);
      else if (tab === "top")        res = await reportService.getTopEarners({ type: topType, limit: 20 });
      else if (tab === "monthly")    res = await reportService.getMonthly({ year });
      else if (tab === "chain" && chainUser) res = await reportService.getReferralChain(chainUser);

      if (res) setData((prev) => ({ ...prev, [tab]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dates, topType, year, chainUser]);

  useEffect(() => {
    if (activeTab !== "chain" || chainUser) {
      fetchData(activeTab);
    }
  }, [activeTab, dates, topType, year, chainUser]);

  const TabButton = ({ tab }) => {
    const Icon = tab.icon;
    const active = activeTab === tab.key;
    return (
      <button
        onClick={() => setActiveTab(tab.key)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Icon size={14} />
        {tab.label}
      </button>
    );
  };

  const d = data[activeTab];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-blue-600" /> Income Reports
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Full financial analytics & MLM breakdown
          </p>
        </div>
        <button
          onClick={() => fetchData(activeTab)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-black uppercase"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => <TabButton key={tab.key} tab={tab} />)}
      </div>

      {/* Date Filter — chain আর monthly তে আলাদা filter */}
      {!["chain", "monthly", "stars", "top", "rank"].includes(activeTab) && (
        <div className="flex items-center gap-4 flex-wrap">
          <DateFilter from={dates.from} to={dates.to} onChange={setDates} />
        </div>
      )}

      {/* Tab Content */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* ══ FUND FLOW ══════════════════════════════════════ */}
            {activeTab === "funds" && d && (
              <div className="space-y-6">
                {/* Grand Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Total Inflow"  value={`৳${d.grand_summary?.total_inflow?.toLocaleString()}`}  icon={TrendingUp} color="green" />
                  <StatCard label="Total Outflow" value={`৳${d.grand_summary?.total_outflow?.toLocaleString()}`} icon={ArrowDownCircle} color="rose" />
                  <StatCard
                    label="Net Balance"
                    value={`৳${d.grand_summary?.net_balance?.toLocaleString()}`}
                    icon={DollarSign}
                    color={d.grand_summary?.net_balance >= 0 ? "blue" : "rose"}
                  />
                </div>

                {/* Fund Bars */}
                <SectionHeader title="Fund Breakdown" subtitle="Per-fund balance, inflow & utilization" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {d.funds?.map((f) => (
                    <FundBar
                      key={f.fund_key}
                      label={f.fund_label}
                      balance={f.current_balance}
                      inflow={f.total_inflow}
                      outflow={f.total_outflow}
                      utilization={f.utilization_pct}
                      color={FUND_COLORS[f.fund_key]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ══ MATCHING BONUS ══════════════════════════════════ */}
            {activeTab === "matching" && d && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Paid"        value={`৳${d.summary?.total_paid?.toLocaleString()}`}          icon={DollarSign} color="green" />
                  <StatCard label="Transactions"      value={d.summary?.total_transactions}                           icon={Activity}   color="blue" />
                  <StatCard label="Avg per Tx"        value={`৳${d.summary?.avg_per_transaction?.toFixed(0)}`}        icon={BarChart2}  color="purple" />
                  <StatCard label="Unique Earners"    value={d.summary?.unique_earners}                               icon={Users}      color="orange" />
                </div>

                <SectionHeader title="Per User Breakdown" subtitle="Who earned how much matching bonus" />
                <ReportTable
                  columns={[
                    { key: "user__username",   label: "Username" },
                    { key: "user__name",        label: "Name" },
                    { key: "user__phone",       label: "Phone" },
                    { key: "total_bonus",       label: "Total Bonus",   render: (r) => `৳${Number(r.total_bonus).toLocaleString()}` },
                    { key: "transaction_count", label: "Transactions" },
                    { key: "user__paid_matches",label: "Paid Pairs" },
                    { key: "last_bonus",        label: "Last Bonus",    render: (r) => r.last_bonus?.slice(0, 10) },
                  ]}
                  rows={d.per_user}
                />
              </div>
            )}

            {/* ══ REFERRAL BONUS ══════════════════════════════════ */}
            {activeTab === "referral" && d && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Paid"      value={`৳${d.summary?.total_paid?.toLocaleString()}`}     icon={DollarSign} color="green" />
                  <StatCard label="Total Referrals" value={d.summary?.total_referrals}                        icon={GitBranch}  color="blue" />
                  <StatCard label="Unique Earners"  value={d.summary?.unique_earners}                         icon={Users}      color="purple" />
                  <StatCard label="Avg per Referral" value={`৳${d.summary?.avg_per_referral?.toFixed(0)}`}   icon={BarChart2}  color="orange" />
                </div>

                <SectionHeader title="Per User Breakdown" />
                <ReportTable
                  columns={[
                    { key: "user__username",        label: "Username" },
                    { key: "user__name",             label: "Name" },
                    { key: "user__phone",            label: "Phone" },
                    { key: "user__status",           label: "Status",   render: (r) => <Badge color={r.user__status === "active" ? "green" : "slate"}>{r.user__status}</Badge> },
                    { key: "total_bonus",            label: "Earned",   render: (r) => `৳${Number(r.total_bonus).toLocaleString()}` },
                    { key: "referrals_converted",    label: "Converted" },
                    { key: "last_bonus",             label: "Last",     render: (r) => r.last_bonus?.slice(0, 10) },
                  ]}
                  rows={d.per_user}
                />
              </div>
            )}

            {/* ══ LEADERSHIP BONUS ════════════════════════════════ */}
            {activeTab === "leadership" && d && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard label="Total Paid"      value={`৳${d.summary?.total_paid?.toLocaleString()}`}     icon={DollarSign} color="green" />
                  <StatCard label="Transactions"    value={d.summary?.total_transactions}                     icon={Activity}   color="blue" />
                  <StatCard label="Unique Earners"  value={d.summary?.unique_earners}                         icon={Users}      color="purple" />
                </div>

                <SectionHeader title="Generation Breakdown" subtitle="Gen 1–5 কোন generation এ কত গেছে" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {d.generation_breakdown?.map((g) => (
                    <div key={g.generation} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Gen {g.generation}</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white mt-1">৳{Number(g.total_paid).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{g.earners} earners</p>
                    </div>
                  ))}
                </div>

                <SectionHeader title="Per User Breakdown" />
                <ReportTable
                  columns={[
                    { key: "user__username",   label: "Username" },
                    { key: "user__name",        label: "Name" },
                    { key: "user__star_level",  label: "Star",    render: (r) => `⭐ ${r.user__star_level}` },
                    { key: "user__status",      label: "Status",  render: (r) => <Badge color={r.user__status === "active" ? "green" : "slate"}>{r.user__status}</Badge> },
                    { key: "total_bonus",       label: "Earned",  render: (r) => `৳${Number(r.total_bonus).toLocaleString()}` },
                    { key: "transaction_count", label: "Txns" },
                  ]}
                  rows={d.per_user}
                />
              </div>
            )}

            {/* ══ RANK REWARD ═════════════════════════════════════ */}
            {activeTab === "rank" && d && (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Total Paid"   value={`৳${d.summary?.total_paid?.toLocaleString()}`} icon={DollarSign} color="purple" />
      <StatCard label="Transactions" value={d.summary?.total_transactions}                 icon={Activity}   color="blue" />
    </div>

    <SectionHeader title="Rank Reward Breakdown" subtitle="প্রতিটা rank এ কত টাকা বিতরণ হয়েছে" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {d.star_breakdown?.map((s) => {
        const rankConfig = {
          4: { title: "Leader",            badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",   bar: "bg-amber-500",   top: "from-amber-400 to-amber-500" },
          5: { title: "Sales Officer",     badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",       bar: "bg-blue-500",    top: "from-blue-400 to-blue-600" },
          6: { title: "Sr. Sales Officer", badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400", bar: "bg-violet-500", top: "from-violet-400 to-violet-600" },
          7: { title: "Incharge",          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", bar: "bg-emerald-500", top: "from-emerald-400 to-emerald-600" },
          8: { title: "Manager",           badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",       bar: "bg-rose-500",    top: "from-rose-400 to-rose-600" },
        };
        const cfg = rankConfig[s.star_level];
        if (!cfg) return null;
        const usedPct = s.reward_per_star > 0
          ? Math.min(Math.round((s.total_distributed / (s.reward_per_star * Math.max(s.count, 1))) * 100), 100)
          : 0;

        return (
          <div key={s.star_level} className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 overflow-hidden">
            {/* Top color bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cfg.top}`} />

            {/* Rank badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cfg.badge}`}>
               {cfg.title}
            </span>

            {/* Reward amount */}
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-3">
              ৳{Number(s.reward_per_star).toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">per member reward</p>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${usedPct}%` }} />
            </div>

            {/* Count × reward = total */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>{s.count} members</span>
              <span className="text-emerald-500 font-black">৳{Number(s.total_distributed).toLocaleString()} paid</span>
            </div>
          </div>
        );
      })}
    </div>

    <SectionHeader title="Per User" subtitle="কোন user কত rank reward পেয়েছে" />
    <ReportTable
      columns={[
        { key: "user__username",  label: "Username" },
        { key: "user__name",      label: "Name" },
        { key: "user__star_level",label: "Rank",     render: (r) => {
          const titles = { 4: "Leader", 5: "Sales Officer", 6: "Sr. Sales Officer", 7: "Incharge", 8: "Manager" };
          return ` ${titles[r.user__star_level] || r.user__star_level}`;
        }},
        { key: "total_received",  label: "Received", render: (r) => `৳${Number(r.total_received).toLocaleString()}` },
        { key: "stars_achieved",  label: "Levels" },
        { key: "last_reward",     label: "Last",     render: (r) => r.last_reward?.slice(0, 10) },
      ]}
      rows={d.per_user}
    />
  </div>
)}

            {/* ══ WITHDRAWALS ═════════════════════════════════════ */}
            {activeTab === "withdrawals" && d && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Requested" value={`৳${d.overall?.total_requested?.toLocaleString()}`} icon={Wallet}     color="blue" />
                  <StatCard label="Total Approved"  value={`৳${d.overall?.total_approved?.toLocaleString()}`}  icon={DollarSign} color="green" />
                  <StatCard label="Total Rejected"  value={`৳${d.overall?.total_rejected?.toLocaleString()}`}  icon={Activity}   color="rose" />
                  <StatCard label="Pending"         value={`৳${d.overall?.total_pending?.toLocaleString()}`}   icon={BarChart2}  color="amber" />
                </div>

                {/* Status + Method breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <SectionHeader title="Status Breakdown" />
                    <div className="space-y-3">
                      {d.status_breakdown?.map((s) => (
                        <div key={s.status} className="flex justify-between items-center">
                          <Badge color={s.status === "approved" ? "green" : s.status === "rejected" ? "rose" : "amber"}>{s.status}</Badge>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800 dark:text-white">৳{Number(s.total || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">{s.count} requests</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <SectionHeader title="Method Breakdown" />
                    <div className="space-y-3">
                      {d.method_breakdown?.map((m) => (
                        <div key={m.method} className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-700 dark:text-white uppercase">{m.method || "Unknown"}</span>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800 dark:text-white">৳{Number(m.total || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">{m.count} requests</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <SectionHeader title="Per User" />
                <ReportTable
                  columns={[
                    { key: "user__username",   label: "Username" },
                    { key: "user__name",        label: "Name" },
                    { key: "user__phone",       label: "Phone" },
                    { key: "total_requested",   label: "Requested", render: (r) => `৳${Number(r.total_requested || 0).toLocaleString()}` },
                    { key: "total_approved",    label: "Approved",  render: (r) => `৳${Number(r.total_approved  || 0).toLocaleString()}` },
                    { key: "total_rejected",    label: "Rejected",  render: (r) => `৳${Number(r.total_rejected  || 0).toLocaleString()}` },
                    { key: "request_count",     label: "Count" },
                  ]}
                  rows={d.per_user}
                />
              </div>
            )}

            {/* ══ ACTIVATIONS ════════════════════════════════════ */}
            {activeTab === "activations" && d && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Users"      value={d.summary?.total_users}                                        icon={Users}      color="blue" />
                  <StatCard label="Active Users"     value={d.summary?.active_users}                                       icon={Zap}        color="green" />
                  <StatCard label="Activation Rate"  value={`${d.summary?.activation_rate}%`}                              icon={Activity}   color="purple" />
                  <StatCard label="Fund Generated"   value={`৳${d.summary?.total_fund_generated?.toLocaleString()}`}       icon={DollarSign} color="orange" />
                </div>

                <SectionHeader title="Division Breakdown" />
                <ReportTable
                  columns={[
                    { key: "division",  label: "Division" },
                    { key: "total",     label: "Total" },
                    { key: "active",    label: "Active",   render: (r) => <span className="text-emerald-600 font-black">{r.active}</span> },
                    { key: "inactive",  label: "Inactive", render: (r) => <span className="text-rose-500 font-black">{r.inactive}</span> },
                    { key: "rate",      label: "Rate",     render: (r) => `${r.total ? ((r.active / r.total) * 100).toFixed(1) : 0}%` },
                  ]}
                  rows={d.division_breakdown}
                />

                <SectionHeader title="Recently Activated" />
                <ReportTable
                  columns={[
                    { key: "username",               label: "Username" },
                    { key: "name",                   label: "Name" },
                    { key: "phone",                  label: "Phone" },
                    { key: "division",               label: "Division" },
                    { key: "referred_by__username",  label: "Referred By" },
                    { key: "createdAt",              label: "Joined",  render: (r) => r.createdAt?.slice(0, 10) },
                  ]}
                  rows={d.recent_activated}
                />
              </div>
            )}

            {/* ══ STAR LEVELS ════════════════════════════════════ */}
            {activeTab === "stars" && d && (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Starred Users"      value={d.summary?.total_starred_users}                              icon={Star}       color="amber" />
      <StatCard label="Total Rank Rewards" value={`৳${d.summary?.total_rank_rewards_paid?.toLocaleString()}`} icon={DollarSign} color="purple" />
    </div>

    <SectionHeader title="Rank Distribution" subtitle="Member থেকে Manager পর্যন্ত সব rank এর breakdown" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {d.star_breakdown?.map((s) => {
        const rankConfig = {
          0: { title: "Member",            color: "from-slate-400 to-slate-500",     bg: "bg-slate-50 dark:bg-slate-800/30",      border: "border-slate-200 dark:border-slate-700",   badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",         pairs: "0",     bar: "bg-slate-400" },
          4: { title: "Leader",            color: "from-amber-400 to-amber-500",     bg: "bg-amber-50 dark:bg-amber-900/10",      border: "border-amber-200 dark:border-amber-800",   badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",      pairs: "15+",   bar: "bg-amber-500" },
          5: { title: "Sales Officer",     color: "from-blue-400 to-blue-600",       bg: "bg-blue-50 dark:bg-blue-900/10",        border: "border-blue-200 dark:border-blue-800",     badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",          pairs: "50+",   bar: "bg-blue-500" },
          6: { title: "Sr. Sales Officer", color: "from-violet-400 to-violet-600",   bg: "bg-violet-50 dark:bg-violet-900/10",    border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",  pairs: "200+",  bar: "bg-violet-500" },
          7: { title: "Incharge",          color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10",  border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", pairs: "500+", bar: "bg-emerald-500" },
          8: { title: "Manager",           color: "from-rose-400 to-rose-600",       bg: "bg-rose-50 dark:bg-rose-900/10",        border: "border-rose-200 dark:border-rose-800",     badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",          pairs: "1200+", bar: "bg-rose-500" },
        };
        const cfg = rankConfig[s.star_level] || rankConfig[0];
        const activePct = s.total_count > 0 ? Math.round((s.active_count / s.total_count) * 100) : 0;
        const stars = "⭐".repeat(Math.min(s.star_level, 5));

        return (
          <div key={s.star_level} className={`relative rounded-2xl border ${cfg.border} ${cfg.bg} p-5 overflow-hidden`}>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cfg.color}`} />

            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cfg.badge}`}>
                  {stars && <span>{stars}</span>} {cfg.title}
                </p>
                {s.star_level >= 4 && (
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{cfg.pairs} pairs required</p>
                )}
              </div>
              {s.rank_reward_each > 0 && (
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Reward</p>
                  <p className="text-sm font-black text-purple-600 dark:text-purple-400">৳{Number(s.rank_reward_each).toLocaleString()}</p>
                </div>
              )}
            </div>

            <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">{s.total_count}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Total Members</p>

            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${activePct}%` }} />
            </div>

            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-emerald-500">{s.active_count} active</span>
              <span className="text-slate-400">{s.inactive_count} inactive</span>
            </div>

            {s.total_reward_paid > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 font-semibold">Total paid out</p>
                <p className="text-sm font-black text-purple-600 dark:text-purple-400">৳{Number(s.total_reward_paid).toLocaleString()}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

            {/* ══ TOP EARNERS ════════════════════════════════════ */}
            {activeTab === "top" && d && (
              <div className="space-y-6">
                {/* Type Selector */}
                <div className="flex flex-wrap gap-2">
                  {["overall", "referral", "matching", "leadership", "rank_reward"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopType(t)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        topType === t
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <ReportTable
                  columns={
                    topType === "overall"
                      ? [
                          { key: "username",          label: "Username" },
                          { key: "name",               label: "Name" },
                          { key: "star_level",         label: "Star",       render: (r) => `⭐ ${r.star_level}` },
                          { key: "balance",            label: "Balance",    render: (r) => `৳${Number(r.balance).toLocaleString()}` },
                          { key: "referral_bonus",     label: "Referral",   render: (r) => `৳${Number(r.referral_bonus).toLocaleString()}` },
                          { key: "matching_bonus",     label: "Matching",   render: (r) => `৳${Number(r.matching_bonus).toLocaleString()}` },
                          { key: "leadership_bonus",   label: "Leadership", render: (r) => `৳${Number(r.leadership_bonus).toLocaleString()}` },
                          { key: "left_count",         label: "L/R",        render: (r) => `${r.left_count}/${r.right_count}` },
                        ]
                      : [
                          { key: "user__username",  label: "Username" },
                          { key: "user__name",       label: "Name" },
                          { key: "user__star_level", label: "Star",    render: (r) => `⭐ ${r.user__star_level}` },
                          { key: "user__status",     label: "Status",  render: (r) => <Badge color={r.user__status === "active" ? "green" : "slate"}>{r.user__status}</Badge> },
                          { key: "total_earned",     label: "Earned",  render: (r) => `৳${Number(r.total_earned).toLocaleString()}` },
                          { key: "count",            label: "Txns" },
                        ]
                  }
                  rows={d.result}
                />
              </div>
            )}

            {/* ══ MONTHLY SUMMARY ════════════════════════════════ */}
            {activeTab === "monthly" && d && (
              <div className="space-y-6">
                {/* Year selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-500 uppercase">Year:</span>
                  {[2024, 2025, 2026].map((y) => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        year === y ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                {/* Annual Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Annual Inflow"   value={`৳${d.annual_summary?.total_inflow?.toLocaleString()}`}     icon={TrendingUp} color="green" />
                  <StatCard label="Annual Outflow"  value={`৳${d.annual_summary?.total_outflow?.toLocaleString()}`}    icon={ArrowDownCircle} color="rose" />
                  <StatCard label="Total Bonus"     value={`৳${d.annual_summary?.total_bonus_paid?.toLocaleString()}`} icon={DollarSign} color="purple" />
                  <StatCard label="New Activations" value={d.annual_summary?.new_activations}                          icon={Zap}        color="orange" />
                </div>

                {/* Monthly Table */}
                <ReportTable
                  columns={[
                    { key: "month_name",       label: "Month" },
                    { key: "new_registrations",label: "Registered" },
                    { key: "new_activations",  label: "Activated" },
                    { key: "fund_inflow",      label: "Inflow",        render: (r) => `৳${r.fund_inflow?.toLocaleString()}` },
                    { key: "fund_outflow",     label: "Outflow",       render: (r) => `৳${r.fund_outflow?.toLocaleString()}` },
                    { key: "net_fund",         label: "Net",           render: (r) => <span className={r.net_fund >= 0 ? "text-emerald-600 font-black" : "text-rose-500 font-black"}>৳{r.net_fund?.toLocaleString()}</span> },
                    { key: "total_bonus_paid", label: "Bonus Paid",    render: (r) => `৳${r.total_bonus_paid?.toLocaleString()}` },
                    { key: "referral",         label: "Referral",      render: (r) => `৳${r.bonus_breakdown?.referral?.toLocaleString()}` },
                    { key: "matching",         label: "Matching",      render: (r) => `৳${r.bonus_breakdown?.matching?.toLocaleString()}` },
                    { key: "withdrawals",      label: "Withdrawals",   render: (r) => `৳${r.withdrawals?.total_requested?.toLocaleString()}` },
                  ]}
                  rows={d.monthly_data?.filter((m) => m.new_registrations > 0 || m.fund_inflow > 0)}
                />
              </div>
            )}

            {/* ══ REFERRAL CHAIN ══════════════════════════════════ */}
            {activeTab === "chain" && (
              <div className="space-y-6">
                {/* Search */}
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                    <Search size={16} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter username..."
                      value={chainInput}
                      onChange={(e) => setChainInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && setChainUser(chainInput)}
                      className="flex-1 bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={() => setChainUser(chainInput)}
                    className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase"
                  >
                    Search
                  </button>
                </div>

                {d && (
                  <>
                    {/* User Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white font-black text-lg">
                          {d.user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white">{d.user?.name || d.user?.username}</p>
                          <p className="text-xs text-slate-400 font-semibold">@{d.user?.username}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge color={d.user?.status === "active" ? "green" : "slate"}>{d.user?.status}</Badge>
                            <Badge color="amber">⭐ {d.user?.star_level} Star</Badge>
                          </div>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Network</p>
                          <p className="text-xs font-black text-slate-700 dark:text-white">L: {d.user?.left_count} / R: {d.user?.right_count}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard label="Direct Referrals"   value={d.direct_referrals?.total}                                                  icon={Users}      color="blue" />
                      <StatCard label="Active Referrals"   value={`${d.direct_referrals?.active} (${d.direct_referrals?.conversion_rate}%)`}  icon={Zap}        color="green" small />
                      <StatCard label="Total Downline"     value={d.placement_downline?.total}                                                 icon={GitBranch}  color="purple" />
                      <StatCard label="Network Earnings"   value={`৳${d.earnings_from_network?.total_earned?.toLocaleString()}`}               icon={DollarSign} color="orange" />
                    </div>

                    {/* Earnings Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard label="Referral Earned" value={`৳${d.earnings_from_network?.referral_bonus?.toLocaleString()}`} icon={GitBranch} color="blue" />
                      <StatCard label="Matching Earned" value={`৳${d.earnings_from_network?.matching_bonus?.toLocaleString()}`} icon={TrendingUp} color="green" />
                    </div>

                    {/* Direct referral list */}
                    <SectionHeader title="Direct Referrals" subtitle={`${d.direct_referrals?.total} total, ${d.direct_referrals?.active} active`} />
                    <ReportTable
                      columns={[
                        { key: "username",  label: "Username" },
                        { key: "name",      label: "Name" },
                        { key: "phone",     label: "Phone" },
                        { key: "division",  label: "Division" },
                        { key: "status",    label: "Status", render: (r) => <Badge color={r.status === "active" ? "green" : "slate"}>{r.status}</Badge> },
                        { key: "points",    label: "Points" },
                        { key: "createdAt", label: "Joined", render: (r) => r.createdAt?.slice(0, 10) },
                      ]}
                      rows={d.direct_referrals?.list}
                    />
                  </>
                )}

                {!d && chainUser && !loading && (
                  <div className="text-center py-16 text-slate-400 font-bold">User not found</div>
                )}
                {!chainUser && (
                  <div className="text-center py-16 text-slate-400 font-bold text-sm">
                    Username দিয়ে search করো
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}