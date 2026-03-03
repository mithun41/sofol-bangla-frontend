"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();

  // ১. গ্র্যান্ড সাবটোটাল ক্যালকুলেশন (এপিআই থেকে আসা item_subtotal ব্যবহার করে)
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.item_subtotal || 0),
    0,
  );

  // ২. লোডিং স্টেট
  if (loading && cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-600 font-bold animate-pulse">
          Syncing your cart with server...
        </p>
      </div>
    );
  }

  // ৩. কার্ট খালি থাকলে ভিউ
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <ShoppingBag size={80} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          আপনার কার্টটি খালি!
        </h2>
        <p className="text-slate-500 mt-2 text-center">
          কেনাকাটা শুরু করতে নিচের বাটনে ক্লিক করুন।
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          কেনাকাটা শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
          {loading && (
            <Loader2 className="animate-spin text-emerald-500" size={20} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 p-6 bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-6">প্রোডাক্ট ডিটেইলস</div>
                <div className="col-span-3 text-center">পরিমাণ</div>
                <div className="col-span-3 text-right">সাবটোটাল</div>
              </div>

              <div className="divide-y divide-slate-50">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId || item.id}
                    className="p-6 grid grid-cols-1 md:grid-cols-12 items-center gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img
                          src={item.image} // Context-এ যেভাবে ম্যাপ করেছিস
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                            PV: {item.point_value || 0}
                          </span>
                          <span className="text-sm font-medium text-slate-400">
                            একক মূল্য: ৳{Number(item.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, -1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-black text-slate-800 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, 1)
                          }
                          className="p-1.5 hover:bg-white rounded-lg"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="col-span-3 text-right flex items-center justify-end gap-4">
                      <div className="text-right">
                        <span className="block font-black text-slate-900 text-lg">
                          ৳{Number(item.item_subtotal).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.cartItemId)}
                        className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-6">
              <h2 className="text-xl font-black text-slate-800 mb-6">
                অর্ডার সামারি
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">সাবটোটাল</span>
                  <span className="text-slate-900 font-bold">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    ডেলিভারি চার্জ
                  </span>
                  <span className="text-slate-400 text-sm italic">
                    চেকআউট পেজে যুক্ত হবে
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-800">মোট</span>
                  <span className="text-3xl font-black text-emerald-600">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                চেকআউট করুন <ArrowRight size={20} />
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Real-time Price Synced
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
