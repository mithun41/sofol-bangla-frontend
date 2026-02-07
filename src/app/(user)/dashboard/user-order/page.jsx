"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import {
  Loader2,
  Package,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Image as ImageIcon,
  MapPin,
  CreditCard,
  X,
} from "lucide-react";
import Link from "next/link";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchMyOrders = async () => {
    try {
      const res = await api.get("orders/my-orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          icon: <CheckCircle2 size={14} />,
        };
      case "cancelled":
        return {
          color: "text-rose-600 bg-rose-50 border-rose-100",
          icon: <XCircle size={14} />,
        };
      case "pending":
        return {
          color: "text-amber-600 bg-amber-50 border-amber-100",
          icon: <Clock size={14} />,
        };
      default:
        return {
          color: "text-blue-600 bg-blue-50 border-blue-100",
          icon: <Package size={14} />,
        };
    }
  };

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Purchase History
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Track and manage your recent orders
          </p>
        </div>
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 text-white">
          <ShoppingBag size={24} />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 font-bold text-lg">No orders found!</p>
          <p className="text-slate-400 text-sm mb-6">
            Looks like you haven't ordered anything yet.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group flex flex-col md:flex-row items-center gap-6"
              >
                {/* Product Preview Image */}
                <div className="relative w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                  {order.items?.[0]?.product_image ? (
                    <img
                      src={order.items[0].product_image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  {order.items?.length > 1 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-black uppercase">
                      +{order.items.length - 1} More
                    </div>
                  )}
                </div>

                {/* Order Meta */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-black text-slate-800 text-lg">
                    {order.order_number}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={12} /> {order.payment_method}
                    </span>
                  </div>
                </div>

                {/* Status and Price */}
                <div className="flex flex-col items-center md:items-end gap-2">
                  <span
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${status.color}`}
                  >
                    {status.icon} {order.status}
                  </span>
                  <p className="text-xl font-black text-slate-800 tracking-tighter">
                    ৳{order.total_amount}
                  </p>
                </div>

                <div className="hidden md:block text-slate-300 group-hover:text-blue-500 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">
                Order{" "}
                <span className="text-blue-600 tracking-tighter">
                  {selectedOrder.order_number}
                </span>
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-8">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Shipping Details
                  </h4>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed flex gap-2">
                    <MapPin size={16} className="text-blue-500 shrink-0" />
                    {selectedOrder.address}, {selectedOrder.city}
                  </p>
                </div>
                <div className="p-5 bg-slate-900 rounded-3xl text-white">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    Payment Summary
                  </h4>
                  <p className="text-sm font-black uppercase">
                    {selectedOrder.payment_method}
                  </p>
                  <p className="text-[10px] text-blue-400 mt-1 font-bold italic">
                    TxID: {selectedOrder.transaction_id || "Cash on Delivery"}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Order Summary
                </h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                        <img
                          src={item.product_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                          {item.product_name}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">
                        ৳{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Card */}
              <div className="p-6 bg-blue-600 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-blue-100">
                <div>
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black tracking-tighter italic">
                    ৳{selectedOrder.total_amount}
                  </p>
                </div>
                <div className="text-right text-[10px] font-bold text-blue-100/60 uppercase">
                  <p>Points Earned</p>
                  <p className="text-xl text-white font-black italic">
                    {selectedOrder.items?.reduce(
                      (acc, item) => acc + item.point_value * item.quantity,
                      0,
                    )}{" "}
                    PV
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
