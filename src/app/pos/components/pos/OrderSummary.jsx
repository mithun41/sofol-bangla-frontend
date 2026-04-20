"use client";

import { Receipt, Zap, User2, CheckCircle2 } from "lucide-react";

export default function OrderSummary({
  selectedCustomer,
  dynamicSubtotal,
  handleCheckout,
  isSubmitting,
  formatBDT,
  cartLength,
}) {
  const isMember = selectedCustomer?.status?.toLowerCase() === "active";

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden sticky top-8 shadow-xl shadow-slate-200">
      {/* ── Top summary area ── */}
      <div className="p-6 space-y-5">
        {/* Section label */}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          Transaction Summary
        </p>

        {/* Customer row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <User2 size={13} />
            <span className="text-xs font-semibold">Customer</span>
          </div>
          {selectedCustomer ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">
                {(selectedCustomer.name || selectedCustomer.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span className="text-xs font-bold text-blue-400 truncate max-w-[120px]">
                {selectedCustomer.name ||
                  selectedCustomer.username ||
                  "Customer"}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-600">— Guest —</span>
          )}
        </div>

        {/* Benefit row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap size={13} />
            <span className="text-xs font-semibold">Benefit</span>
          </div>
          <span
            className={`text-xs font-bold ${
              isMember ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {isMember ? "2× PV Discount" : "Points Collection"}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* Grand Total */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
            Grand Total
          </p>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-black text-white tracking-tight leading-none">
              {formatBDT(dynamicSubtotal)}
            </span>
          </div>
          {isMember && cartLength > 0 && (
            <p className="text-[10px] font-semibold text-emerald-500 mt-2 flex items-center gap-1">
              <CheckCircle2 size={10} />
              Member discounts applied
            </p>
          )}
        </div>
      </div>

      {/* ── Action area ── */}
      <div className="px-6 pb-6 space-y-3">
        {/* Items count pill */}
        {cartLength > 0 && (
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 bg-slate-800 rounded-xl px-4 py-2.5">
            <span>Items in cart</span>
            <span className="font-black text-white">{cartLength}</span>
          </div>
        )}

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          disabled={cartLength === 0 || isSubmitting}
          className={`
            w-full flex items-center justify-center gap-2.5
            py-4 rounded-xl font-black text-sm uppercase tracking-widest
            transition-all active:scale-[0.98]
            ${
              cartLength === 0 || isSubmitting
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 cursor-pointer"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Receipt size={15} />
              Finish Sale
            </>
          )}
        </button>

        <p className="text-center text-[10px] font-semibold text-slate-700">
          Tax & point calculations are processed automatically
        </p>
      </div>
    </div>
  );
}