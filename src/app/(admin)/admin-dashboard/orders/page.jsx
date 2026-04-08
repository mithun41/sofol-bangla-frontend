"use client";
import React, { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";
import {
  Loader2,
  Eye,
  X,
  CreditCard,
  User,
  MapPin,
  Package,
  Phone,
  Search,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  Hash,
  CalendarDays,
  BadgeDollarSign,
  CircleDollarSign,
  ShieldCheck,
  Printer,
} from "lucide-react";
import ShippingLabel from "./ShippingLabel";
import { useReactToPrint } from "react-to-print";

const ORDERS_PER_PAGE = 20;

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
    dot: "bg-amber-400",
  },
  Processing: {
    label: "Processing",
    icon: RefreshCw,
    className: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100",
    dot: "bg-blue-400",
  },
  Shipping: {
    label: "Shipping",
    icon: Truck,
    className: "bg-violet-50 text-violet-700 border-violet-200 ring-violet-100",
    dot: "bg-violet-400",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
    dot: "bg-emerald-400",
  },
  Cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-100",
    dot: "bg-rose-400",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ring-2 ring-inset ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}
      />
      {config.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
        <Icon size={13} />
        {title}
      </h4>
      {children}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      }
    }

    const result = [];
    let prev;
    for (const page of pages) {
      if (prev && page - prev > 1) result.push("...");
      result.push(page);
      prev = page;
    }
    return result;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-700">{currentPage}</span>{" "}
        of <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-slate-400 text-sm"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const printRef = useRef(null);

  // এটাকে এভাবে পরিবর্তন কর:
  const handlePrint = useReactToPrint({
    contentRef: printRef, // 'content' এর বদলে 'contentRef' হবে
    documentTitle: `Label_${selectedOrder?.order_number}`,
  });
  const fetchOrders = async () => {
    try {
      const res = await api.get("orders/admin-list/");
      setOrders(res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load orders!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    const result = await Swal.fire({
      title: "Update Status",
      text: `Change order status to "${newStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      borderRadius: "1.5rem",
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`orders/admin-update/${id}/`, { status: newStatus });
        fetchOrders();
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Order status has been updated.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const statuses = [
    "All",
    "Pending",
    "Processing",
    "Shipping",
    "Completed",
    "Cancelled",
  ];

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.name.toLowerCase().includes(searchLower) ||
      (order.order_number &&
        order.order_number.toLowerCase().includes(searchLower));
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE,
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    completed: orders.filter((o) => o.status === "Completed").length,
    shipping: orders.filter((o) => o.status === "Shipping").length,
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-sm text-slate-500 font-medium">
            Loading orders...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {orders.length} total orders · {filteredOrders.length} shown
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon={ShoppingBag}
            color="bg-blue-600"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="bg-amber-500"
          />
          <StatCard
            label="Shipping"
            value={stats.shipping}
            icon={Truck}
            color="bg-violet-600"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="bg-emerald-600"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or order ID..."
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  statusFilter === s
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ShoppingBag size={40} className="mb-3 opacity-30" />
              <p className="font-semibold">No orders found</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Product
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Order
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={`group border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                              {order.items?.[0]?.product_image ? (
                                <img
                                  src={order.items[0].product_image}
                                  alt="product"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon
                                    size={16}
                                    className="text-slate-300"
                                  />
                                </div>
                              )}
                              {order.items?.length > 1 && (
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                  <span className="text-[9px] text-white font-black">
                                    +{order.items.length - 1}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[130px]">
                                {order.items?.[0]?.product_name || "No Product"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {order.items?.length} item
                                {order.items?.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-blue-600 font-mono">
                            {order.order_number}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {order.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone size={10} />
                            {order.phone}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">
                            ৳{Number(order.total_amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            +ship ৳{order.shipping_cost}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                              className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Eye size={15} />
                            </button>
                            <select
                              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-2 font-semibold text-slate-700 outline-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order.id, e.target.value)
                              }
                            >
                              {Object.keys(STATUS_CONFIG).map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          Showing{" "}
          {Math.min(
            (currentPage - 1) * ORDERS_PER_PAGE + 1,
            filteredOrders.length,
          )}
          –{Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of{" "}
          {filteredOrders.length} orders
        </p>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedOrder(null)
          }
        >
          <div className="bg-white w-full max-w-4xl rounded-[28px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-white/60">
            <div className="relative px-7 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#60a5fa,_transparent_35%)]" />
              <div className="relative flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
                    Order Details
                  </p>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {selectedOrder.order_number}
                  </h2>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <StatusBadge status={selectedOrder.status} />
                    <span className="text-xs text-slate-300 flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {new Date(selectedOrder.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
                <div className="p-4 border-t flex justify-end">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                  >
                    <Printer size={18} />
                    Print Shipping Sticker
                  </button>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-7 overflow-y-auto space-y-6 flex-1 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard icon={User} title="Customer Info">
                  <p className="text-base font-bold text-slate-900">
                    {selectedOrder.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <Phone size={14} className="text-blue-500" />
                    {selectedOrder.phone}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-start gap-2">
                    <MapPin size={14} className="text-blue-500 mt-0.5" />
                    <span>
                      {selectedOrder.address}, {selectedOrder.city}
                    </span>
                  </p>
                </InfoCard>

                <InfoCard icon={CreditCard} title="Payment Info">
                  <p className="text-base font-black text-slate-900 uppercase">
                    {selectedOrder.payment_method}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <Hash size={14} className="text-blue-500" />
                    Txn ID: {selectedOrder.transaction_id || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <Hash size={14} className="text-blue-500" />
                    Phone: {selectedOrder.sender_number || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <CircleDollarSign size={14} className="text-emerald-500" />
                    Total: ৳
                    {Number(selectedOrder.total_amount).toLocaleString()}
                  </p>
                </InfoCard>

                <InfoCard icon={Truck} title="Delivery Info">
                  <p className="text-base font-bold text-slate-900">
                    Sundarban Courier
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <Truck size={14} className="text-violet-500" />
                    Courier: Sundarban Courier
                  </p>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Delivery status: {selectedOrder.status}
                  </p>
                </InfoCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] mb-4 flex items-center gap-2">
                    <Package size={13} />
                    Ordered Products ({selectedOrder.items?.length || 0})
                  </h4>

                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon
                                  size={16}
                                  className="text-slate-300"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Unit Price: ৳{Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-900">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                            +{item.point_value * item.quantity} PV
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] flex items-center gap-2">
                      <BadgeDollarSign size={13} />
                      Order Summary
                    </h4>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-800">
                        ৳{Number(selectedOrder.subtotal).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Courier</span>
                      <span className="font-semibold text-slate-800">
                        Sundarban Courier
                      </span>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">
                        Total Payable
                      </span>
                      <span className="text-2xl font-black text-slate-900">
                        ৳{Number(selectedOrder.total_amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100 font-bold">
                          Payment Method
                        </p>
                        <p className="text-sm font-bold mt-1 uppercase">
                          {selectedOrder.payment_method}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-bold">
                    Admin Note
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Courier assigned:{" "}
                    <span className="font-semibold">Sundarban Courier</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    Current Status:
                  </span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "none" }}>
        <ShippingLabel ref={printRef} order={selectedOrder} />
      </div>
    </div>
  );
}
