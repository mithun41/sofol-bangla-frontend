"use client";
import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrendingUp, ShoppingBag, DollarSign, Package,
  RefreshCw, ArrowUpRight, ArrowDownRight,
  BarChart2, Award, Download,
} from "lucide-react";
import api from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const fmt  = (n) => `৳${Number(n || 0).toLocaleString()}`;
const fmtN = (n) => Number(n || 0).toLocaleString();
const pct  = (n) => `${Number(n || 0).toFixed(1)}%`;

const FILTERS = [
  { key: "today",   label: "Today" },
  { key: "7days",   label: "7 Days" },
  { key: "15days",  label: "15 Days" },
  { key: "1month",  label: "30 Days" },
  { key: "3months", label: "3 Months" },
  { key: "custom",  label: "Custom" },
];

const STATUS_COLORS = {
  completed:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending:    "bg-amber-50 text-amber-700 border-amber-100",
  cancelled:  "bg-rose-50 text-rose-700 border-rose-100",
  processing: "bg-blue-50 text-blue-700 border-blue-100",
  shipping:   "bg-violet-50 text-violet-700 border-violet-100",
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />;
}

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  const colors = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",   icon: "text-blue-600",   border: "border-blue-100 dark:border-blue-800" },
    green:  { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600", border: "border-emerald-100 dark:border-emerald-800" },
    purple: { bg: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-600", border: "border-violet-100 dark:border-violet-800" },
    orange: { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-600", border: "border-orange-100 dark:border-orange-800" },
    rose:   { bg: "bg-rose-50 dark:bg-rose-900/20",   icon: "text-rose-600",   border: "border-rose-100 dark:border-rose-800" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-600",  border: "border-amber-100 dark:border-amber-800" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border ${c.border} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] font-black ${trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 shadow-xl text-xs">
      <p className="font-black text-slate-600 dark:text-slate-300 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.name === "orders" ? fmtN(p.value) : fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

function OrdersListTable({ orders }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      String(o.id).includes(search);
    const matchStatus =
      statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Orders List <span className="text-blue-600 ml-1">({filtered.length})</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search name / phone / ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 outline-none w-52"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {["ID", "Name", "Phone", "Address", "Amount", "Payment", "Status", "Date", "Time"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-slate-400 font-bold">No orders found</td>
              </tr>
            ) : (
              filtered.map((o) => {
                const cls = STATUS_COLORS[o.status?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-100";
                return (
                  <tr key={o.id} className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-black text-slate-400">#{o.id}</td>
                    <td className="px-4 py-3 text-xs font-black text-slate-800 dark:text-white whitespace-nowrap">{o.name}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500 whitespace-nowrap">{o.phone}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate">{o.address}</td>
                    <td className="px-4 py-3 text-xs font-black text-slate-800 dark:text-white whitespace-nowrap">{fmt(o.amount)}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">{o.payment_method}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${cls}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-bold whitespace-nowrap">{o.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{o.time}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PDF Generator ─────────────────────────────────────────────────────────────
function generatePDF(data, filter) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const s = data.summary;
  let y = 15;

  // ── Title ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Report", 14, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Period: ${data.filter.start} to ${data.filter.end}   |   Generated: ${new Date().toLocaleString()}`,
    14, 21
  );
  y = 36;

  // ── Summary Section ──
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SUMMARY", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Revenue",       `BDT ${Number(s.revenue).toLocaleString()}`],
      ["Cost",          `BDT ${Number(s.cost).toLocaleString()}`],
      ["Profit",        `BDT ${Number(s.profit).toLocaleString()}`],
      ["Profit Margin", `${Number(s.profit_margin).toFixed(1)}%`],
      ["Total Orders",  String(s.total_orders)],
      ["Completed",     String(s.completed_orders)],
      ["Pending",       String(s.pending_orders)],
      ["Cancelled",     String(s.cancelled_orders)],
      ["Items Sold",    String(s.total_items_sold)],
      ["Avg Order Value", `BDT ${Number(s.avg_order_value).toLocaleString()}`],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── All Time ──
  if (data.alltime) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("ALL TIME TOTALS", 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Revenue", "Profit", "Orders"]],
      body: [[
        `BDT ${Number(data.alltime.revenue).toLocaleString()}`,
        `BDT ${Number(data.alltime.profit).toLocaleString()}`,
        String(data.alltime.orders),
      ]],
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Daily Breakdown ──
  if (data.daily_data?.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("DAILY BREAKDOWN", 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Revenue (BDT)", "Cost (BDT)", "Profit (BDT)", "Orders"]],
      body: data.daily_data.map((d) => [
        d.date,
        Number(d.revenue).toLocaleString(),
        Number(d.cost).toLocaleString(),
        Number(d.profit).toLocaleString(),
        String(d.orders),
      ]),
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Monthly Summary ──
  if (data.monthly_data?.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("MONTHLY SUMMARY", 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Month", "Orders", "Revenue (BDT)", "Cost (BDT)", "Profit (BDT)", "Margin"]],
      body: data.monthly_data.map((m) => {
        const margin = m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : "0.0";
        return [
          m.month_label,
          String(m.orders),
          Number(m.revenue).toLocaleString(),
          Number(m.cost).toLocaleString(),
          Number(m.profit).toLocaleString(),
          `${margin}%`,
        ];
      }),
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Top Products ──
  if (data.top_products?.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("TOP PRODUCTS", 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["#", "Product", "Qty Sold", "Revenue (BDT)", "Profit (BDT)"]],
      body: data.top_products.map((p, i) => [
        `#${i + 1}`,
        p.product_name,
        String(p.qty_sold),
        Number(p.revenue).toLocaleString(),
        Number(p.profit).toLocaleString(),
      ]),
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { cellWidth: 70 } },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Orders List ──
  if (data.orders_list?.length > 0) {
    doc.addPage();
    y = 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`ORDERS LIST (${data.orders_list.length})`, 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["ID", "Name", "Phone", "Amount (BDT)", "Payment", "Status", "Date", "Time"]],
      body: data.orders_list.map((o) => [
        `#${o.id}`,
        o.name,
        o.phone,
        Number(o.amount).toLocaleString(),
        o.payment_method?.toUpperCase(),
        o.status,
        o.date,
        o.time,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer on all pages ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}   |   Sales Report   |   ${data.filter.start} to ${data.filter.end}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(`sales-report-${filter}-${data.filter.start}-to-${data.filter.end}.pdf`);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SalesReportPage() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("7days");
  const [fromDate, setFromDate]   = useState("");
  const [toDate, setToDate]       = useState("");
  const [chartView, setChartView] = useState("revenue");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (filter === "custom" && fromDate && toDate) {
        params.from = fromDate;
        params.to   = toDate;
      }
      const res = await api.get("orders/admin/full-sales-report/", { params });
      setData(res.data);
    } catch (err) {
      console.error("Sales report fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [filter, fromDate, toDate]);

  useEffect(() => {
    if (filter !== "custom") fetchData();
  }, [filter]);

  const s = data?.summary;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-blue-600" /> Sales Report
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Revenue · Profit · Orders
          </p>
        </div>
        {/* Refresh + PDF buttons */}
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-black uppercase"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => data && generatePDF(data, filter)}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase transition-colors"
          >
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === f.key
                  ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filter === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-900 outline-none" />
            <span className="text-slate-400 text-xs">to</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-900 outline-none" />
            <button onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase">
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── All-time strip ── */}
      {data?.alltime && (
        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl px-6 py-4 flex flex-wrap gap-6 items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">All Time</p>
          <div>
            <p className="text-[10px] text-slate-500 font-bold">Revenue</p>
            <p className="text-lg font-black text-white">{fmt(data.alltime.revenue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold">Profit</p>
            <p className="text-lg font-black text-emerald-400">{fmt(data.alltime.profit)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold">Orders</p>
            <p className="text-lg font-black text-white">{fmtN(data.alltime.orders)}</p>
          </div>
        </div>
      )}

      {/* ── Summary Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Revenue"       value={fmt(s?.revenue)}          sub={`${fmtN(s?.completed_orders)} completed`}  icon={DollarSign}    color="blue" />
          <StatCard label="Profit"        value={fmt(s?.profit)}           sub={`Margin: ${pct(s?.profit_margin)}`}        icon={TrendingUp}    color="green" />
          <StatCard label="Cost"          value={fmt(s?.cost)}             sub="Total purchase cost"                       icon={ArrowDownRight} color="rose" />
          <StatCard label="Avg Order"     value={fmt(s?.avg_order_value)}  sub="Per completed order"                       icon={BarChart2}     color="purple" />
          <StatCard label="Total Orders"  value={fmtN(s?.total_orders)}    sub={`${s?.pending_orders} pending`}            icon={ShoppingBag}   color="orange" />
          <StatCard label="Completed"     value={fmtN(s?.completed_orders)}sub={`${s?.cancelled_orders} cancelled`}        icon={Award}         color="green" />
          <StatCard label="Items Sold"    value={fmtN(s?.total_items_sold)}sub="Total quantity sold"                       icon={Package}       color="amber" />
          <StatCard label="Profit Margin" value={pct(s?.profit_margin)}    sub="Revenue - Cost / Revenue"                  icon={TrendingUp}    color="purple" />
        </div>
      )}

      {/* ── Status Breakdown ── */}
      {!loading && data?.status_breakdown?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Order Status</p>
          <div className="flex flex-wrap gap-3">
            {data.status_breakdown.map((s) => {
              const cls = STATUS_COLORS[s.status?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-100";
              return (
                <div key={s.status} className={`px-4 py-2.5 rounded-xl border ${cls}`}>
                  <p className="text-[10px] font-black uppercase">{s.status}</p>
                  <p className="text-base font-black">{fmtN(s.count)} orders</p>
                  <p className="text-[10px] font-semibold opacity-70">{fmt(s.total)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Chart ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Daily Breakdown</p>
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {["revenue", "profit", "orders"].map((v) => (
              <button key={v} onClick={() => setChartView(v)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  chartView === v ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-52" />
        ) : !data?.daily_data?.length ? (
          <div className="h-52 flex items-center justify-center text-slate-400 text-sm font-bold">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            {chartView === "orders" ? (
              <BarChart data={data.daily_data} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="orders" />
              </BarChart>
            ) : (
              <LineChart data={data.daily_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {chartView === "revenue" ? (
                  <>
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="revenue" />
                    <Line type="monotone" dataKey="cost" stroke="#f43f5e" strokeWidth={2} dot={false} name="cost" strokeDasharray="4 2" />
                  </>
                ) : (
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="profit" />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Monthly Summary ── */}
      {!loading && data?.monthly_data?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Monthly Summary</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {["Month", "Orders", "Revenue", "Cost", "Profit", "Margin"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.monthly_data.map((m) => {
                  const margin = m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : 0;
                  return (
                    <tr key={m.month} className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-black text-slate-700 dark:text-white">{m.month_label}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{fmtN(m.orders)}</td>
                      <td className="px-5 py-3.5 text-xs font-black text-slate-800 dark:text-white">{fmt(m.revenue)}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-rose-500">{fmt(m.cost)}</td>
                      <td className="px-5 py-3.5 text-xs font-black text-emerald-600">{fmt(m.profit)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${Number(margin) >= 20 ? "bg-emerald-50 text-emerald-700" : Number(margin) >= 10 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600"}`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Top Products ── */}
      {!loading && data?.top_products?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Top Products</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {["#", "Product", "Qty Sold", "Revenue", "Profit"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((p, i) => (
                  <tr key={p.product_name} className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-black text-slate-400">#{i + 1}</td>
                    <td className="px-5 py-3.5 text-xs font-black text-slate-800 dark:text-white max-w-[200px] truncate">{p.product_name}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{fmtN(p.qty_sold)}</td>
                    <td className="px-5 py-3.5 text-xs font-black text-slate-800 dark:text-white">{fmt(p.revenue)}</td>
                    <td className="px-5 py-3.5 text-xs font-black text-emerald-600">{fmt(p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Orders List ── */}
      {!loading && data?.orders_list && (
        <OrdersListTable orders={data.orders_list} />
      )}
    </div>
  );
}