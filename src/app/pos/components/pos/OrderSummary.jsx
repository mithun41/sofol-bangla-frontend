"use client";

import {
  Receipt, Zap, User2, CheckCircle2, Tag,
  Percent, Minus, DollarSign, PauseCircle,
} from "lucide-react";

export default function OrderSummary({
  selectedCustomer,
  subtotal,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  discountAmount,
  payable,
  cashTendered,
  setCashTendered,
  tendered,
  changeAmount,
  handleCheckout,
  holdOrder,
  isSubmitting,
  formatBDT,
  cartLength,
}) {
  const isMember = selectedCustomer?.status?.toLowerCase() === "active";
  const isShort  = tendered > 0 && tendered < payable;

  // Quick cash buttons
  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden sticky top-20 shadow-xl shadow-slate-200">

      {/* ── Customer row ── */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-800">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Customer</p>
        {selectedCustomer ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {(selectedCustomer.name || selectedCustomer.username || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">
                {selectedCustomer.name || selectedCustomer.username}
              </p>
              <p className="text-[9px] font-semibold text-slate-500">{selectedCustomer.phone}</p>
            </div>
            <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 ${isMember ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
              {isMember ? "MEMBER" : "INACTIVE"}
            </span>
          </div>
        ) : (
          <p className="text-xs font-bold text-slate-600 italic">No customer selected</p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* ── Subtotal ── */}
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-semibold">Subtotal</span>
          <span className="font-black text-white">{formatBDT(subtotal)}</span>
        </div>

        {/* ── Discount ── */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Discount <span className="text-slate-700 normal-case font-semibold">(F4)</span></p>
          <div className="flex gap-2">
            {/* Type toggle */}
            <div className="flex bg-slate-800 rounded-xl p-1 gap-1 shrink-0">
              <button
                onClick={() => setDiscountType("flat")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${discountType === "flat" ? "bg-slate-600 text-white" : "text-slate-500"}`}
              >
                <Minus size={10} /> BDT
              </button>
              <button
                onClick={() => setDiscountType("percent")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${discountType === "percent" ? "bg-slate-600 text-white" : "text-slate-500"}`}
              >
                <Percent size={10} /> %
              </button>
            </div>
            <input
              id="discount-input"
              type="number"
              min="0"
              placeholder={discountType === "percent" ? "0%" : "0.00"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1 bg-slate-800 text-white rounded-xl px-3 py-2 text-xs font-black outline-none focus:ring-1 focus:ring-slate-600 placeholder:text-slate-600"
            />
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <Tag size={10} /> Discount applied
              </span>
              <span className="font-black text-emerald-400">- {formatBDT(discountAmount)}</span>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-slate-800" />

        {/* ── Payable ── */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Payable Amount</p>
          <p className="text-5xl font-black text-white tracking-tight leading-none">{formatBDT(payable)}</p>
          {isMember && cartLength > 0 && (
            <p className="text-[9px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
              <CheckCircle2 size={9} /> Member discount applied
            </p>
          )}
        </div>

        {/* ── Cash Tendered ── */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Cash Received <span className="text-slate-700 normal-case font-semibold">(F6)</span></p>
          <input
            id="cash-input"
            type="number"
            min="0"
            placeholder="Enter cash amount..."
            value={cashTendered}
            onChange={(e) => setCashTendered(e.target.value)}
            className={`w-full bg-slate-800 rounded-xl px-4 py-3 text-sm font-black outline-none transition-all placeholder:text-slate-600 ${
              isShort ? "text-rose-400 ring-1 ring-rose-500" : tendered >= payable && tendered > 0 ? "text-emerald-400 ring-1 ring-emerald-600" : "text-white"
            }`}
          />

          {/* Quick amount buttons */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCashTendered(String(payable))}
              className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black"
            >
              Exact
            </button>
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setCashTendered(String(Math.ceil(payable / amt) * amt))}
                className="px-2.5 py-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-[9px] font-black transition-all"
              >
                {amt >= 1000 ? `${amt/1000}k` : amt}
              </button>
            ))}
          </div>

          {/* Cash status */}
          {tendered > 0 && (
            <div className="space-y-1.5">
              {isShort ? (
                <div className="flex justify-between text-xs bg-rose-900/20 rounded-xl px-3 py-2">
                  <span className="text-rose-400 font-bold">Short by</span>
                  <span className="font-black text-rose-400">{formatBDT(payable - tendered)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-xs bg-emerald-900/20 rounded-xl px-3 py-2">
                  <span className="text-emerald-400 font-bold">Change</span>
                  <span className="font-black text-emerald-400 text-base">{formatBDT(changeAmount)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Items count ── */}
        {cartLength > 0 && (
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 bg-slate-800 rounded-xl px-4 py-2.5">
            <span>Items in cart</span>
            <span className="font-black text-white">{cartLength}</span>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="space-y-2.5">
          {/* Checkout */}
          <button
            onClick={handleCheckout}
            disabled={cartLength === 0 || isSubmitting || isShort}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${
              cartLength === 0 || isSubmitting || isShort
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40"
            }`}
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : (
              <><Receipt size={15} /> F8 — Finish Sale</>
            )}
          </button>

          {/* Hold */}
          <button
            onClick={holdOrder}
            disabled={cartLength === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <PauseCircle size={13} /> F9 — Hold Order
          </button>
        </div>
      </div>
    </div>
  );
}