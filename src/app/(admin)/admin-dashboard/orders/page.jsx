"use client";
import React, { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";
import {
  Loader2, Eye, X, CreditCard, User, MapPin, Package,
  Phone, Search, Image as ImageIcon, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ShoppingBag, Clock, CheckCircle2,
  XCircle, Truck, RefreshCw, Hash, CalendarDays, BadgeDollarSign,
  CircleDollarSign, ShieldCheck, Printer, Trash2, Monitor, Globe,
  AlertTriangle,
} from "lucide-react";
import ShippingLabel from "./ShippingLabel";
import { useReactToPrint } from "react-to-print";

const ORDERS_PER_PAGE = 20;

const STATUS_CONFIG = {
  Pending:    { label: "Pending",    className: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400"   },
  Processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-400"    },
  Shipping:   { label: "Shipping",   className: "bg-violet-50 text-violet-700 border-violet-200",dot: "bg-violet-400"  },
  Completed:  { label: "Completed",  className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  Cancelled:  { label: "Cancelled",  className: "bg-rose-50 text-rose-700 border-rose-200",      dot: "bg-rose-400"    },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

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
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-100 text-violet-700">
      <Monitor size={10} /> POS
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-700">
      <Globe size={10} /> Web
    </span>
  );
}

function StatCard({ label, value, sublabel, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <p className={`font-black text-2xl ${accent}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
  }
  const result = []; let prev;
  for (const p of pages) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }

  const btnClass = "w-8 h-8 rounded-lg text-sm font-semibold transition-all flex items-center justify-center";

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/40">
      <p className="text-xs text-slate-400">
        Page <span className="font-bold text-slate-600">{currentPage}</span> of{" "}
        <span className="font-bold text-slate-600">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
          className={`${btnClass} text-slate-400 hover:bg-slate-100 disabled:opacity-30`}>
          <ChevronsLeft size={14} />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className={`${btnClass} text-slate-400 hover:bg-slate-100 disabled:opacity-30`}>
          <ChevronLeft size={14} />
        </button>
        {result.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1.5 text-slate-300 text-sm">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`${btnClass} ${currentPage === p ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className={`${btnClass} text-slate-400 hover:bg-slate-100 disabled:opacity-30`}>
          <ChevronRight size={14} />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
          className={`${btnClass} text-slate-400 hover:bg-slate-100 disabled:opacity-30`}>
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [orderTab, setOrderTab] = useState("all");
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Label_${selectedOrder?.order_number}`,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("orders/admin-list/");
      setOrders(res.data);
    } catch {
      Swal.fire({ icon: "error", title: "Oops...", text: "Failed to load orders!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── Status update ──
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
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      Swal.fire({ icon: "success", title: "Updated!", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  // ── Delete order ──
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
      setOrders(prev => prev.filter(o => o.id !== order.id));
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.error || "Delete failed.", "error");
    }
  };

  // ── Filter logic ──
  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      order.name.toLowerCase().includes(q) ||
      (order.order_number && order.order_number.toLowerCase().includes(q));
    const matchStatus = statusFilter === "All" || order.status === statusFilter;
    const isPOS = order.address === "POS Counter Sale";
    const matchTab =
      orderTab === "all" ||
      (orderTab === "pos" && isPOS) ||
      (orderTab === "website" && !isPOS);
    return matchSearch && matchStatus && matchTab;
  });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipping: orders.filter(o => o.status === "Shipping").length,
    completed: orders.filter(o => o.status === "Completed").length,
  };

  const statuses = ["All", "Pending", "Processing", "Shipping", "Completed", "Cancelled"];

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={32} />
        <p className="text-sm text-slate-400 font-medium">Loading orders...</p>
      </div>
    </div>
  );

  return (
    <div className="p-2  min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Management</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h1>
            <p className="text-sm text-slate-400 mt-1">
              {orders.length} total · {filteredOrders.length} shown
            </p>
          </div>
          <button onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm w-fit">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} sublabel="all orders" accent="text-slate-900" />
          <StatCard label="Pending" value={stats.pending} sublabel="awaiting action" accent="text-amber-600" />
          <StatCard label="Shipping" value={stats.shipping} sublabel="in transit" accent="text-violet-600" />
          <StatCard label="Completed" value={stats.completed} sublabel="delivered" accent="text-emerald-600" />
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          {/* Search + Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input
                type="text"
                placeholder="Search by name or order ID..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Order type tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl gap-0.5 shrink-0">
              {[
                { key: "all", label: "All" },
                { key: "website", icon: <Globe size={11} />, label: "Web" },
                { key: "pos", icon: <Monitor size={11} />, label: "POS" },
              ].map(({ key, icon, label }) => (
                <button key={key} onClick={() => { setOrderTab(key); setCurrentPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    orderTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  statusFilter === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <ShoppingBag size={36} className="mb-3" strokeWidth={1} />
              <p className="font-bold text-slate-400">No orders found</p>
              <p className="text-sm mt-1 text-slate-300">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {["Product", "Order", "Customer", "Amount", "Type", "Status", "Actions"].map(h => (
                        <th key={h} className={`px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${h === "Actions" ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, idx) => {
                      const isPOS = order.address === "POS Counter Sale";
                      return (
                        <tr key={order.id}
                          className={`group border-b border-slate-50 hover:bg-blue-50/20 transition-colors ${idx % 2 !== 0 ? "bg-slate-50/30" : ""}`}>

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
                              {/* View */}
                              <button onClick={() => setSelectedOrder(order)} title="View details"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <Eye size={14} />
                              </button>

                              {/* Status select */}
                              <select
                                className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                                value={order.status}
                                onChange={e => handleStatusUpdate(order.id, e.target.value, order.status)}>
                                {Object.keys(STATUS_CONFIG).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>

                              {/* Delete */}
                              <button onClick={() => handleDelete(order)} title="Delete order"
                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-50 group-hover:opacity-100">
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
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-300 pb-4">
          Showing {Math.min((currentPage - 1) * ORDERS_PER_PAGE + 1, filteredOrders.length)}–
          {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
        </p>
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-100">

            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-900">
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

              {/* Info Grid */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoRow label="Customer" value={selectedOrder.name} />
                <InfoRow label="Phone" value={selectedOrder.phone} />
                <InfoRow label="Payment" value={selectedOrder.payment_method?.toUpperCase()} />
                <InfoRow label="Address" value={`${selectedOrder.address}${selectedOrder.city ? ", " + selectedOrder.city : ""}`} />
                <InfoRow label="Transaction ID" value={selectedOrder.transaction_id || "N/A"} />
                <InfoRow label="Sender Number" value={selectedOrder.sender_number || "N/A"} />
              </div>

              {/* Items */}
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

              {/* Summary + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order summary */}
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

                {/* Status update */}
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