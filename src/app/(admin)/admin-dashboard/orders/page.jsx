"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";
import {
  Loader2, Eye, X, CreditCard, User, MapPin, Package,
  Phone, Search, Image as ImageIcon, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ShoppingBag, Clock, CheckCircle2,
  XCircle, Truck, RefreshCw, Hash, CalendarDays, BadgeDollarSign,
  CircleDollarSign, ShieldCheck, Printer, Trash2, Monitor, Globe,
  AlertTriangle, Filter, SlidersHorizontal, TrendingUp,
} from "lucide-react";
import ShippingLabel from "./ShippingLabel";
import { useReactToPrint } from "react-to-print";

// ─────────────────────────────────────────────────────────
// Module-level cache
// ─────────────────────────────────────────────────────────
const ordersCache = {
  data: null,
  timestamp: null,
  TTL: 3 * 60 * 1000, // 3 minutes
  isValid() { return this.data !== null && Date.now() - this.timestamp < this.TTL; },
  set(data) { this.data = data; this.timestamp = Date.now(); },
  invalidate() { this.data = null; this.timestamp = null; },
};

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending:    { label: "Pending",    className: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",   ring: "ring-amber-200"  },
  Processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-400",    ring: "ring-blue-200"   },
  Shipping:   { label: "Shipping",   className: "bg-violet-50 text-violet-700 border-violet-200",    dot: "bg-violet-400",  ring: "ring-violet-200" },
  Completed:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", ring: "ring-emerald-200"},
  Cancelled:  { label: "Cancelled",  className: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-400",    ring: "ring-rose-200"   },
};

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

function TypeTag({ isPOS }) {
  return isPOS ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 border border-violet-200">
      <Monitor size={10} /> POS
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 border border-teal-200">
      <Globe size={10} /> Web
    </span>
  );
}

function StatCard({ label, value, sublabel, accent, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <span className={`opacity-30 group-hover:opacity-60 transition-opacity ${accent}`}>{icon}</span>
      </div>
      <p className={`font-black text-3xl tabular-nums ${accent}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{sublabel}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 break-all">{value || "—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [orderTab, setOrderTab] = useState("all");

  // Date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef(null);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Label_${selectedOrder?.order_number}`,
  });

  // ── Load orders (cache-first) ──────────────────────────
  const fetchOrders = useCallback(async ({ forceRefresh = false } = {}) => {
    if (!forceRefresh && ordersCache.isValid()) {
      setOrders(ordersCache.data);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("orders/admin-list/");
      ordersCache.set(res.data);
      setOrders(res.data);
    } catch {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to load orders!" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, statusFilter, orderTab, dateFrom, dateTo]);

  // ── Status update ──────────────────────────────────────
  const handleStatusUpdate = async (id, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    const result = await Swal.fire({
      title: "Update Status",
      text: `Change to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await api.patch(`orders/admin-update/${id}/`, { status: newStatus });
      const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
      setOrders(updated);
      ordersCache.set(updated);
      if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      Swal.fire({ icon: "success", title: "Updated!", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async (order) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      html: `
        <div style="text-align:left;margin-top:8px;">
          <p style="font-size:14px;color:#64748b;">Order: <strong style="color:#0f172a;">${order.order_number}</strong></p>
          <p style="font-size:14px;color:#64748b;">Customer: <strong style="color:#0f172a;">${order.name}</strong></p>
          <p style="font-size:13px;color:#ef4444;margin-top:8px;">⚠️ This will permanently delete the order. Stock will NOT be restored automatically.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`orders/admin-delete/${order.id}/`);
      const updated = orders.filter(o => o.id !== order.id);
      setOrders(updated);
      ordersCache.set(updated);
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.error || "Delete failed.", "error");
    }
  };

  // ── Filter logic (memoized) ────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        order.name.toLowerCase().includes(q) ||
        (order.order_number && order.order_number.toLowerCase().includes(q)) ||
        (order.phone && order.phone.includes(q));

      const matchStatus = statusFilter === "All" || order.status === statusFilter;

      const isPOS = order.address === "POS Counter Sale";
      const matchTab =
        orderTab === "all" ||
        (orderTab === "pos" && isPOS) ||
        (orderTab === "website" && !isPOS);

      // Date range filter
      let matchDate = true;
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (orderDate < from) matchDate = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (orderDate > to) matchDate = false;
        }
      }

      return matchSearch && matchStatus && matchTab && matchDate;
    });
  }, [orders, searchTerm, statusFilter, orderTab, dateFrom, dateTo]);

  const visibleOrders = useMemo(
    () => filteredOrders.slice(0, visibleCount),
    [filteredOrders, visibleCount]
  );

  const hasMore = visibleCount < filteredOrders.length;

  // ── IntersectionObserver sentinel ─────────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setIsFetchingMore(true);
          setTimeout(() => {
            setVisibleCount(prev => prev + PAGE_SIZE);
            setIsFetchingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipping: orders.filter(o => o.status === "Shipping").length,
    completed: orders.filter(o => o.status === "Completed").length,
  }), [orders]);

  const statuses = ["All", "Pending", "Processing", "Shipping", "Completed", "Cancelled"];

  const activeDateFilter = dateFrom || dateTo;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
            <ShoppingBag size={20} className="text-white" />
          </div>
          {/* <Loader2 className="absolute -top-1 -right-1 animate-spin text-blue-500" size={18} /> */}
        </div>
        <p className="text-sm text-slate-500 font-semibold">Loading orders…</p>
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-5 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Management</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag size={22} className="text-slate-700" /> Orders
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {orders.length} total ·{" "}
              <span className="text-slate-600 font-semibold">{filteredOrders.length} shown</span>
              {activeDateFilter && (
                <span className="ml-2 inline-flex items-center gap-1 text-blue-600 font-semibold text-xs">
                  <CalendarDays size={11} /> date filtered
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => { ordersCache.invalidate(); fetchOrders({ forceRefresh: true }); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm w-fit"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} sublabel="all orders" accent="text-slate-900"
            icon={<TrendingUp size={18} />} />
          <StatCard label="Pending" value={stats.pending} sublabel="awaiting action" accent="text-amber-600"
            icon={<Clock size={18} />} />
          <StatCard label="Shipping" value={stats.shipping} sublabel="in transit" accent="text-violet-600"
            icon={<Truck size={18} />} />
          <StatCard label="Completed" value={stats.completed} sublabel="delivered" accent="text-emerald-600"
            icon={<CheckCircle2 size={18} />} />
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input
                type="text"
                placeholder="Search by name, order ID, or phone…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date filter toggle */}
            <button
              onClick={() => setShowDateFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 ${
                activeDateFilter
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <CalendarDays size={14} />
              {activeDateFilter ? "Date Active" : "Date Filter"}
              {activeDateFilter && (
                <span
                  onClick={e => { e.stopPropagation(); setDateFrom(""); setDateTo(""); }}
                  className="ml-1 w-4 h-4 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </span>
              )}
            </button>

            {/* Order type tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl gap-0.5 shrink-0">
              {[
                { key: "all", label: "All" },
                { key: "website", icon: <Globe size={11} />, label: "Web" },
                { key: "pos", icon: <Monitor size={11} />, label: "POS" },
              ].map(({ key, icon, label }) => (
                <button key={key} onClick={() => setOrderTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    orderTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range row */}
          {showDateFilter && (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3.5 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 shrink-0">
                <CalendarDays size={13} /> Date Range
              </div>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 shrink-0">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 shrink-0">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={e => setDateTo(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
                {activeDateFilter && (
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all">
                    Clear dates
                  </button>
                )}
              </div>
              {activeDateFilter && (
                <p className="text-[11px] text-blue-600 font-semibold shrink-0">
                  {filteredOrders.length} result{filteredOrders.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  statusFilter === s
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                }`}>
                {s}
                {s !== "All" && (
                  <span className={`ml-1.5 text-[9px] opacity-70`}>
                    {orders.filter(o => o.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table header meta */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-800">{visibleOrders.length}</span>
              <span className="text-slate-400"> / {filteredOrders.length}</span> orders
            </p>
            {activeDateFilter && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <CalendarDays size={11} />
                {dateFrom && <span>{new Date(dateFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}
                {dateFrom && dateTo && <span>→</span>}
                {dateTo && <span>{new Date(dateTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}
              </div>
            )}
          </div>

          {visibleOrders.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <ShoppingBag size={40} className="mb-3" strokeWidth={1} />
              <p className="font-bold text-slate-400">No orders found</p>
              <p className="text-sm mt-1 text-slate-300">Try adjusting your filters</p>
              {activeDateFilter && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-700 underline underline-offset-2">
                  Clear date filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40">
                      {["Product", "Order", "Customer", "Amount", "Type", "Status", "Actions"].map(h => (
                        <th key={h} className={`px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ${h === "Actions" ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order, idx) => {
                      const isPOS = order.address === "POS Counter Sale";
                      return (
                        <tr key={order.id}
                          className={`group border-b border-slate-50 hover:bg-blue-50/20 transition-colors ${idx % 2 !== 0 ? "bg-slate-50/20" : ""}`}>

                          {/* Product */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                {order.items?.[0]?.product_image ? (
                                  <img src={order.items[0].product_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={14} className="text-slate-300" />
                                  </div>
                                )}
                                {order.items?.length > 1 && (
                                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                    <span className="text-[9px] text-white font-black">+{order.items.length - 1}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
                                  {order.items?.[0]?.product_name || "No Product"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Order */}
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-bold text-blue-600 font-mono">{order.order_number}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-semibold text-slate-800">{order.name}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone size={9} /> {order.phone}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-black text-slate-900">
                              ৳{Number(order.total_amount).toLocaleString()}
                            </p>
                            {order.shipping_cost > 0 && (
                              <p className="text-[10px] text-slate-400">+ship ৳{order.shipping_cost}</p>
                            )}
                          </td>

                          {/* Type */}
                          <td className="px-5 py-3.5">
                            <TypeTag isPOS={isPOS} />
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <StatusBadge status={order.status} />
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setSelectedOrder(order)} title="View details"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <Eye size={14} />
                              </button>
                              <select
                                className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                                value={order.status}
                                onChange={e => handleStatusUpdate(order.id, e.target.value, order.status)}>
                                {Object.keys(STATUS_CONFIG).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <button onClick={() => handleDelete(order)} title="Delete order"
                                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex items-center justify-center py-6 gap-2 text-slate-400 border-t border-slate-50">
                  {isFetchingMore ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-blue-500" />
                      <span className="text-xs font-semibold">Loading more…</span>
                    </>
                  ) : (
                    <span className="h-1" />
                  )}
                </div>
              )}

              {/* End of list */}
              {!hasMore && filteredOrders.length > PAGE_SIZE && (
                <div className="flex items-center justify-center py-5 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    All {filteredOrders.length} orders loaded
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-100">

            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Order Details</p>
                <h2 className="text-xl font-black text-white tracking-tight">{selectedOrder.order_number}</h2>
                <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                  <StatusBadge status={selectedOrder.status} />
                  <TypeTag isPOS={selectedOrder.address === "POS Counter Sale"} />
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CalendarDays size={11} />
                    {new Date(selectedOrder.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleDelete(selectedOrder)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-slate-400 hover:text-white transition-all" title="Delete order">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoRow label="Customer" value={selectedOrder.name} />
                <InfoRow label="Phone" value={selectedOrder.phone} />
                <InfoRow label="Payment" value={selectedOrder.payment_method?.toUpperCase()} />
                <InfoRow label="Address" value={`${selectedOrder.address}${selectedOrder.city ? ", " + selectedOrder.city : ""}`} />
                <InfoRow label="Transaction ID" value={selectedOrder.transaction_id || "N/A"} />
                <InfoRow label="Sender Number" value={selectedOrder.sender_number || "N/A"} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Package size={12} /> Ordered Items ({selectedOrder.items?.length || 0})
                </p>
                <div className="space-y-2.5">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={14} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.product_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Qty: {item.quantity} · ৳{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} each
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900">
                          ৳{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </p>
                        {item.point_value > 0 && (
                          <p className="text-[10px] text-emerald-600 font-bold">+{item.point_value * item.quantity} PV</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <BadgeDollarSign size={12} /> Summary
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold">৳{Number(selectedOrder.subtotal).toLocaleString()}</span>
                    </div>
                    {selectedOrder.shipping_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Shipping</span>
                        <span className="font-semibold">৳{selectedOrder.shipping_cost}</span>
                      </div>
                    )}
                    <div className="pt-2.5 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">Total</span>
                      <span className="text-xl font-black text-slate-900">৳{Number(selectedOrder.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <ShieldCheck size={12} /> Update Status
                  </p>
                  <div className="space-y-2">
                    {Object.keys(STATUS_CONFIG).map(s => (
                      <button key={s}
                        onClick={() => handleStatusUpdate(selectedOrder.id, s, selectedOrder.status)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                          selectedOrder.status === s
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-transparent text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        }`}>
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                          {s}
                        </span>
                        {selectedOrder.status === s && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
              <button onClick={() => handleDelete(selectedOrder)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all">
                <Trash2 size={15} /> Delete Order
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-all shadow-sm">
                <Printer size={15} /> Print Shipping Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area */}
      <div style={{ display: "none" }}>
        <ShippingLabel ref={printRef} order={selectedOrder} />
      </div>
    </div>
  );
}