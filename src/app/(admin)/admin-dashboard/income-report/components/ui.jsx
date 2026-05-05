// src/app/(admin)/admin-dashboard/income-report/components/ui.jsx
"use client";
import { Loader2 } from "lucide-react";

// ── Stat Card ────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = "blue", small }) {
  const colors = {
    blue:   "from-blue-500 to-blue-600 shadow-blue-200",
    green:  "from-emerald-500 to-emerald-600 shadow-emerald-200",
    orange: "from-orange-500 to-orange-600 shadow-orange-200",
    rose:   "from-rose-500 to-rose-600 shadow-rose-200",
    purple: "from-violet-500 to-violet-600 shadow-violet-200",
    amber:  "from-amber-500 to-amber-600 shadow-amber-200",
    slate:  "from-slate-600 to-slate-700 shadow-slate-200",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
      {Icon && (
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{label}</p>
        <p className={`font-black text-slate-800 dark:text-white truncate ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────
export function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────
export function ReportTable({ columns, rows, emptyMsg = "No data found" }) {
  if (!rows?.length) return (
    <div className="text-center py-12 text-slate-400 text-sm font-bold">{emptyMsg}</div>
  );
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Fund Progress Bar ─────────────────────────────────────
export function FundBar({ label, balance, inflow, outflow, utilization, color }) {
  const colors = {
    blue:   "bg-blue-500",
    green:  "bg-emerald-500",
    orange: "bg-orange-500",
    rose:   "bg-rose-500",
    purple: "bg-violet-500",
    amber:  "bg-amber-500",
    slate:  "bg-slate-500",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-tight">{label}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">৳{balance?.toLocaleString()}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${utilization > 80 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
          {utilization}% used
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color] || "bg-blue-500"} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(utilization, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
        <span>In: ৳{inflow?.toLocaleString()}</span>
        <span>Out: ৳{outflow?.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ children, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-100 text-blue-700",
    green:  "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    rose:   "bg-rose-100 text-rose-700",
    amber:  "bg-amber-100 text-amber-700",
    slate:  "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${colors[color]}`}>
      {children}
    </span>
  );
}

// ── Date Filter ───────────────────────────────────────────
export function DateFilter({ from, to, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
        <span className="text-[10px] font-black text-slate-400 uppercase">From</span>
        <input
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="text-xs font-bold text-slate-700 dark:text-white bg-transparent outline-none"
        />
      </div>
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
        <span className="text-[10px] font-black text-slate-400 uppercase">To</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="text-xs font-bold text-slate-700 dark:text-white bg-transparent outline-none"
        />
      </div>
      {(from || to) && (
        <button
          onClick={() => onChange({ from: "", to: "" })}
          className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase"
        >
          Clear
        </button>
      )}
    </div>
  );
}