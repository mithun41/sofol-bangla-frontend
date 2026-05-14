"use client";
import { X, RotateCcw, Trash2, ShoppingCart } from "lucide-react";

export default function HeldOrders({ orders, onRestore, onDelete, onClose, formatBDT }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏸</span>
            <div>
              <p className="font-black text-slate-800 text-sm">Held Orders</p>
              <p className="text-[10px] text-slate-400 font-semibold">{orders.length} order{orders.length !== 1 ? "s" : ""} on hold</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No held orders</p>
            </div>
          ) : (
            orders.map((order) => {
              const total = order.cart.reduce((s, i) => s + Number(i.price || 0) * i.quantity, 0);
              return (
                <div key={order.id} className="px-6 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm truncate">{order.label}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {order.customer?.name || order.customer?.username || "No customer"} · {order.cart.length} items
                      </p>
                      <p className="text-xs font-black text-blue-600 mt-1">{formatBDT(total)}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => onRestore(order)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-colors"
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                      <button
                        onClick={() => onDelete(order.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}