"use client";
import React, { useEffect, useState } from "react";
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
  CheckCircle,
  Phone,
  Search,
  Image as ImageIcon,
  MoreHorizontal,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      title: "Are you sure?",
      text: `Do you want to change status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, update it!",
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`orders/admin-update/${id}/`, { status: newStatus });
        fetchOrders();
        Swal.fire("Updated!", "Order status has been updated.", "success");
      } catch (err) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.name.toLowerCase().includes(searchLower) ||
      (order.order_number &&
        order.order_number.toLowerCase().includes(searchLower))
    );
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Order <span className="text-blue-600">Management</span>
          </h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or order ID..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    Product
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    Order Details
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    Customer
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {/* 1st Column: Product Photo */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                          {order.items?.[0]?.product_image ? (
                            <img
                              src={order.items[0].product_image}
                              alt="product"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          {order.items?.length > 1 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-[10px] text-white font-black">
                                +{order.items.length - 1}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="max-w-[150px]">
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {order.items?.[0]?.product_name || "No Product"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {order.items?.length} items
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <p className="text-sm font-black text-blue-600">
                        {order.order_number}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="p-5">
                      <p className="text-sm font-bold text-slate-700">
                        {order.name}
                      </p>
                      <p className="text-xs text-slate-400">{order.phone}</p>
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border 
                        ${
                          order.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : order.status === "Cancelled"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={18} />
                        </button>
                        <select
                          className="text-xs bg-white border border-slate-200 rounded-xl px-2 py-2 font-bold outline-none cursor-pointer focus:border-blue-500 shadow-sm"
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order.id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipping">Shipping</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col scale-in-center">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">
                Order{" "}
                <span className="text-blue-600">
                  {selectedOrder.order_number}
                </span>
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User size={14} /> Customer Details
                  </h4>
                  <p className="font-bold text-slate-800">
                    {selectedOrder.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedOrder.phone}
                  </p>
                  <p className="text-xs text-slate-400 mt-3 flex items-start gap-1">
                    <MapPin size={14} className="text-blue-500" />{" "}
                    {selectedOrder.address}, {selectedOrder.city}
                  </p>
                </div>

                <div className="p-5 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-100">
                  <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CreditCard size={14} /> Payment Info
                  </h4>
                  <p className="text-lg font-black uppercase">
                    {selectedOrder.payment_method}
                  </p>
                  <p className="text-[10px] opacity-80 mt-1">
                    Transaction ID: {selectedOrder.transaction_id || "N/A"}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Package size={14} /> Product List
                </h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                        <img
                          src={item.product_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {item.product_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          QTY: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">
                        ৳{item.price * item.quantity}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-bold">
                        +{item.point_value * item.quantity} PV
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Summary */}
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black italic">
                    ৳{selectedOrder.total_amount}
                  </p>
                </div>
                <div className="text-right text-[10px] opacity-50 font-bold">
                  <p>Subtotal: ৳{selectedOrder.subtotal}</p>
                  <p>Shipping: ৳{selectedOrder.shipping_cost}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
